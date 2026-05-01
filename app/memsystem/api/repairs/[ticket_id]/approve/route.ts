import { NextResponse } from "next/server";
import { db } from "@/app/memsystem/lib/db";

/* ======================================================
   PATCH : APPROVED → IN_PROGRESS (ผ่อน logic)
====================================================== */
export async function PATCH(req: Request) {
  try {
    /* ---------- ดึง ticket_id จาก URL ---------- */
    const url = new URL(req.url);
    const segments = url.pathname.split("/");
    const ticketId = Number(segments[segments.length - 2]);
    // .../repairs/{ticketId}/approve

    if (!ticketId || Number.isNaN(ticketId)) {
      return NextResponse.json(
        { success: false, message: "ticket_id ไม่ถูกต้อง" },
        { status: 400 }
      );
    }

    /* ---------- ดึงข้อมูลงานซ่อม ---------- */
    const [rows]: any = await db.query(
      `
      SELECT asset_id, status_name
      FROM maintenance_tickets
      WHERE ticket_id = ?
      LIMIT 1
      `,
      [ticketId]
    );

    if (!rows || rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "ไม่พบรายการแจ้งซ่อม" },
        { status: 404 }
      );
    }

    const { asset_id, status_name } = rows[0];

    /* ---------- ผ่อน logic ---------- */
    if (status_name === "COMPLETED") {
      return NextResponse.json(
        { success: false, message: "รายการนี้ปิดงานแล้ว" },
        { status: 400 }
      );
    }

    /* ---------- UPDATE งานซ่อม ---------- */
    await db.execute(
      `
      UPDATE maintenance_tickets
      SET
        status_name = 'IN_PROGRESS',
        confirmed_by = 'Admin',
        confirmed_at = NOW()
      WHERE ticket_id = ?
      `,
      [ticketId]
    );

    /* ---------- UPDATE สถานะครุภัณฑ์ ---------- */
    await db.execute(
      `
      UPDATE assets
      SET status = 'อยู่ระหว่างซ่อม'
      WHERE asset_id = ?
      `,
      [asset_id]
    );

    return NextResponse.json({
      success: true,
      message: "อนุมัติและเริ่มซ่อมเรียบร้อย",
    });
  } catch (error: any) {
    console.error("APPROVE repair error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "อนุมัติไม่สำเร็จ",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
