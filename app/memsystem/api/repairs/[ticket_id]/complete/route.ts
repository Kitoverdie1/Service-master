import { NextResponse } from "next/server";
import { db } from "@/app/memsystem/lib/db";

export async function PATCH(
  req: Request,
  context: { params: Promise<{ ticket_id: string }> }
) {
  const conn = await db.getConnection();

  try {
    /* =========================
       1️⃣ unwrap params (Next 15)
    ========================= */
    const { ticket_id } = await context.params;
    const ticketId = Number(ticket_id);

    if (!ticketId || Number.isNaN(ticketId)) {
      return NextResponse.json(
        { success: false, message: "ticket_id ไม่ถูกต้อง" },
        { status: 400 }
      );
    }

    /* =========================
       2️⃣ body (ผู้ปิดงาน)
    ========================= */
    let confirmedBy = "Admin";
    try {
      const body = await req.json();
      if (body?.confirmed_by?.trim()) {
        confirmedBy = body.confirmed_by.trim();
      }
    } catch {
      // ไม่มี body ไม่เป็นไร
    }

    /* =========================
       3️⃣ ดึง ticket
    ========================= */
    const [tickets]: any = await conn.query(
      `
      SELECT ticket_id, asset_id, status_code
      FROM maintenance_tickets
      WHERE ticket_id = ?
      LIMIT 1
      `,
      [ticketId]
    );

    if (!tickets || tickets.length === 0) {
      return NextResponse.json(
        { success: false, message: "ไม่พบรายการแจ้งซ่อม" },
        { status: 404 }
      );
    }

    if (tickets[0].status_code === "COMPLETED") {
      return NextResponse.json(
        { success: false, message: "รายการนี้ปิดงานไปแล้ว" },
        { status: 400 }
      );
    }

    const assetId = tickets[0].asset_id;

    /* =========================
       4️⃣ ดึง status COMPLETED
    ========================= */
    const [statuses]: any = await conn.query(
      `
      SELECT status_id, status_code, status_name
      FROM maintenance_statuses
      WHERE status_code = 'COMPLETED'
      LIMIT 1
      `
    );

    if (!statuses || statuses.length === 0) {
      return NextResponse.json(
        { success: false, message: "ไม่พบสถานะ COMPLETED" },
        { status: 500 }
      );
    }

    const status = statuses[0];

    /* =========================
       5️⃣ transaction
    ========================= */
    await conn.beginTransaction();

    // ✅ ปิดงานซ่อม (ไม่แตะ note / อาการ)
    await conn.execute(
      `
      UPDATE maintenance_tickets
      SET
        status_id = ?,
        status_code = ?,
        status_name = ?,
        confirmed_by = ?,
        confirmed_at = NOW(),     -- log เต็ม
        confirmed_date = CURDATE() -- ใช้แสดงผล (ไม่มีเวลา)
      WHERE ticket_id = ?
      `,
      [
        status.status_id,
        status.status_code,
        status.status_name,
        confirmedBy,
        ticketId,
      ]
    );

    // ✅ คืนสถานะครุภัณฑ์
    await conn.execute(
      `
      UPDATE assets
      SET status = 'พร้อมใช้งาน'
      WHERE asset_id = ?
      `,
      [assetId]
    );

    await conn.commit();

    /* =========================
       6️⃣ response (ส่งวันที่ล้วน)
    ========================= */
    return NextResponse.json({
      success: true,
      message: "ปิดงานซ่อมเรียบร้อย",
      data: {
        ticket_id: ticketId,
        status: status.status_name,
        confirmed_by: confirmedBy,
        confirmed_date: new Date().toISOString().slice(0, 10), // YYYY-MM-DD
      },
    });
  } catch (error: any) {
    await conn.rollback();
    console.error("COMPLETE repair error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "เกิดข้อผิดพลาด",
        error: error.message,
      },
      { status: 500 }
    );
  } finally {
    conn.release();
  }
}
