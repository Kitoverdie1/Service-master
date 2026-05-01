import { NextResponse } from "next/server";
import { db } from "@/app/memsystem/lib/db";

export async function GET() {
  try {
    const [rows]: any = await db.query(`
      SELECT
        COUNT(*) AS total,

        SUM(
          status = 'ใช้งาน'
          OR status = 'พร้อมใช้งาน'
        ) AS ready,

        SUM(
          status LIKE '%ซ่อม%'
        ) AS repair,

        SUM(
          status LIKE '%ชำรุด%'
          OR status LIKE '%เสีย%'
        ) AS broken,

        SUM(status = 'ตรวจไม่พบ') AS missing

      FROM assets
      WHERE asset_code IS NOT NULL
        AND status IS NOT NULL
    `);

    const r = rows?.[0] ?? {};

    return NextResponse.json({
      total: Number(r.total) || 0,
      ready: Number(r.ready) || 0,
      repair: Number(r.repair) || 0,
      broken: Number(r.broken) || 0,
      missing: Number(r.missing) || 0,
    });
  } catch (err) {
    console.error("❌ Dashboard API Error:", err);
    return NextResponse.json(
      {
        total: 0,
        ready: 0,
        repair: 0,
        broken: 0,
        missing: 0,
      },
      { status: 500 }
    );
  }
}
