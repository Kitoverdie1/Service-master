import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { db } from "@/app/memsystem/lib/db";

/* =========================
   util: Excel → YYYY-MM-DD
========================= */
function parseExcelDate(value: any): string | null {
  if (!value) return null;

  // JS Date
  if (value instanceof Date && !isNaN(value.getTime())) {
    return value.toISOString().split("T")[0];
  }

  // Excel serial number
  if (typeof value === "number") {
    const d = XLSX.SSF.parse_date_code(value);
    if (!d) return null;
    return `${d.y}-${String(d.m).padStart(2, "0")}-${String(d.d).padStart(
      2,
      "0"
    )}`;
  }

  // string
  const d = new Date(value);
  if (!isNaN(d.getTime())) {
    return d.toISOString().split("T")[0];
  }

  return null;
}

/* =========================
   POST: import calibration
========================= */
export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || "";

    /* ==================================================
       ❌ UI ส่ง JSON มา (กันพัง ไม่ throw)
       ================================================== */
    if (contentType.includes("application/json")) {
      console.warn("⚠️ Import called with JSON (ignored)");

      return NextResponse.json(
        {
          success: false,
          message:
            "API นี้ต้องรับไฟล์ Excel เท่านั้น (multipart/form-data)",
        },
        { status: 200 } // ⭐ ตั้งใจไม่ใช้ 400/500 เพื่อไม่ให้ระบบพัง
      );
    }

    /* ==================================================
       ❌ ไม่ใช่ multipart
       ================================================== */
    if (!contentType.includes("multipart/form-data")) {
      console.error("❌ Wrong Content-Type:", contentType);

      return NextResponse.json(
        {
          success: false,
          message:
            "รูปแบบข้อมูลไม่ถูกต้อง กรุณาอัปโหลดไฟล์ Excel",
        },
        { status: 200 }
      );
    }

    /* ==================================================
       ✅ multipart/form-data (ทางถูก)
       ================================================== */
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, message: "ไม่พบไฟล์ที่อัปโหลด" },
        { status: 200 }
      );
    }

    /* ---------- read excel ---------- */
    const buffer = Buffer.from(await file.arrayBuffer());
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];

    const rows: any[][] = XLSX.utils.sheet_to_json(sheet, {
      header: 1,
      raw: true,
      defval: null,
    });

    // header 0–3, data เริ่มแถวที่ 4
    const dataRows = rows.slice(4);

    let inserted = 0;
    let updated = 0;
    let skipped = 0;

    /* ---------- loop ---------- */
    for (const row of dataRows) {
      if (!row || row.length === 0) {
        skipped++;
        continue;
      }

      const asset_code = row[1]?.toString().trim();
      const asset_name = row[2]?.toString().trim();
      const next_calibration = parseExcelDate(row[23]);

      if (!asset_code || !asset_name) {
        skipped++;
        continue;
      }

      const [result]: any = await db.query(
        `
        INSERT INTO calibration
          (asset_code, asset_name, next_calibration)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE
          asset_name = VALUES(asset_name),
          next_calibration = VALUES(next_calibration)
        `,
        [asset_code, asset_name, next_calibration]
      );

      if (result.affectedRows === 1) inserted++;
      if (result.affectedRows === 2) updated++;
    }

    return NextResponse.json({
      success: true,
      inserted,
      updated,
      skipped,
    });
  } catch (err) {
    console.error("❌ import calibration error:", err);
    return NextResponse.json(
      {
        success: false,
        message: "Import calibration failed",
      },
      { status: 200 } // ⭐ ไม่ปล่อย 500 ให้ระบบล้ม
    );
  }
}
