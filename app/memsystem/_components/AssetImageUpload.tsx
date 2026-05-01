"use client";

import { useState } from "react";

export default function AssetImageUpload({
  assetCode,
  currentImage,
}: {
  assetCode: string;
  currentImage?: string;
}) {
  const [preview, setPreview] = useState(currentImage);
  const [loading, setLoading] = useState(false);

  const handleUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);

    const res = await fetch(
      `/memsystem/api/assets/${assetCode}/upload-image`,
      {
        method: "POST",
        body: formData,
      }
    );

    const json = await res.json();
    if (json.success) {
      setPreview(json.imageUrl);
    }

    setLoading(false);
  };

  return (
    <div className="space-y-2">
      {preview && (
        <img
          src={preview}
          className="w-48 rounded border"
          alt="asset"
        />
      )}

      <input
        type="file"
        accept="image/*"
        onChange={(e) =>
          e.target.files && handleUpload(e.target.files[0])
        }
      />

      {loading && <p>กำลังอัปโหลด...</p>}
    </div>
  );
}
