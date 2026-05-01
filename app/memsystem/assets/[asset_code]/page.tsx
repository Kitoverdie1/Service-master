"use client";

import { useEffect, useState } from "react";
import {
  useParams,
  useRouter,
  useSearchParams,
} from "next/navigation";
import Link from "next/link";
import { QRCodeCanvas } from "qrcode.react";

/* ================= TYPE ================= */
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

export default function AssetDetailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams<{ asset_code: string }>();

  /* ================= QR MODE ================= */
  const isQR = searchParams.get("qr") === "1";

  const assetCode = params.asset_code
    ? decodeURIComponent(params.asset_code)
    : "";

  const [asset, setAsset] = useState<Asset | null>(null);
  const [form, setForm] = useState<Asset | null>(null);

  // ❗ QR Mode → ห้ามเข้าโหมดแก้ไข
  const [editing, setEditing] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  /* ================= Load Data ================= */
  useEffect(() => {
    if (!assetCode) return;

    setLoading(true);

    fetch(`/memsystem/api/assets/${encodeURIComponent(assetCode)}`, {
      cache: "no-store",
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          setAsset(json.data);
          setForm(json.data);
          setImageUrl(`/uploads/assets/${json.data.asset_code}.jpg`);
        } else {
          setAsset(null);
        }
      })
      .catch(() => setAsset(null))
      .finally(() => setLoading(false));
  }, [assetCode]);

  /* ================= Upload Image ================= */
  const handleUploadImage = async (file: File) => {
    if (!assetCode || isQR) return;

    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);

    const res = await fetch(
      `/memsystem/api/assets/${encodeURIComponent(
        assetCode
      )}/upload-image`,
      { method: "POST", body: formData }
    );

    const json = await res.json();

    if (json.success) {
      setImageUrl(json.imageUrl + "?t=" + Date.now());
      alert("✅ อัปโหลดรูปเรียบร้อย");
    } else {
      alert("❌ อัปโหลดไม่สำเร็จ");
    }

    setUploading(false);
  };

  /* ================= Save ================= */
  const handleSave = async () => {
    if (!form || isQR) return;

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

  /* ================= Delete ================= */
  const handleDelete = async () => {
    if (!asset || isQR) return;

    const ok = confirm(
      `⚠️ ต้องการลบครุภัณฑ์ ${asset.asset_code} ใช่หรือไม่?`
    );
    if (!ok) return;

    const res = await fetch(
      `/memsystem/api/assets/${encodeURIComponent(
        asset.asset_code
      )}`,
      { method: "DELETE" }
    );

    const json = await res.json();

    if (json.success) {
      alert("🗑️ ลบข้อมูลเรียบร้อย");
      router.push("/memsystem/assets");
    } else {
      alert(json.message || "ลบไม่สำเร็จ");
    }
  };

  /* ================= State ================= */
  if (loading) return <div className="p-6">⏳ กำลังโหลด...</div>;
  if (!asset || !form)
    return <div className="p-6 text-red-600">❌ ไม่พบข้อมูล</div>;

  /* ================= QR URL ================= */
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ||
    (typeof window !== "undefined"
      ? window.location.origin
      : "");

  const qrUrl = `${baseUrl}/memsystem/assets/${encodeURIComponent(
    asset.asset_code
  )}?qr=1`;

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
          defaultValue={(form[name] ?? "") as any}
          onBlur={(e) =>
            setForm((prev) =>
              prev
                ? {
                    ...prev,
                    [name]:
                      type === "number"
                        ? Number(e.target.value)
                        : e.target.value,
                  }
                : prev
            )
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
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">
        รายละเอียดครุภัณฑ์
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ===== Detail ===== */}
        <div className="lg:col-span-2 bg-white rounded shadow p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
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

        {/* ===== Image + QR ===== */}
        <div className="space-y-6">
          <div className="bg-white rounded shadow p-4">
            <h3 className="font-bold mb-3">📷 รูปครุภัณฑ์</h3>

            {imageUrl ? (
              <img
                src={imageUrl}
                alt="asset"
                className="w-full rounded border mb-3 object-cover"
                onError={() => setImageUrl(null)}
              />
            ) : (
              <div className="w-full h-40 flex items-center justify-center border border-dashed rounded text-gray-400 mb-3">
                ยังไม่มีรูป
              </div>
            )}

            {!isQR && editing && (
              <label className="block cursor-pointer bg-blue-600 text-white py-2 rounded text-center">
                📤 อัปโหลด / เปลี่ยนรูป
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) =>
                    e.target.files &&
                    handleUploadImage(e.target.files[0])
                  }
                />
              </label>
            )}
          </div>

          <div className="bg-white rounded shadow p-4 flex flex-col items-center">
            <h3 className="font-bold mb-4">🔳 QR Code</h3>
            <QRCodeCanvas value={qrUrl} size={180} />
            <p className="text-xs mt-3 break-all text-gray-500 text-center">
              {qrUrl}
            </p>
          </div>
        </div>
      </div>

      {/* ===== Buttons ===== */}
      <div className="flex flex-wrap gap-3 mt-6">
        {!isQR && (
          <button
            onClick={() => router.back()}
            className="px-4 py-2 border rounded"
          >
            🔙 กลับ
          </button>
        )}

        <Link
          href={`/memsystem/assets/${encodeURIComponent(
            asset.asset_code
          )}/repairs${isQR ? "?qr=1" : ""}`}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          🛠 แจ้งซ่อม
        </Link>

        {!isQR && !editing && (
          <>
            <button
              onClick={() => setEditing(true)}
              className="px-4 py-2 bg-yellow-500 text-white rounded"
            >
              ✏️ แก้ไข
            </button>

            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 text-white rounded"
            >
              🗑️ ลบ
            </button>
          </>
        )}

        {!isQR && editing && (
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
      </div>
    </div>
  );
}
