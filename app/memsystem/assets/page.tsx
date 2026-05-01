"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

/* =======================
   TYPE (ตรงกับ API)
======================= */
type Asset = {
  asset_id: string | null;
  asset_code: string;
  asset_name: string | null;
  asset_type: string | null;
  current_location: string | null;
  responsible_person: string | null;
  status: string | null;
};

export default function AssetsPage() {
  const router = useRouter();

  const [assets, setAssets] = useState<Asset[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  /* =======================
     LOAD DATA
  ======================= */
  const fetchAssets = async (pageNumber: number, keyword = "") => {
    try {
      const res = await fetch(
        `/memsystem/api/assets?page=${pageNumber}&limit=20&search=${encodeURIComponent(
          keyword
        )}`,
        { cache: "no-store" }
      );

      if (!res.ok) throw new Error("โหลดข้อมูลไม่สำเร็จ");

      const json = await res.json();
      if (!json.success) throw new Error(json.message || "API error");

      setAssets(Array.isArray(json.data) ? json.data : []);
      setTotalPages(Math.max(1, Number(json.totalPages) || 1));
    } catch (err) {
      console.error("❌ fetchAssets error:", err);
      setAssets([]);
      setTotalPages(1);
    }
  };

  useEffect(() => {
    fetchAssets(page, search);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  useEffect(() => {
    setPage(1);
    fetchAssets(1, search);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  /* =======================
     IMPORT EXCEL
  ======================= */
  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/memsystem/api/assets/import", {
        method: "POST",
        body: formData,
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.message || "นำเข้าไฟล์ไม่สำเร็จ");
      }

      setMessage(result.message || "✅ นำเข้าไฟล์สำเร็จ");
      setPage(1);
      fetchAssets(1, search);
    } catch (err: any) {
      setMessage("❌ " + err.message);
    } finally {
      setLoading(false);
      e.target.value = "";
    }
  };

  /* =======================
     UI
  ======================= */
  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">รายการครุภัณฑ์</h1>

        <button
          onClick={() => router.push("/memsystem/assets/add")}
          className="px-4 py-2 bg-green-600 text-white rounded"
        >
          + เพิ่มรายการ
        </button>
      </div>

      {/* Tools */}
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <div className="flex gap-3">
          <label className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg cursor-pointer">
            📥 Import Excel
            <input
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={handleImport}
            />
          </label>

          <button
            onClick={() =>
              (window.location.href = "/memsystem/api/assets/export")
            }
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg"
          >
            📤 Export Excel
          </button>
        </div>

        <input
          type="text"
          placeholder="🔍 ค้นหา Asset / ชื่อ / ประเภท / สถานที่ / ผู้รับผิดชอบ / สถานะ"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border px-3 py-2 rounded w-96"
        />

        {loading && <span>⏳ กำลังนำเข้า...</span>}
      </div>

      {message && (
        <div className="mb-4 p-3 border rounded bg-gray-50">
          {message}
        </div>
      )}

      {/* Table */}
      <table className="w-full border border-collapse text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">Asset ID</th>
            <th className="border p-2">Asset Code</th>
            <th className="border p-2">ชื่อครุภัณฑ์</th>
            <th className="border p-2">ประเภท</th>
            <th className="border p-2">สถานที่ใช้งาน</th>
            <th className="border p-2">ผู้รับผิดชอบ</th>
            <th className="border p-2">สถานะ</th>
            <th className="border p-2 w-24">จัดการ</th>
          </tr>
        </thead>

        <tbody>
          {assets.length === 0 ? (
            <tr>
              <td colSpan={8} className="text-center p-4 text-gray-500">
                ไม่พบข้อมูล
              </td>
            </tr>
          ) : (
            assets.map((asset, idx) => (
              <tr
                key={`${asset.asset_code}-${idx}`}
                className="hover:bg-gray-50"
              >
                <td className="border p-2">
                  {asset.asset_id || "-"}
                </td>
                <td className="border p-2 text-blue-700">
                  {asset.asset_code}
                </td>
                <td className="border p-2">
                  {asset.asset_name || "-"}
                </td>
                <td className="border p-2">
                  {asset.asset_type || "-"}
                </td>
                <td className="border p-2">
                  {asset.current_location || "-"}
                </td>
                <td className="border p-2">
                  {asset.responsible_person || "-"}
                </td>
                <td className="border p-2">
                  {asset.status || "-"}
                </td>
                <td className="border p-2 text-center">
                  <button
                    onClick={() =>
                      router.push(
                        `/memsystem/assets/${encodeURIComponent(
                          asset.asset_code
                        )}`
                      )
                    }
                    className="text-blue-600 hover:underline"
                  >
                    ดูข้อมูล
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="flex justify-center items-center gap-4 mt-4">
        <button
          className="px-3 py-1 border rounded disabled:opacity-50"
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
        >
          ◀ ก่อนหน้า
        </button>

        <span>
          หน้า {page} / {totalPages}
        </span>

        <button
          className="px-3 py-1 border rounded disabled:opacity-50"
          disabled={page === totalPages}
          onClick={() => setPage((p) => p + 1)}
        >
          ถัดไป ▶
        </button>
      </div>
    </div>
  );
}
