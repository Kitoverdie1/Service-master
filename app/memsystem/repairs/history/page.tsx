"use client";

import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

/* =======================
   TYPE
======================= */
type RepairHistoryItem = {
  ticket_id: number;
  asset_code: string;
  asset_name: string | null;
  note: string | null;
  status_name: string | null;
  reported_by: string | null;
  reported_at: string;
  confirmed_by: string | null;
  confirmed_at: string | null;
};

/* =======================
   FORMAT DATE (❌ ไม่มีเวลา)
======================= */
const formatDateTH = (value?: string | null) => {
  if (!value) return "-";
  const date = new Date(value);
  if (isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("th-TH", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

/* =======================
   STATUS COLOR
======================= */
const statusClass = (status?: string | null) => {
  if (!status) return "bg-gray-400";
  if (status.includes("ซ่อมเสร็จ")) return "bg-green-600";
  if (status.includes("กำลัง")) return "bg-blue-500";
  if (status.includes("รอ")) return "bg-yellow-500";
  return "bg-gray-500";
};

export default function RepairHistoryPage() {
  const [data, setData] = useState<RepairHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* =======================
     FETCH HISTORY
  ======================= */
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch("/memsystem/api/repairs/history", {
          cache: "no-store",
        });

        if (!res.ok) {
          throw new Error("ไม่สามารถโหลดข้อมูลประวัติการซ่อมได้");
        }

        const json = await res.json();
        const rows = Array.isArray(json) ? json : [];

        const mapped: RepairHistoryItem[] = rows.map((r: any) => ({
          ticket_id: r.ticket_id,
          asset_code: r.asset_code,
          asset_name: r.asset_name,
          note: r.symptom,
          status_name: r.status,
          reported_by: r.reported_by,
          reported_at: r.reported_at,
          confirmed_by: r.confirmed_by,
          confirmed_at: r.confirmed_at,
        }));

        setData(mapped);
      } catch (err: any) {
        setError(err.message || "เกิดข้อผิดพลาด");
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  /* =======================
     EXPORT EXCEL
  ======================= */
  const exportExcel = () => {
    if (data.length === 0) {
      alert("ไม่มีข้อมูลสำหรับ Export");
      return;
    }

    const rows = data.map((r, i) => ({
      ลำดับ: i + 1,
      รหัสครุภัณฑ์: r.asset_code,
      ชื่อครุภัณฑ์: r.asset_name || "",
      อาการ: r.note || "",
      สถานะ: r.status_name || "",
      ผู้แจ้ง: r.reported_by || "",
      วันที่แจ้ง: formatDateTH(r.reported_at),
      ผู้ปิดงาน: r.confirmed_by || "",
      วันที่ปิดงาน: formatDateTH(r.confirmed_at),
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "ประวัติการซ่อม");

    const excelBuffer = XLSX.write(wb, {
      bookType: "xlsx",
      type: "array",
    });

    const file = new Blob([excelBuffer], {
      type:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(file, `repair-history-${Date.now()}.xlsx`);
  };

  /* =======================
     UI
  ======================= */
  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">📜 ประวัติการซ่อม</h1>

        <button
          onClick={exportExcel}
          className="rounded bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700"
        >
          📥 Export Excel
        </button>
      </div>

      {error && (
        <div className="rounded bg-red-100 px-4 py-2 text-red-700">
          ❌ {error}
        </div>
      )}

      {loading ? (
        <p className="text-gray-500">⏳ กำลังโหลดข้อมูล...</p>
      ) : data.length === 0 ? (
        <p className="text-gray-500">ไม่มีประวัติการซ่อม</p>
      ) : (
        <div className="overflow-auto rounded border bg-white">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border p-2">รหัสครุภัณฑ์</th>
                <th className="border p-2">ชื่อครุภัณฑ์</th>
                <th className="border p-2">อาการ</th>
                <th className="border p-2">สถานะ</th>
                <th className="border p-2">ผู้แจ้ง</th>
                <th className="border p-2">วันที่แจ้ง</th>
                <th className="border p-2">ผู้ปิดงาน</th>
                <th className="border p-2">วันที่ปิดงาน</th>
              </tr>
            </thead>
            <tbody>
              {data.map((r) => (
                <tr key={r.ticket_id}>
                  <td className="border p-2">{r.asset_code}</td>
                  <td className="border p-2">{r.asset_name || "-"}</td>
                  <td className="border p-2">{r.note || "-"}</td>
                  <td className="border p-2 text-center">
                    <span
                      className={`rounded px-2 py-1 text-xs text-white ${statusClass(
                        r.status_name
                      )}`}
                    >
                      {r.status_name}
                    </span>
                  </td>
                  <td className="border p-2 text-center">
                    {r.reported_by || "-"}
                  </td>
                  <td className="border p-2 text-center">
                    {formatDateTH(r.reported_at)}
                  </td>
                  <td className="border p-2 text-center">
                    {r.confirmed_by || "-"}
                  </td>
                  <td className="border p-2 text-center">
                    {formatDateTH(r.confirmed_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
