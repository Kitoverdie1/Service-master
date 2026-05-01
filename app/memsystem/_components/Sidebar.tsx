"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();

  const menu = [
    { label: "Dashboard", href: "/memsystem/dashboard" },
    { label: "รายการครุภัณฑ์", href: "/memsystem/assets" },
    { label: "รายการแจ้งซ่อม", href: "/memsystem/repairs" },
    { label: "ประวัติการซ่อม", href: "/memsystem/repair-history" },
  ];

  return (
    <aside className="flex h-screen w-64 flex-col bg-slate-800 text-white">
      {/* Header */}
      <div className="border-b border-slate-700 px-4 py-4 text-lg font-bold">
        MEM System
      </div>

      {/* Menu */}
      <nav className="flex-1 space-y-1 p-3">
        {menu.map((m) => (
          <Link
            key={m.href}
            href={m.href}
            className={`block rounded px-3 py-2 text-sm hover:bg-slate-700 ${
              pathname === m.href ? "bg-slate-700" : ""
            }`}
          >
            {m.label}
          </Link>
        ))}
      </nav>

      {/* 🔙 Back to Home */}
      <div className="border-t border-slate-700 p-3">
        <Link
          href="/"
          className="flex items-center gap-2 rounded bg-slate-700 px-3 py-2 text-sm hover:bg-slate-600"
        >
          ⬅ กลับหน้าเลือกบริการ
        </Link>
      </div>
    </aside>
  );
}
