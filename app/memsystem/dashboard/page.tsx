"use client";

import { useEffect, useState, useCallback } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

/* ---------- types ---------- */
type DashboardData = {
  total: number;
  ready: number;
  repair: number;
  broken: number;
  missing: number;
};

/* ---------- hospital theme ---------- */
const COLORS = [
  "#22C55E", // พร้อมใช้งาน
  "#FACC15", // รอซ่อม
  "#EF4444", // ชำรุด
  "#9CA3AF", // ตรวจไม่พบ
];

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  /* ---------- load dashboard ---------- */
  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/memsystem/api/dashboard", {
        cache: "no-store",
      });

      if (!res.ok) throw new Error("fetch failed");

      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error("Load dashboard failed", err);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  /* ---------- initial load ---------- */
  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  /* ---------- re-fetch when tab active ---------- */
  useEffect(() => {
    const onFocus = () => loadDashboard();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [loadDashboard]);

  /* ---------- loading / error ---------- */
  if (loading) {
    return <div className="p-6">กำลังโหลดข้อมูล...</div>;
  }

  if (!data) {
    return (
      <div className="p-6 text-red-500">
        ไม่สามารถโหลดข้อมูล Dashboard ได้
      </div>
    );
  }

  /* ---------- chart data ---------- */
  const chartData = [
    { name: "พร้อมใช้งาน", value: data.ready },
    { name: "รอซ่อม", value: data.repair },
    { name: "ชำรุด", value: data.broken },
    { name: "ตรวจไม่พบ", value: data.missing },
  ];

  return (
    <div className="p-6 space-y-8 bg-slate-50 min-h-screen">
      {/* ---------- Summary Cards ---------- */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card title="ครุภัณฑ์ทั้งหมด" value={data.total} color="text-teal-700" />
        <Card title="พร้อมใช้งาน" value={data.ready} color="text-green-600" />
        <Card title="รอซ่อม" value={data.repair} color="text-yellow-600" />
        <Card title="ชำรุด" value={data.broken} color="text-red-600" />
        <Card title="ตรวจไม่พบ" value={data.missing} color="text-gray-500" />
      </div>

      {/* ---------- Chart + Table ---------- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ---------- Donut Chart ---------- */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow p-6">
          <h3 className="font-semibold text-lg mb-6 text-teal-700">
            สัดส่วนสถานะครุภัณฑ์ (%)
          </h3>

          <div className="w-full h-[420px]">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  innerRadius={120}
                  outerRadius={180}
                  paddingAngle={3}
                  label={({ percent }) =>
                    percent && percent > 0
                      ? `${(percent * 100).toFixed(1)}%`
                      : ""
                  }
                >
                  {chartData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i]} />
                  ))}
                </Pie>

                <Tooltip
                  formatter={(value: number | string) => [
                    `${value} รายการ`,
                    "จำนวน",
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ---------- Summary Table ---------- */}
        <div className="bg-white rounded-2xl shadow p-6">
          <h3 className="font-semibold text-lg mb-4 text-teal-700">
            ตารางสรุปสถานะ
          </h3>

          <table className="w-full text-sm">
            <tbody>
              {chartData.map((row, i) => (
                <tr key={row.name} className="border-b last:border-0">
                  <td className="py-3 flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full inline-block"
                      style={{ backgroundColor: COLORS[i] }}
                    />
                    {row.name}
                  </td>
                  <td className="py-3 text-right font-semibold">
                    {row.value}
                  </td>
                </tr>
              ))}
              <tr className="font-bold text-base">
                <td className="py-3">รวมทั้งหมด</td>
                <td className="py-3 text-right">{data.total}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ---------- Card component ---------- */
function Card({
  title,
  value,
  color,
}: {
  title: string;
  value: number;
  color?: string;
}) {
  return (
    <div className="bg-white rounded-2xl shadow p-5">
      <div className="text-sm text-gray-500 mb-1">{title}</div>
      <div className={`text-3xl font-bold ${color ?? "text-gray-800"}`}>
        {value}
      </div>
    </div>
  );
}
