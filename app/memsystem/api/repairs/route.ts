import { NextResponse } from "next/server";
import { db } from "@/app/memsystem/lib/db";

/* ======================================================
   POST : แจ้งซ่อม (รองรับ FormData + JSON)
====================================================== */
export async function POST(req: Request) {
  const conn = await db.getConnection();

  try {
    const contentType = req.headers.get("content-type") || "";

    let asset_code: any;
    let repair_note: any;
    let reporter: any;
    let repair_date: any;

    /* 🔥 รองรับ 2 แบบ */
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();

      asset_code = formData.get("asset_code");
      repair_note = formData.get("repair_note");
      reporter = formData.get("reporter");
      repair_date = formData.get("repair_date");
    } else {
      const body = await req.json();

      asset_code = body.asset_code;
      repair_note = body.repair_note;
      reporter = body.reporter;
      repair_date = body.repair_date;
    }

    /* ---------- validate ---------- */
    if (!asset_code) {
      return NextResponse.json(
        { success: false, message: "กรุณาระบุ asset_code" },
        { status: 400 }
      );
    }

    await conn.beginTransaction();

    /* ---------- หา asset ---------- */
    const [assetRows]: any = await conn.query(
      `SELECT asset_id FROM assets WHERE asset_code = ? LIMIT 1`,
      [asset_code]
    );

    if (assetRows.length === 0) {
      await conn.rollback();
      return NextResponse.json(
        { success: false, message: `ไม่พบ asset_code : ${asset_code}` },
        { status: 404 }
      );
    }

    const asset = assetRows[0];

    /* ---------- จัดการวันที่ ---------- */
    let reportedAt = new Date();

    if (repair_date) {
      const parsedDate = new Date(repair_date.toString());
      if (!isNaN(parsedDate.getTime())) {
        reportedAt = parsedDate;
      }
    }

    /* ---------- insert ticket ---------- */
    const [result]: any = await conn.execute(
      `
      INSERT INTO maintenance_tickets
        (asset_id, status_name, note, reported_by, reported_at)
      VALUES (?, 'WAITING_APPROVAL', ?, ?, ?)
      `,
      [
        asset.asset_id,
        repair_note || null,
        reporter || "admin",
        reportedAt,
      ]
    );

    /* ---------- update asset ---------- */
    await conn.execute(
      `UPDATE assets SET status = 'กำลังรอดำเนินการ' WHERE asset_id = ?`,
      [asset.asset_id]
    );

    await conn.commit();

    return NextResponse.json({
      success: true,
      ticket_id: result.insertId,
    });
  } catch (error) {
    await conn.rollback();
    console.error("POST /repairs error:", error);

    return NextResponse.json(
      { success: false, message: "บันทึกแจ้งซ่อมไม่สำเร็จ" },
      { status: 500 }
    );
  } finally {
    conn.release();
  }
}

/* ======================================================
   GET : ดึงรายการแจ้งซ่อม
====================================================== */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const statusName = searchParams.get("status_name");

    const params: any[] = [];
    let whereClause = "";

    if (statusName) {
      whereClause = "WHERE t.status_name = ?";
      params.push(statusName);
    }

    const [rows]: any = await db.query(
      `
      SELECT
        t.ticket_id,
        t.asset_id,
        a.asset_code,
        a.asset_name,
        t.status_name,
        t.note,
        t.reported_by,
        t.reported_at,
        t.confirmed_by,
        t.confirmed_at
      FROM maintenance_tickets t
      LEFT JOIN assets a ON t.asset_id = a.asset_id
      ${whereClause}
      ORDER BY t.reported_at DESC
      `,
      params
    );

    return NextResponse.json({ success: true, data: rows });
  } catch (error) {
    console.error("GET /repairs error:", error);
    return NextResponse.json(
      { success: false, data: [] },
      { status: 500 }
    );
  }
}

/* ======================================================
   PUT : อนุมัติ → IN_PROGRESS
====================================================== */
export async function PUT(req: Request) {
  const conn = await db.getConnection();

  try {
    const { ticket_id, confirmed_by } = await req.json();

    if (!ticket_id) {
      return NextResponse.json(
        { success: false, message: "กรุณาระบุ ticket_id" },
        { status: 400 }
      );
    }

    await conn.beginTransaction();

    /* ---------- lock ticket ---------- */
    const [rows]: any = await conn.query(
      `
      SELECT asset_id, status_name
      FROM maintenance_tickets
      WHERE ticket_id = ?
      FOR UPDATE
      `,
      [ticket_id]
    );

    if (rows.length === 0) {
      await conn.rollback();
      return NextResponse.json(
        { success: false, message: "ไม่พบ ticket" },
        { status: 404 }
      );
    }

    const ticket = rows[0];

    if (ticket.status_name !== "WAITING_APPROVAL") {
      await conn.rollback();
      return NextResponse.json(
        { success: false, message: "ticket นี้ถูกดำเนินการแล้ว" },
        { status: 400 }
      );
    }

    /* ---------- update ticket ---------- */
    await conn.execute(
      `
      UPDATE maintenance_tickets
      SET status_name = 'IN_PROGRESS',
          confirmed_by = ?,
          confirmed_at = NOW()
      WHERE ticket_id = ?
      `,
      [confirmed_by || "admin", ticket_id]
    );

    /* ---------- update asset ---------- */
    await conn.execute(
      `UPDATE assets SET status = 'อยู่ระหว่างซ่อม' WHERE asset_id = ?`,
      [ticket.asset_id]
    );

    await conn.commit();

    return NextResponse.json({ success: true });
  } catch (error) {
    await conn.rollback();
    console.error("PUT /repairs error:", error);

    return NextResponse.json(
      { success: false, message: "อนุมัติไม่สำเร็จ" },
      { status: 500 }
    );
  } finally {
    conn.release();
  }
}