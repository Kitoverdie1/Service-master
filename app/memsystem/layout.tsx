"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function MemSystemLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  /**
   * QR MODE
   * - /memsystem/assets/[asset_code]
   * - ยกเว้น /memsystem/assets
   * - และ /memsystem/assets/qr
   */
  const isQR =
    pathname.startsWith("/memsystem/assets/") &&
    pathname !== "/memsystem/assets" &&
    !pathname.startsWith("/memsystem/assets/qr");

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <div className="flex min-h-screen bg-slate-100 text-slate-800">
      {/* ================= Sidebar ================= */}
      {!isQR && (
        <aside className="w-64 bg-slate-900 text-slate-100 shadow-lg flex flex-col">
          {/* Header */}
          <div className="px-4 py-5 border-b border-slate-700">
            <h1 className="text-lg font-semibold">
              ระบบบริหารครุภัณฑ์
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Medical Equipment Management
            </p>
          </div>

          {/* Menu */}
          <nav className="flex-1 p-3 space-y-1 text-sm">
            <Link
              href="/memsystem"
              className={`flex items-center gap-3 px-3 py-2 rounded-md hover:bg-slate-800 transition
                ${pathname === "/memsystem" ? "bg-slate-800 font-medium" : ""}`}
            >
              📊 Dashboard
            </Link>

            <Link
              href="/memsystem/assets"
              className={`flex items-center gap-3 px-3 py-2 rounded-md hover:bg-slate-800 transition
                ${
                  pathname.startsWith("/memsystem/assets") &&
                  !pathname.startsWith("/memsystem/assets/qr")
                    ? "bg-slate-800 font-medium"
                    : ""
                }`}
            >
              🏥 รายการครุภัณฑ์
            </Link>

            <Link
              href="/memsystem/assets/qr"
              className={`flex items-center gap-3 px-3 py-2 rounded-md hover:bg-slate-800 transition
                ${
                  pathname.startsWith("/memsystem/assets/qr")
                    ? "bg-slate-800 font-medium"
                    : ""
                }`}
            >
              🔳 QR Code ครุภัณฑ์
            </Link>

            <Link
              href="/memsystem/calibration"
              className={`flex items-center gap-3 px-3 py-2 rounded-md hover:bg-slate-800 transition
                ${
                  pathname.startsWith("/memsystem/calibration")
                    ? "bg-slate-800 font-medium"
                    : ""
                }`}
            >
              🧪 ผลสอบเทียบ
            </Link>

            <Link
              href="/memsystem/repairs"
              className={`flex items-center gap-3 px-3 py-2 rounded-md hover:bg-slate-800 transition
                ${
                  pathname === "/memsystem/repairs"
                    ? "bg-slate-800 font-medium"
                    : ""
                }`}
            >
              🛠️ รายการแจ้งซ่อม
            </Link>

            <Link
              href="/memsystem/repairs/history"
              className={`flex items-center gap-3 px-3 py-2 rounded-md hover:bg-slate-800 transition
                ${
                  pathname.startsWith("/memsystem/repairs/history")
                    ? "bg-slate-800 font-medium"
                    : ""
                }`}
            >
              📜 ประวัติการซ่อม
            </Link>
          </nav>

          {/* Footer */}
          <div className="px-4 py-3 text-xs text-slate-400 border-t border-slate-700">
            โรงพยาบาล / หน่วยงานภาครัฐ
          </div>
        </aside>
      )}

      {/* ================= Main Content ================= */}
      <main className="flex-1 p-6">
        <div className="bg-white rounded-lg shadow-sm p-6 min-h-[calc(100vh-3rem)]">
          {children}
        </div>
      </main>
    </div>
  );
}
