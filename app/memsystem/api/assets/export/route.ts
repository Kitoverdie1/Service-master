import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { db } from "@/app/memsystem/lib/db";

export async function GET() {
  try {
    const [rows]: any = await db.query(`
      SELECT
        asset_id,
        asset_code,
        asset_name,
        asset_type,
        current_location,
        responsible_person,   -- ✅ เพิ่มผู้รับผิดชอบ
        status
      FROM assets
      ORDER BY asset_code ASC
    `);

    // map ข้อมูลลง Excel
    const exportData = rows.map((r: any, index: number) => ({
      "ลำดับ": index + 1,
      "Asset ID": r.asset_id ?? "",
      "Asset Code": r.asset_code ?? "",
      "ชื่อครุภัณฑ์": r.asset_name ?? "",
      "ประเภท": r.asset_type ?? "",
      "สถานที่ใช้งานปัจจุบัน": r.current_location ?? "ไม่ระบุ",
      "ผู้รับผิดชอบ": r.responsible_person ?? "-",   // ✅ เพิ่มตรงนี้
      "สถานะ": r.status ?? "",
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Assets");

    const buffer = XLSX.write(wb, {
      type: "buffer",
      bookType: "xlsx",
    });

    return new NextResponse(buffer, {
      headers: {
        "Content-Disposition": `attachment; filename=assets.xlsx`,
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    });
  } catch (err) {
    console.error("❌ Export Excel Error:", err);
    return NextResponse.json(
      { message: "Export failed" },
      { status: 500 }
    );
  }
}
