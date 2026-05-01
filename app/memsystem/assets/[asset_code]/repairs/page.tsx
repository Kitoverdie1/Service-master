"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

/* =======================
   TYPE
======================= */
type Asset = {
  asset_id: string;
  asset_code: string;
  asset_name: string;
  asset_type: string;
  status: string;
};

export default function RepairPage() {
  const params = useParams();
  const router = useRouter();

  const assetCode =
    typeof params.asset_code === "string"
      ? decodeURIComponent(params.asset_code)
      : "";

  const [asset, setAsset] = useState<Asset | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    reporter: "ผู้ดูแลระบบ (Admin)",
    repair_status: "NEW",
    repair_date: "",
    repair_note: "",
  });

  const [images, setImages] = useState<File[]>([]);

  /* =======================
     LOAD ASSET
  ======================= */
  useEffect(() => {
    if (!assetCode) return;

    fetch(`/memsystem/api/assets/${encodeURIComponent(assetCode)}`, {
      cache: "no-store",
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setAsset(json.data);
        else setAsset(null);
      })
      .catch(() => setAsset(null))
      .finally(() => setLoading(false));
  }, [assetCode]);

  /* =======================
     HANDLE IMAGE
  ======================= */
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setImages(Array.from(e.target.files));
  };

  /* =======================
     SAVE REPAIR
  ======================= */
  const handleSave = async () => {
    if (!asset) return;

    setSaving(true);

    try {
      const formData = new FormData();
      formData.append("asset_code", asset.asset_code);
      formData.append("repair_status", form.repair_status);
      formData.append("repair_note", form.repair_note);
      formData.append("reporter", form.reporter);
      formData.append("repair_date", form.repair_date || "");

      images.forEach((file) => {
        formData.append("images", file);
      });

      const res = await fetch("/memsystem/api/repairs", {
        method: "POST",
        body: formData,
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        alert(result.message || "❌ บันทึกข้อมูลไม่สำเร็จ");
        return;
      }

      alert("✅ บันทึกแจ้งซ่อมเรียบร้อย");
      router.back();
    } catch {
      alert("❌ ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6">⏳ กำลังโหลดข้อมูล...</div>;
  if (!asset) return <div className="p-6 text-red-600">❌ ไม่พบข้อมูลครุภัณฑ์</div>;

  /* =======================
     UI
  ======================= */
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">แจ้งซ่อมครุภัณฑ์</h1>

      {/* ===== Asset Info ===== */}
      <div className="bg-white rounded-lg shadow p-6 grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Field label="Asset ID" value={asset.asset_id} />
        <Field label="Asset Code" value={asset.asset_code} />
        <Field label="ชื่อครุภัณฑ์" value={asset.asset_name} />
        <Field label="ประเภท" value={asset.asset_type} />
        <Field label="สถานะปัจจุบัน" value={asset.status} />
      </div>

      {/* ===== Repair Form ===== */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="font-bold mb-4">ข้อมูลการแจ้งซ่อม</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="ผู้แจ้งซ่อม"
            value={form.reporter}
            onChange={(v) => setForm({ ...form, reporter: v })}
          />

          <div>
            <label className="text-sm font-semibold">สถานะแจ้งซ่อม</label>
            <select
              className="w-full border rounded px-3 py-2"
              value={form.repair_status}
              onChange={(e) =>
                setForm({ ...form, repair_status: e.target.value })
              }
            >
              <option value="NEW">ยังไม่เคยแจ้งซ่อม</option>
              <option value="WAITING">แจ้งซ่อมแล้ว - รอยืนยัน</option>
              <option value="IN_PROGRESS">กำลังซ่อม</option>
              <option value="DONE">ซ่อมเสร็จ</option>
              <option value="DISPOSED">ปลดระวาง</option>
            </select>
          </div>

          <Input
            label="วันที่แจ้งซ่อม"
            type="date"
            value={form.repair_date}
            onChange={(v) => setForm({ ...form, repair_date: v })}
          />
        </div>

        <div className="mt-4">
          <label className="text-sm font-semibold">หมายเหตุการซ่อม</label>
          <textarea
            className="w-full border rounded px-3 py-2"
            rows={4}
            value={form.repair_note}
            onChange={(e) =>
              setForm({ ...form, repair_note: e.target.value })
            }
          />
        </div>

        {/* ===== Upload Image ===== */}
        <div className="mt-4">
          <label className="text-sm font-semibold">แนบรูปภาพ</label>
          <input
            type="file"
            multiple
            accept="image/*"
            className="block mt-2"
            onChange={handleImageChange}
          />

          {images.length > 0 && (
            <div className="grid grid-cols-3 gap-3 mt-3">
              {images.map((img, i) => (
                <img
                  key={i}
                  src={URL.createObjectURL(img)}
                  className="h-28 object-cover rounded border"
                />
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={() => router.back()}
            className="px-4 py-2 border rounded"
          >
            ยกเลิก
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-blue-600 text-white rounded"
          >
            {saving ? "กำลังบันทึก..." : "บันทึกแจ้งซ่อม"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* =======================
   COMPONENTS
======================= */
function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-sm text-gray-500 mb-1">{label}</div>
      <div className="border rounded px-3 py-2 bg-gray-50">
        {value || "-"}
      </div>
    </div>
  );
}

function Input({
  label,
  value,
  type = "text",
  onChange,
}: {
  label: string;
  value: string;
  type?: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="text-sm font-semibold">{label}</label>
      <input
        type={type}
        className="w-full border rounded px-3 py-2"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
