"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

/* ======================== TYPE ======================== */
type Calibration = {
  id: number;
  asset_code: string;
  asset_name: string | null;
  last_calibration?: string | null;
  next_calibration?: string | null;
};

type StatusType = "ไม่ระบุ" | "ปกติ" | "ใกล้ครบกำหนด" | "เกินกำหนด";

/* ======================== PAGE ======================== */
export default function CalibrationPage() {
  const [data, setData] = useState<Calibration[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);

  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [month, setMonth] = useState<number | "all">("all");
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] =
    useState<StatusType | "ทั้งหมด">("ทั้งหมด");

  const [chartMonth, setChartMonth] = useState<number | null>(null);

  /* ======================== FETCH ======================== */
  const fetchData = async () => {
    setLoading(true);
    const res = await fetch("/memsystem/api/calibration");
    const json = await res.json();
    setData(Array.isArray(json) ? json : json.data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedAsset) setChartMonth(null);
  }, [selectedAsset]);

  /* ======================== IMPORT EXCEL ======================== */
  const handleImportExcel = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    await fetch("/memsystem/api/calibration/import", {
      method: "POST",
      body: formData,
    });

    fetchData();
  };

  /* ======================== EXPORT EXCEL (เพิ่มใหม่) ======================== */
  const handleExportExcel = () => {
    const rows = filteredData.map(d => ({
      รหัสครุภัณฑ์: d.asset_code,
      ชื่อครุภัณฑ์: d.asset_name ?? "",
      สอบเทียบล่าสุด: formatDate(d.last_calibration),
      สอบเทียบถัดไป: formatDate(d.next_calibration),
      สถานะ: getStatus(d.next_calibration),
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Calibration");

    const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(
      new Blob([buffer]),
      `calibration_${year + 543}.xlsx`
    );
  };

  /* ======================== UTIL ======================== */
  const getStatus = (next?: string | null): StatusType => {
    if (!next) return "ไม่ระบุ";
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const d = new Date(next);
    const diff = (d.getTime() - today.getTime()) / 86400000;
    if (diff < 0) return "เกินกำหนด";
    if (diff <= 30) return "ใกล้ครบกำหนด";
    return "ปกติ";
  };

  const statusColor = (s: StatusType) => {
    if (s === "ปกติ") return "bg-green-100 text-green-700";
    if (s === "ใกล้ครบกำหนด") return "bg-yellow-100 text-yellow-700";
    if (s === "เกินกำหนด") return "bg-red-100 text-red-700";
    return "bg-gray-100 text-gray-600";
  };

  const formatDate = (d?: string | null) =>
    d ? new Date(d).toLocaleDateString("th-TH") : "-";

  /* ======================== FILTER DATA ======================== */
  const filteredData = useMemo(() => {
    return data.filter(d => {
      if (d.next_calibration) {
        const dt = new Date(d.next_calibration);
        if (dt.getFullYear() !== year) return false;
        if (month !== "all" && dt.getMonth() + 1 !== month) return false;
        if (chartMonth !== null && dt.getMonth() !== chartMonth) return false;
      }

      if (search) {
        const q = search.toLowerCase();
        if (
          !d.asset_code.toLowerCase().includes(q) &&
          !d.asset_name?.toLowerCase().includes(q)
        )
          return false;
      }

      if (filterStatus !== "ทั้งหมด") {
        if (getStatus(d.next_calibration) !== filterStatus) return false;
      }

      return true;
    });
  }, [data, year, month, search, filterStatus, chartMonth]);

  /* ======================== SUMMARY ======================== */
  const summary = useMemo(() => {
    const s = { total: 0, normal: 0, warning: 0, expired: 0, unknown: 0 };
    filteredData.forEach(d => {
      s.total++;
      const st = getStatus(d.next_calibration);
      if (st === "ปกติ") s.normal++;
      else if (st === "ใกล้ครบกำหนด") s.warning++;
      else if (st === "เกินกำหนด") s.expired++;
      else s.unknown++;
    });
    return s;
  }, [filteredData]);

  /* ======================== CHART ======================== */
  const monthlyData = useMemo(() => {
    const months = Array.from({ length: 12 }).map((_, i) => ({
      idx: i,
      label: new Date(year, i).toLocaleDateString("th-TH", { month: "short" }),
      normal: 0,
      warning: 0,
      expired: 0,
    }));

    data.forEach(d => {
      if (!d.next_calibration) return;
      const dt = new Date(d.next_calibration);
      if (dt.getFullYear() !== year) return;
      const s = getStatus(d.next_calibration);
      if (s === "ปกติ") months[dt.getMonth()].normal++;
      if (s === "ใกล้ครบกำหนด") months[dt.getMonth()].warning++;
      if (s === "เกินกำหนด") months[dt.getMonth()].expired++;
    });

    return months;
  }, [data, year]);

  if (loading) return <p className="p-6">กำลังโหลดข้อมูล...</p>;

  /* ======================== UI ======================== */
  return (
    <div className="p-6 space-y-6 bg-gray-50">
      <div className="bg-white p-6 rounded-2xl shadow flex justify-between">
        <div>
          <h1 className="text-2xl font-bold">แผนสอบเทียบ</h1>
          <p className="text-sm text-gray-500">
            สรุปสถานะการสอบเทียบเครื่องมือแพทย์
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleExportExcel}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm"
          >
            Export Excel
          </button>

          <label className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm cursor-pointer">
            Import Excel
            <input
              type="file"
              accept=".xlsx,.xls"
              hidden
              onChange={e =>
                e.target.files && handleImportExcel(e.target.files[0])
              }
            />
          </label>

          <Link
            href="/memsystem/calibration/add"
            className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm"
          >
            + เพิ่มรายการ
          </Link>
        </div>
      </div>

      {/* FILTER */}
      <div className="bg-white p-4 rounded-2xl shadow flex flex-wrap gap-3">
        <select
          value={year}
          onChange={e => setYear(Number(e.target.value))}
          className="border rounded px-3 py-2 text-sm"
        >
          {[year - 1, year, year + 1].map(y => (
            <option key={y} value={y}>
              ปี {y + 543}
            </option>
          ))}
        </select>

        <select
          value={month}
          onChange={e =>
            setMonth(e.target.value === "all" ? "all" : Number(e.target.value))
          }
          className="border rounded px-3 py-2 text-sm"
        >
          <option value="all">ทุกเดือน</option>
          {Array.from({ length: 12 }).map((_, i) => (
            <option key={i} value={i + 1}>
              {new Date(0, i).toLocaleDateString("th-TH", { month: "short" })}
            </option>
          ))}
        </select>

        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="ค้นหา รหัส / ชื่อ"
          className="border rounded px-3 py-2 text-sm w-64"
        />
      </div>

      {/* SUMMARY */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Summary title="ทั้งหมด" value={summary.total} />
        <Summary title="เกินกำหนด" value={summary.expired} color="red" />
        <Summary title="ใกล้ครบ" value={summary.warning} color="yellow" />
        <Summary title="ปกติ" value={summary.normal} color="green" />
        <Summary title="ไม่ระบุ" value={summary.unknown} />
      </div>

      {/* CHART */}
      <div className="bg-white p-4 rounded-2xl shadow">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={monthlyData}
            onClick={s => {
              if (!s?.activeLabel) return;
              const m = monthlyData.find(x => x.label === s.activeLabel);
              setChartMonth(prev => (prev === m?.idx ? null : m?.idx ?? null));
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="normal" name="ปกติ" fill="#22C55E" />
            <Bar dataKey="warning" name="ใกล้ครบกำหนด" fill="#FACC15" />
            <Bar dataKey="expired" name="เกินกำหนด" fill="#EF4444" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">รหัส</th>
              <th>ชื่อ</th>
              <th>สอบเทียบล่าสุด</th>
              <th>สอบเทียบถัดไป</th>
              <th>สถานะ</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map(d => {
              const s = getStatus(d.next_calibration);
              return (
                <tr
                  key={d.id}
                  className="border-t hover:bg-blue-50 cursor-pointer"
                  onClick={() => setSelectedAsset(d.asset_code)}
                >
                  <td className="p-3">{d.asset_code}</td>
                  <td>{d.asset_name}</td>
                  <td>{formatDate(d.last_calibration)}</td>
                  <td>{formatDate(d.next_calibration)}</td>
                  <td>
                    <span
                      className={`px-3 py-1 rounded-full text-xs ${statusColor(
                        s
                      )}`}
                    >
                      {s}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {selectedAsset && (
        <CalibrationDetail
          assetCode={selectedAsset}
          onClose={() => setSelectedAsset(null)}
          onSaved={fetchData}
        />
      )}
    </div>
  );
}

/* ======================== DETAIL MODAL ======================== */
function CalibrationDetail({
  assetCode,
  onClose,
  onSaved,
}: {
  assetCode: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch(`/memsystem/api/calibration/${assetCode}`)
      .then(r => r.json())
      .then(setData);
  }, [assetCode]);

  if (!data) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-lg">
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <h2 className="font-semibold">รายละเอียดครุภัณฑ์ : {assetCode}</h2>
          <button onClick={onClose}>✕</button>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="md:col-span-2">
            <label className="text-gray-500">ชื่อเครื่อง</label>
            <input
              value={data.asset_name ?? ""}
              disabled
              className="w-full border rounded px-3 py-2 bg-gray-100"
            />
          </div>

          <div>
            <label className="text-gray-500">สอบเทียบล่าสุด</label>
            <input
              type="date"
              value={data.last_calibration ?? ""}
              onChange={e =>
                setData({ ...data, last_calibration: e.target.value })
              }
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="text-gray-500">สอบเทียบถัดไป</label>
            <input
              type="date"
              value={data.next_calibration ?? ""}
              onChange={e =>
                setData({ ...data, next_calibration: e.target.value })
              }
              className="w-full border rounded px-3 py-2"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-lg text-gray-600"
          >
            ยกเลิก
          </button>
          <button
            onClick={async () => {
              await fetch(`/memsystem/api/calibration/${assetCode}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
              });
              onSaved();
              onClose();
            }}
            className="px-5 py-2 bg-green-600 text-white rounded-lg"
          >
            บันทึก
          </button>
        </div>
      </div>
    </div>
  );
}

/* ======================== SUMMARY CARD ======================== */
function Summary({
  title,
  value,
  color = "blue",
}: {
  title: string;
  value: number;
  color?: "blue" | "green" | "yellow" | "red";
}) {
  const map = {
    blue: "text-blue-600",
    green: "text-green-600",
    yellow: "text-yellow-600",
    red: "text-red-600",
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow">
      <p className="text-sm text-gray-500">{title}</p>
      <p className={`text-3xl font-bold ${map[color]}`}>{value}</p>
    </div>
  );
}

