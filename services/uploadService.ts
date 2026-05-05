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

export async function uploadProfileImage(file: File): Promise<{ upload_id?: number; file_url?: string }>{
  // Resize/compress first
  const blob = await resizeImageFile(file, 800, 0.78);
  const fd = new FormData();
  // DocumentSerializer expects 'file' field
  fd.append("file", blob, file.name.replace(/\s+/g, "_") || "profile.jpg");
  // Helpful metadata for server
  fd.append("document_type", "profile_photo");
  fd.append("entity_type", "employee");

  const base = process.env.NEXT_PUBLIC_API_BASE_URL || "/api";
  const resp = await fetch(`${base}/uploads/`, {
    method: "POST",
    body: fd,
  });
  if (!resp.ok) {
    const txt = await resp.text();
    throw new Error(txt || "Upload failed");
  }
  return resp.json();
}
