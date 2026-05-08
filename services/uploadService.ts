import { getAccessTokenKey } from "./apiClient";

export async function resizeImageFile(file: File, maxWidth = 800, quality = 0.75): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      try {
        const scale = Math.min(1, maxWidth / img.width);
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Canvas not supported");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else reject(new Error("Failed to convert canvas to blob"));
          },
          "image/jpeg",
          quality
        );
      } catch (err) {
        reject(err);
      } finally {
        URL.revokeObjectURL(url);
      }
    };
    img.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(new Error("Invalid image file"));
    };
    img.src = url;
  });
}

export async function uploadProfileImage(
  file: File, 
  onProgress?: (percent: number) => void
): Promise<{ upload_id?: number; file_url?: string }> {
  // Resize/compress first
  const blob = await resizeImageFile(file, 800, 0.78);
  const fd = new FormData();
  fd.append("file", blob, file.name.replace(/\s+/g, "_") || "profile.jpg");
  fd.append("document_type", "profile_photo");
  fd.append("entity_type", "employee");

  const sendRequest = (withAuth: boolean) => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const base = (process.env.NEXT_PUBLIC_API_BASE_URL || "/api").replace(/\/$/, "");
      xhr.open("POST", `${base}/uploads/`);
      
      if (withAuth) {
        const token = typeof window !== "undefined" ? window.localStorage.getItem(getAccessTokenKey()) : null;
        if (token) {
          xhr.setRequestHeader("Authorization", `Bearer ${token}`);
        }
      }

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable && onProgress) {
          const percent = Math.round((e.loaded / e.total) * 100);
          onProgress(percent);
        }
      };

      xhr.onload = async () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            resolve(JSON.parse(xhr.responseText));
          } catch (e) {
            resolve({});
          }
        } else if (xhr.status === 401 && withAuth) {
          // If 401 (Unauthorized) and we sent a token, try one more time WITHOUT the token
          // since /api/uploads/ POST is a public endpoint.
          console.warn("Upload 401 with token, retrying without auth...");
          try {
            const retryRes = await sendRequest(false);
            resolve(retryRes);
          } catch (err) {
            reject(err);
          }
        } else {
          reject(new Error(xhr.responseText || `Upload failed with status ${xhr.status}`));
        }
      };

      xhr.onerror = () => reject(new Error("Network error"));
      xhr.send(fd);
    });
  };

  return sendRequest(true) as Promise<{ upload_id?: number; file_url?: string }>;
}
