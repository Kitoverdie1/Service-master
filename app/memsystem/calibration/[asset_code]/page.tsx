"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

/* ========================
        TYPE
======================== */
type StatusType = "ไม่ระบุ" | "ปกติ" | "ใกล้ครบกำหนด" | "เกินกำหนด";

type CalibrationDetail = {
  asset_code: string;
  last_calibration: string | null; // ค.ศ.
  next_calibration: string | null; // ค.ศ.
  status: StatusType;
};

/* ========================
        PAGE
======================== */
export default function CalibrationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const asset_code = params.asset_code as string;

  const [data, setData] = useState<CalibrationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // state สำหรับแก้ไข
  const [lastDate, setLastDate] = useState("");
  const [nextDate, setNextDate] = useState("");

  /* ========================
        FETCH DATA
======================== */
  useEffect(() => {
    if (!asset_code) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/memsystem/api/calibration/${asset_code}`,
          { cache: "no-store" }
        );

        if (!res.ok) throw new Error("โหลดข้อมูลไม่สำเร็จ");

        const json = await res.json();

        const status = calcStatus(json.next_calibration);

        setData({
          asset_code: json.asset_code,
          last_calibration: json.last_calibration,
          next_calibration: json.next_calibration,
          status,
        });

        // ใส่ค่าเข้า input (ต้องเป็น ค.ศ.)
        setLastDate(toInputDate(json.last_calibration));
        setNextDate(toInputDate(json.next_calibration));
      } catch (err) {
        console.error(err);
        setError("ไม่สามารถโหลดข้อมูลได้");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [asset_code]);

  /* ========================
        SAVE
======================== */
  const handleSave = async () => {
    if (!asset_code) return;

    setSaving(true);
    try {
      const res = await fetch(
        `/memsystem/api/calibration/${asset_code}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            last_calibration: lastDate || null,
            next_calibration: nextDate || null,
          }),
        }
      );

      if (!res.ok) throw new Error("บันทึกไม่สำเร็จ");

      // โหลดใหม่เพื่ออัปเดตสถานะ + ตาราง
      router.refresh();
      alert("✅ บันทึกข้อมูลเรียบร้อย");
    } catch (err) {
      console.error(err);
      alert("❌ ไม่สามารถบันทึกข้อมูลได้");
    } finally {
      setSaving(false);
    }
  };

  /* ========================
        UI STATE
======================== */
  if (loading) return <div className="p-6">⏳ กำลังโหลด...</div>;

  if (error)
    return (
      <div className="p-6 text-red-600">
        {error}
        <div className="mt-4">
          <Link
            href="/memsystem/calibration"
            className="underline text-blue-600"
          >
            ← กลับหน้ารายการ
          </Link>
        </div>
      </div>
    );

  if (!data) return <div className="p-6">ไม่พบข้อมูล</div>;

  /* ========================
        MAIN UI
======================== */
  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <h1 className="text-xl font-bold">
        รายละเอียดการสอบเทียบ : {data.asset_code}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* แก้ไขได้ */}
        <InputDate
          label="สอบเทียบล่าสุด"
          value={lastDate}
          onChange={setLastDate}
        />

        <InputDate
          label="สอบเทียบครั้งถัดไป"
          value={nextDate}
          onChange={setNextDate}
        />

        <StatusInfo status={calcStatus(nextDate)} />
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
        >
          {saving ? "กำลังบันทึก..." : "บันทึก"}
        </button>

        <Link
          href="/memsystem/calibration"
          className="px-6 py-2 border rounded-lg bg-white"
        >
          ยกเลิก
        </Link>
      </div>
    </div>
  );
}

/* ========================
    COMPONENTS
======================== */
function InputDate({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="border rounded-xl p-4 bg-white shadow-sm">
      <div className="text-sm text-gray-500 mb-1">{label}</div>
      <input
        type="date"
        className="border rounded px-3 py-2 w-full"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function StatusInfo({ status }: { status: StatusType }) {
  const color =
    status === "ปกติ"
      ? "bg-green-100 text-green-700"
      : status === "ใกล้ครบกำหนด"
      ? "bg-yellow-100 text-yellow-700"
      : status === "เกินกำหนด"
      ? "bg-red-100 text-red-700"
      : "bg-gray-100 text-gray-600";

  return (
    <div className="border rounded-xl p-4 bg-white shadow-sm md:col-span-2">
      <div className="text-sm text-gray-500">สถานะ</div>
      <span
        className={`inline-block mt-2 px-4 py-1 rounded-full text-sm ${color}`}
      >
        {status}
      </span>
    </div>
  );
}

/* ========================
    UTIL
======================== */
function toInputDate(d: string | null) {
  if (!d) return "";
  return d.split("T")[0];
}

function calcStatus(next: string | null): StatusType {
  if (!next) return "ไม่ระบุ";

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const nextDate = new Date(next.split("T")[0]);
  nextDate.setHours(0, 0, 0, 0);

  const diff =
    (nextDate.getTime() - today.getTime()) / 86400000;

  if (diff < 0) return "เกินกำหนด";
  if (diff <= 30) return "ใกล้ครบกำหนด";
  return "ปกติ";
}
