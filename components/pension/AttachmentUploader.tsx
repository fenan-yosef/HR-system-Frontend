"use client";
import React, { useState } from "react";

interface Props {
  files?: File[];
  onChange?: (files: File[]) => void;
}

export default function AttachmentUploader({ files = [], onChange }: Props) {
  const [internal, setInternal] = useState<File[]>(files || []);

  const handleFiles = (fList: FileList | null) => {
    if (!fList) return;
    const added = Array.from(fList);
    const next = [...internal, ...added];
    setInternal(next);
    onChange?.(next);
  };

  const removeAt = (idx: number) => {
    const next = internal.filter((_, i) => i !== idx);
    setInternal(next);
    onChange?.(next);
  };

  return (
    <div>
      <input type="file" multiple onChange={(e) => handleFiles(e.target.files)} />
      <ul>
        {internal.map((f, i) => (
          <li key={i} style={{ display: "flex", justifyContent: "space-between", maxWidth: 600 }}>
            <span>{f.name}</span>
            <button onClick={() => removeAt(i)}>Remove</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
