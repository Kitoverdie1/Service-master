"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

/* ================= Type ================= */
type Asset = {
  asset_id?: string;
  asset_code: string;
  lab_tool_code?: string;
  asset_name: string;
  asset_type: string;
  status: string;
  acquired_date?: string;
  price?: number;
  department?: string;
  responsible_person?: string;
};

/* ================= Page ================= */
export default function AssetDetailPage() {
  const params = useParams();
  const router = useRouter();

  const assetCode =
    typeof params.asset_code === "string"
      ? decodeURIComponent(params.asset_code)
      : "";

  const [asset, setAsset] = useState<Asset | null>(null);
  const [form, setForm] = useState<Asset | null>(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  /* ================= โหลดข้อมูล ================= */
  useEffect(() => {
    if (!assetCode) return;

    setLoading(true);

    fetch(`/memsystem/api/assets/${encodeURIComponent(assetCode)}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          setAsset(json.data);
          setForm(json.data);
        } else {
          setAsset(null);
        }
      })
      .catch(() => setAsset(null))
      .finally(() => setLoading(false));
  }, [assetCode]);

  /* ================= บันทึก ================= */
  const handleSave = async () => {
    if (!form) return;

    setSaving(true);

    const res = await fetch(
      `/memsystem/api/assets/${encodeURIComponent(assetCode)}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      }
    );

    const json = await res.json();

    if (json.success) {
      setAsset(form);
      setEditing(false);
      alert("✅ บันทึกข้อมูลเรียบร้อย");
    } else {
      alert("❌ บันทึกไม่สำเร็จ");
    }

    setSaving(false);
  };

  /* ================= ลบ ================= */
  const handleDelete = async () => {
    if (!assetCode) return;

    const ok = confirm(
      `⚠️ ต้องการลบครุภัณฑ์ ${assetCode} ใช่หรือไม่?\nการลบไม่สามารถย้อนกลับได้`
    );
    if (!ok) return;

    const res = await fetch(
      `/memsystem/api/assets/${encodeURIComponent(assetCode)}`,
      { method: "DELETE" }
    );

    const json = await res.json();

    if (json.success) {
      alert("🗑️ ลบข้อมูลเรียบร้อยแล้ว");
      router.push("/memsystem/assets");
    } else {
      alert(json.message || "❌ ลบไม่สำเร็จ");
    }
  };

  if (loading) return <div className="p-6">⏳ กำลังโหลด...</div>;
  if (!asset || !form)
    return <div className="p-6 text-red-600">❌ ไม่พบข้อมูล</div>;

  /* ================= Field ================= */
  const Field = ({
    label,
    name,
    type = "text",
    disabled = false,
  }: {
    label: string;
    name: keyof Asset;
    type?: string;
    disabled?: boolean;
  }) => (
    <div>
      <label className="font-semibold block mb-1">{label}</label>

      {editing ? (
        <input
          type={type}
          disabled={disabled}
          value={(form[name] ?? "") as any}
          onChange={(e) =>
            setForm({
              ...form,
              [name]:
                type === "number"
                  ? Number(e.target.value)
                  : e.target.value,
            })
          }
          className={`border p-2 rounded w-full ${
            disabled ? "bg-gray-100" : ""
          }`}
        />
      ) : (
        <div className="p-2 bg-gray-50 rounded">
          {asset[name] || "-"}
        </div>
      )}
    </div>
  );

  /* ================= UI ================= */
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">รายละเอียดครุภัณฑ์</h1>

      <div className="bg-white rounded shadow p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <Field label="Asset ID" name="asset_id" disabled />
          <Field label="Asset Code" name="asset_code" disabled />
          <Field label="รหัสเครื่องมือห้องปฏิบัติการ" name="lab_tool_code" />
          <Field label="ชื่อครุภัณฑ์" name="asset_name" />
          <Field label="ประเภท" name="asset_type" />
          <Field label="สถานะ" name="status" />
        </div>

        <div className="space-y-4">
          <Field label="วันที่ได้มา" name="acquired_date" type="date" />
          <Field label="ราคา" name="price" type="number" />
          <Field label="หน่วยงาน" name="department" />
          <Field label="ผู้รับผิดชอบ" name="responsible_person" />
        </div>
      </div>

      <div className="flex gap-3 mt-6 flex-wrap">
        <button
          onClick={() => router.back()}
          className="px-4 py-2 border rounded"
        >
          🔙 กลับ
        </button>

        <Link
          href={`/memsystem/assets/${encodeURIComponent(
            asset.asset_code
          )}/repairs`}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          🛠 แจ้งซ่อม
        </Link>

        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="px-4 py-2 bg-yellow-500 text-white rounded"
          >
            ✏️ แก้ไข
          </button>
        ) : (
          <>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-green-600 text-white rounded"
            >
              💾 บันทึก
            </button>
            <button
              onClick={() => {
                setForm(asset);
                setEditing(false);
              }}
              className="px-4 py-2 border rounded"
            >
              ❌ ยกเลิก
            </button>
          </>
        )}

        {/* 🔴 ปุ่มลบ */}
        <button
          onClick={handleDelete}
          className="px-4 py-2 bg-red-600 text-white rounded"
        >
          🗑️ ลบ
        </button>
      </div>
    </div>
  );
}
