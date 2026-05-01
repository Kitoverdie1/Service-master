"use client";

import { useCallback, useEffect, useState } from "react";

/* =======================
   TYPE
======================= */
type RepairItem = {
  ticket_id: number;
  asset_id: number;
  asset_code: string;
  asset_name: string | null;
  status_name: "WAITING_APPROVAL" | "IN_PROGRESS" | "COMPLETED";
  note: string | null;
  reported_by: string | null;
  reported_at: string;
  confirmed_by?: string | null;
  confirmed_at?: string | null;
};

type RepairGroup = {
  waiting: RepairItem[];
  inProgress: RepairItem[];
  
};

export default function RepairDashboardPage() {
  const [data, setData] = useState<RepairGroup>({
    waiting: [],
    inProgress: [],
  });

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<RepairItem | null>(null);

  /* =======================
     FETCH DATA
  ======================= */
  const fetchRepairs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const fetchByStatus = async (status: string) => {
        const res = await fetch(
          `/memsystem/api/repairs?status_name=${status}`,
          { cache: "no-store" }
        );
        if (!res.ok) throw new Error(`โหลดข้อมูล ${status} ไม่สำเร็จ`);
        const json = await res.json();
        return Array.isArray(json.data) ? json.data : [];
      };

      const [waiting, inProgress] = await Promise.all([
        fetchByStatus("WAITING_APPROVAL"),
        fetchByStatus("IN_PROGRESS"),
      ]);

      setData({ waiting, inProgress });
    } catch (err: any) {
      setError(err.message || "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRepairs();
  }, [fetchRepairs]);

  /* =======================
     ACTIONS
  ======================= */
  const approveRepair = async (ticketId: number) => {
    if (!confirm("ยืนยันการอนุมัติแจ้งซ่อม ?")) return;

    try {
      setActionLoading(true);

      const res = await fetch(
        `/memsystem/api/repairs/${ticketId}/approve`,
        { method: "PATCH" }
      );

      if (!res.ok) throw new Error("อนุมัติไม่สำเร็จ");
      await fetchRepairs();
    } catch (err: any) {
      alert(err.message || "เกิดข้อผิดพลาด");
    } finally {
      setActionLoading(false);
    }
  };

  const completeRepair = async (ticketId: number) => {
    if (!confirm("ยืนยันว่าซ่อมเสร็จแล้ว ?")) return;

    try {
      setActionLoading(true);

      const res = await fetch(
        `/memsystem/api/repairs/${ticketId}/complete`,
        { method: "PATCH" }
      );

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "ปิดงานไม่สำเร็จ");

      // ✅ OPTIMISTIC UPDATE (หัวใจของการแก้ปัญหา)
      setData(prev => {
        const finished = prev.inProgress.find(
          r => r.ticket_id === ticketId
        );
        if (!finished) return prev;

        return {
          ...prev,
          inProgress: prev.inProgress.filter(
            r => r.ticket_id !== ticketId
          ),
        };
      });

      setSelected(null); // ปิด modal ทันที
      alert("✅ ปิดงานเรียบร้อย");

      // sync backend อีกรอบ (กันข้อมูลคลาดเคลื่อน)
      fetchRepairs();
    } catch (err: any) {
      alert(err.message || "เกิดข้อผิดพลาด");
    } finally {
      setActionLoading(false);
    }
  };

  /* =======================
     UI
  ======================= */
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">แจ้งซ่อม / บำรุงรักษา</h1>

      {error && (
        <div className="rounded bg-red-100 px-4 py-2 text-red-700">
          ❌ {error}
        </div>
      )}

      {/* SUMMARY */}
      <div className="grid grid-cols-3 gap-4">
        <SummaryCard title="รออนุมัติ" count={data.waiting.length} />
        <SummaryCard title="กำลังดำเนินการ" count={data.inProgress.length} />
      </div>

      {/* WAITING */}
      <Section title="รายการรออนุมัติ">
        {loading ? (
          <Loading />
        ) : data.waiting.length === 0 ? (
          <Empty />
        ) : (
          <table className="w-full border text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border p-2">รหัส</th>
                <th className="border p-2">ชื่อ</th>
                <th className="border p-2">ผู้แจ้ง</th>
                <th className="border p-2">อาการ</th>
                <th className="border p-2 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {data.waiting.map(r => (
                <tr key={r.ticket_id}>
                  <td className="border p-2">{r.asset_code}</td>
                  <td className="border p-2">{r.asset_name}</td>
                  <td className="border p-2">{r.reported_by}</td>
                  <td className="border p-2">{r.note}</td>
                  <td className="border p-2 text-right">
                    <button
                      disabled={actionLoading}
                      onClick={() => approveRepair(r.ticket_id)}
                      className="rounded bg-blue-600 px-3 py-1 text-white"
                    >
                      อนุมัติ
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Section>

      {/* IN PROGRESS */}
      <Section title="กำลังดำเนินการ">
        {data.inProgress.length === 0 ? (
          <Empty />
        ) : (
          data.inProgress.map(r => (
            <Card key={r.ticket_id}>
              <div className="font-semibold">
                🔧 {r.asset_code} — {r.asset_name}
              </div>
              <div className="text-gray-600">อาการ: {r.note}</div>

              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => setSelected(r)}
                  className="rounded bg-gray-200 px-3 py-1 text-sm"
                >
                  ดูรายละเอียด
                </button>
                <button
                  disabled={actionLoading}
                  onClick={() => completeRepair(r.ticket_id)}
                  className="rounded bg-green-600 px-3 py-1 text-sm text-white"
                >
                  ซ่อมเสร็จแล้ว
                </button>
              </div>
            </Card>
          ))
        )}
      </Section>

      {/* MODAL */}
      {selected && (
        <DetailModal
          item={selected}
          onClose={() => setSelected(null)}
          onComplete={completeRepair}
          loading={actionLoading}
        />
      )}
    </div>
  );
}

/* =======================
   COMPONENTS
======================= */
function DetailModal({
  item,
  onClose,
  onComplete,
  loading,
}: {
  item: RepairItem;
  onClose: () => void;
  onComplete: (id: number) => void;
  loading: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-lg rounded bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold">รายละเอียดแจ้งซ่อม</h3>

        <div className="space-y-1 text-sm">
          <p>รหัส: {item.asset_code}</p>
          <p>ชื่อ: {item.asset_name}</p>
          <p>ผู้แจ้ง: {item.reported_by}</p>
          <p>อาการ: {item.note}</p>
          <p>
            วันที่แจ้ง:{" "}
            {new Date(item.reported_at).toLocaleString("th-TH")}
          </p>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onClose} className="rounded bg-gray-300 px-4 py-1">
            ปิด
          </button>
          <button
            disabled={loading}
            onClick={() => onComplete(item.ticket_id)}
            className="rounded bg-green-600 px-4 py-1 text-white"
          >
            ซ่อมเสร็จแล้ว
          </button>
        </div>
      </div>
    </div>
  );
}

const SummaryCard = ({ title, count }: any) => (
  <div className="rounded bg-gray-50 p-4">
    <div className="text-sm">{title}</div>
    <div className="text-3xl font-bold">{count}</div>
  </div>
);

const Section = ({ title, children }: any) => (
  <div className="rounded bg-white p-4 shadow">
    <h2 className="mb-3 font-semibold">{title}</h2>
    {children}
  </div>
);

const Card = ({ children }: any) => (
  <div className="rounded border p-3 text-sm">{children}</div>
);

const Loading = () => <p className="text-gray-500">⏳ กำลังโหลด...</p>;
const Empty = () => <p className="text-gray-500">ไม่มีรายการ</p>;
