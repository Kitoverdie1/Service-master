import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { db } from "@/app/memsystem/lib/db";

/* =========================
   util: คำนวณสถานะ
========================= */
function calcStatus(next: string | null) {
  if (!next) return "ไม่ระบุ";

  const today = new Date();
  const nextDate = new Date(next);

  const diffDays =
    (nextDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);

  if (diffDays < 0) return "เกินกำหนด";
  if (diffDays <= 30) return "ใกล้ครบกำหนด";
  return "ปกติ";
}

/* =========================
   GET : ดึงรายการ calibration (ตารางหลัก)
========================= */
export async function GET() {
  try {
    const [rows]: any = await db.query(`
      SELECT
        id,
        asset_code,
        asset_name,
        last_calibration,
        next_calibration
      FROM calibration
      ORDER BY asset_code
    `);

    const data = rows.map((r: any) => ({
      ...r,
      status: calcStatus(r.next_calibration),
    }));

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("❌ fetch calibration error:", error);
    return NextResponse.json(
      { success: false },
      { status: 500 }
    );
  }
}

/* =========================
   POST : บันทึก calibration (จาก Modal)
   Content-Type: application/json
========================= */
export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || "";

    /* ---------- 1) POST JSON : save calibration ---------- */
    if (contentType.includes("application/json")) {
      const {
        asset_code,
        last_calibration,
        next_calibration,
      } = await req.json();

      if (!asset_code) {
        return NextResponse.json(
          { message: "asset_code หาย" },
          { status: 400 }
        );
      }

      await db.query(
        `
        INSERT INTO calibration
          (asset_code, last_calibration, next_calibration)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE
          last_calibration = VALUES(last_calibration),
          next_calibration = VALUES(next_calibration)
        `,
        [asset_code, last_calibration, next_calibration]
      );

      return NextResponse.json({ success: true });
    }

    /* ---------- 2) POST FormData : import Excel ---------- */
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File;

      if (!file) {
        return NextResponse.json(
          { message: "ไม่พบไฟล์ Excel" },
          { status: 400 }
        );
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const workbook = XLSX.read(buffer, { type: "buffer" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];

      const rows: any[][] = XLSX.utils.sheet_to_json(sheet, {
        header: 1,
        raw: false,
        defval: null,
      });

      // ข้อมูลจริงเริ่มแถวที่ 5
      const dataRows = rows.slice(4);
      let inserted = 0;

      for (const row of dataRows) {
        const asset_code = row[1]?.toString().trim();
        const asset_name = row[2]?.toString().trim();

        if (!asset_code || !asset_name) continue;

        await db.query(
          `
          INSERT INTO calibration (asset_code, asset_name)
          VALUES (?, ?)
          ON DUPLICATE KEY UPDATE
            asset_name = VALUES(asset_name)
          `,
          [asset_code, asset_name]
        );

        inserted++;
      }

      return NextResponse.json({
        success: true,
        inserted,
      });
    }

    return NextResponse.json(
      { message: "Unsupported Content-Type" },
      { status: 415 }
    );
  } catch (error) {
    console.error("❌ calibration POST error:", error);
    return NextResponse.json(
      { success: false },
      { status: 500 }
    );
  }
}
