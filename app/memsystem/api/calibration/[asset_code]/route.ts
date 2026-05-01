import { NextResponse } from "next/server";
import { db } from "@/app/memsystem/lib/db";

/* ========================
        GET DETAIL
======================== */
export async function GET(
  _req: Request,
  context: { params: Promise<{ asset_code: string }> }
) {
  try {
    const { asset_code } = await context.params; // ✅ แก้ตรงนี้

    const [rows]: any = await db.query(
      `
      SELECT 
        asset_code,
        last_calibration,
        next_calibration
      FROM calibration
      WHERE asset_code = ?
      LIMIT 1
      `,
      [asset_code]
    );

    if (!rows || rows.length === 0) {
      return NextResponse.json(
        { message: "ไม่พบข้อมูล calibration" },
        { status: 404 }
      );
    }

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error("Calibration GET error:", error);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}

/* ========================
        UPDATE DATA
======================== */
export async function PUT(
  req: Request,
  context: { params: Promise<{ asset_code: string }> }
) {
  try {
    const { asset_code } = await context.params; // ✅ แก้ตรงนี้

    const body = await req.json();
    const { last_calibration, next_calibration } = body;

    await db.query(
      `
      UPDATE calibration
      SET 
        last_calibration = ?,
        next_calibration = ?
      WHERE asset_code = ?
      `,
      [last_calibration, next_calibration, asset_code]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Calibration PUT error:", error);
    return NextResponse.json(
      { error: "ไม่สามารถบันทึกข้อมูลได้" },
      { status: 500 }
    );
  }
}
