"use client";

import { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import JSZip from "jszip";
import { saveAs } from "file-saver";

type Asset = {
  asset_id: number;
  asset_code: string;
  asset_name: string | null;
  responsible_person: string | null;
};

const PAGE_SIZE = 20;

export default function AssetQRPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);

  const [previewQR, setPreviewQR] = useState<string | null>(null);
  const [previewName, setPreviewName] = useState<string>("");

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  /* ===============================
     LOAD ASSETS
  =============================== */
  useEffect(() => {
    fetch("/memsystem/api/assets?all=true")
      .then((res) => res.json())
      .then((res) => {
        setAssets(res.data || []);
        setLoading(false);
      });
  }, []);

  /* ===============================
     FILTER (SEARCH)
  =============================== */
  const filteredAssets = useMemo(() => {
    const q = search.toLowerCase();
    return assets.filter(
      (a) =>
        a.asset_code.toLowerCase().includes(q) ||
        a.asset_name?.toLowerCase().includes(q) ||
        a.responsible_person?.toLowerCase().includes(q)
    );
  }, [assets, search]);

  /* ===============================
     PAGINATION
  =============================== */
  const totalPages = Math.ceil(filteredAssets.length / PAGE_SIZE);

  const pageAssets = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredAssets.slice(start, start + PAGE_SIZE);
  }, [filteredAssets, currentPage]);

  /* ===============================
     GENERATE QR
  =============================== */
  const generateQR = async (asset: Asset) => {
    const url = `${process.env.NEXT_PUBLIC_BASE_URL}/memsystem/assets/${asset.asset_code}`;
    return await QRCode.toDataURL(url, { width: 300 });
  };

  /* ===============================
     DOWNLOAD SINGLE
  =============================== */
  const downloadSingleQR = async (asset: Asset) => {
    const qr = await generateQR(asset);
    const link = document.createElement("a");
    link.href = qr;
    link.download = `${asset.asset_code}.png`;
    link.click();
  };

  /* ===============================
     PREVIEW
  =============================== */
  const preview = async (asset: Asset) => {
    const qr = await generateQR(asset);
    setPreviewQR(qr);
    setPreviewName(asset.asset_code);
  };

  /* ===============================
     DOWNLOAD ALL
  =============================== */
  const downloadAllQR = async () => {
    const zip = new JSZip();

    for (const asset of filteredAssets) {
      const qr = await generateQR(asset);
      const base64 = qr.split(",")[1];
      zip.file(`${asset.asset_code}.png`, base64, { base64: true });
    }

    const blob = await zip.generateAsync({ type: "blob" });
    saveAs(blob, "MEM-ASSET-QRCODE.zip");
  };

  if (loading) {
    return <p className="p-6">กำลังโหลดข้อมูล...</p>;
  }

  return (
    <div className="p-6 space-y-4">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">🔳 ดาวน์โหลด QR Code ครุภัณฑ์</h1>

        <button
          onClick={downloadAllQR}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          ดาวน์โหลด QR ทั้งหมด
        </button>
      </div>

      {/* SEARCH */}
      <input
        type="text"
        placeholder="ค้นหา Asset Code / ชื่อครุภัณฑ์ / ผู้รับผิดชอบ"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setCurrentPage(1);
        }}
        className="border rounded px-3 py-2 w-full md:w-1/2"
      />

      {/* TABLE */}
      <div className="overflow-auto border rounded">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">Asset Code</th>
              <th className="p-2 border">ชื่อครุภัณฑ์</th>
              <th className="p-2 border">ผู้รับผิดชอบ</th>
              <th className="p-2 border text-center">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {pageAssets.map((asset) => (
              <tr key={asset.asset_id} className="hover:bg-gray-50">
                <td className="p-2 border">{asset.asset_code}</td>
                <td className="p-2 border">{asset.asset_name}</td>
                <td className="p-2 border">
                  {asset.responsible_person || "-"}
                </td>
                <td className="p-2 border text-center space-x-3">
                  <button
                    onClick={() => preview(asset)}
                    className="text-blue-600 hover:underline"
                  >
                    ดู QR
                  </button>
                  <button
                    onClick={() => downloadSingleQR(asset)}
                    className="text-green-600 hover:underline"
                  >
                    ดาวน์โหลด
                  </button>
                </td>
              </tr>
            ))}

            {pageAssets.length === 0 && (
              <tr>
                <td colSpan={4} className="p-4 text-center text-gray-500">
                  ไม่พบข้อมูล
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <div className="flex justify-center items-center gap-2">
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((p) => p - 1)}
          className="px-3 py-1 border rounded disabled:opacity-40"
        >
          ◀ ก่อนหน้า
        </button>

        <span className="text-sm">
          หน้า {currentPage} / {totalPages}
        </span>

        <button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage((p) => p + 1)}
          className="px-3 py-1 border rounded disabled:opacity-40"
        >
          ถัดไป ▶
        </button>
      </div>

      {/* PREVIEW MODAL */}
      {previewQR && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg text-center">
            <h2 className="font-bold mb-2">{previewName}</h2>
            <img src={previewQR} className="mx-auto mb-4" />
            <button
              onClick={() => setPreviewQR(null)}
              className="bg-gray-600 text-white px-4 py-2 rounded"
            >
              ปิด
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
