"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

/* =======================
   INPUT COMPONENT
======================= */
const Input = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  readOnly = false,
}: {
  label: string;
  name: string;
  type?: string;
  value: string;
  readOnly?: boolean;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
}) => (
  <div>
    <label className="block font-semibold mb-1">{label}</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      readOnly={readOnly}
      className={`w-full border p-2 rounded ${
        readOnly ? "bg-gray-100" : "bg-gray-50"
      }`}
    />
  </div>
);

/* =======================
   PAGE
======================= */
export default function NewAssetPage() {
  const router = useRouter();

  /* ===== prefix ===== */
  const [prefix, setPrefix] = useState("LAB-AS-EQ");

  /* ===== loading ===== */
  const [loadingCode, setLoadingCode] = useState(false);
  const [saving, setSaving] = useState(false);

  /* ===== form ===== */
  const [form, setForm] = useState({
    asset_id: "",
    asset_code: "",
    asset_name: "",
    asset_type: "",
    status: "ใช้งาน",
    received_date: "",
    price: "",
    department: "",
    owner: "",
    current_location: "",
  });

  /* =======================
     FETCH NEXT ASSET CODE
  ======================= */
  const fetchNextAssetCode = async (selectedPrefix: string) => {
    setLoadingCode(true);
    setForm((prev) => ({ ...prev, asset_code: "กำลังสร้าง..." }));

    try {
      const res = await fetch(
        `/memsystem/api/assets/next-code?prefix=${selectedPrefix}`,
        { cache: "no-store" }
      );

      const json = await res.json();

      if (!json.success || !json.asset_code) {
        throw new Error("cannot generate asset code");
      }

      setForm((prev) => ({
        ...prev,
        asset_code: json.asset_code,
      }));
    } catch (err) {
      console.error("FETCH NEXT CODE ERROR:", err);
      alert("❌ ไม่สามารถสร้าง Asset Code ได้");
      setForm((prev) => ({ ...prev, asset_code: "" }));
    } finally {
      setLoadingCode(false);
    }
  };

  /* ✅ สร้าง Asset Code อัตโนมัติ */
  useEffect(() => {
    fetchNextAssetCode(prefix);
  }, [prefix]);

  /* =======================
     HANDLE CHANGE
  ======================= */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  /* =======================
     SUBMIT
  ======================= */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.asset_code || loadingCode || saving) {
      alert("⏳ กรุณารอ Asset Code");
      return;
    }

    setSaving(true);

    const payload = {
      ...form,
      price: form.price ? Number(form.price) : null,
      received_date: form.received_date || null,
    };

    try {
      const res = await fetch("/memsystem/api/assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("save error");

      alert("✅ เพิ่มครุภัณฑ์เรียบร้อย");

      // ✅ จุดสำคัญ: ส่งสัญญาณให้ Dashboard โหลดข้อมูลใหม่
      router.push("/memsystem/dashboard?refresh=1");
    } catch (err) {
      console.error(err);
      alert("❌ เพิ่มข้อมูลไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  };

  /* =======================
     UI
  ======================= */
  return (
    <div className="p-6">
      <div className="bg-white p-6 rounded shadow max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">เพิ่มครุภัณฑ์</h1>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* PREFIX */}
            <div>
              <label className="block font-semibold mb-1">
                กลุ่ม Asset
              </label>
              <select
                value={prefix}
                onChange={(e) => setPrefix(e.target.value)}
                className="w-full border p-2 rounded bg-gray-50"
              >
                <option value="LAB-AS-EQ">LAB-AS-EQ</option>
                <option value="LAB-AS-GN">LAB-AS-GN</option>
              </select>
            </div>

            <Input
              label="Asset ID"
              name="asset_id"
              value={form.asset_id}
              onChange={handleChange}
            />

            <Input
              label="Asset Code (อัตโนมัติ)"
              name="asset_code"
              value={form.asset_code}
              onChange={handleChange}
              readOnly
            />

            <Input
              label="ชื่อครุภัณฑ์"
              name="asset_name"
              value={form.asset_name}
              onChange={handleChange}
            />

            <Input
              label="ประเภท"
              name="asset_type"
              value={form.asset_type}
              onChange={handleChange}
            />

            <div>
              <label className="block font-semibold mb-1">สถานะ</label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full border p-2 rounded bg-gray-50"
              >
                <option value="ใช้งาน">ใช้งาน</option>
                <option value="ชำรุด">ชำรุด</option>
                <option value="จำหน่าย">จำหน่าย</option>
              </select>
            </div>

            <Input
              label="วันที่ได้มา"
              name="received_date"
              type="date"
              value={form.received_date}
              onChange={handleChange}
            />

            <Input
              label="ราคา"
              name="price"
              type="number"
              value={form.price}
              onChange={handleChange}
            />

            <Input
              label="หน่วยงาน"
              name="department"
              value={form.department}
              onChange={handleChange}
            />

            <Input
              label="ผู้รับผิดชอบ"
              name="owner"
              value={form.owner}
              onChange={handleChange}
            />

            <Input
              label="สถานที่ใช้ปัจจุบัน"
              name="current_location"
              value={form.current_location}
              onChange={handleChange}
            />
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="submit"
              disabled={loadingCode || saving}
              className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              {saving ? "กำลังบันทึก..." : "บันทึก"}
            </button>

            <button
              type="button"
              onClick={() => router.back()}
              className="border px-4 py-2 rounded"
            >
              ยกเลิก
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
