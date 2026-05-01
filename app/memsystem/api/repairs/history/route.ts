import { NextResponse } from "next/server";
import { db } from "@/app/memsystem/lib/db";

export async function GET() {
  try {
    const [rows] = await db.query(`
      SELECT
        t.ticket_id,
        a.asset_code,
        a.asset_name,
        t.note        AS symptom,
        t.status_name AS status,
        t.reported_by,
        t.reported_at,
        t.confirmed_by,
        t.confirmed_at
      FROM maintenance_tickets t
      JOIN assets a
        ON a.asset_id = t.asset_id
      ORDER BY t.reported_at DESC
    `);

    return NextResponse.json(rows);
  } catch (error) {
    console.error("Repair history error:", error);
    return NextResponse.json(
      { message: "Load repair history failed" },
      { status: 500 }
    );
  }
}
