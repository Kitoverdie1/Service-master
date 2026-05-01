import { NextResponse } from "next/server";
import { db } from "@/app/memsystem/lib/db";

export async function GET() {
  try {
    // 1) จำนวนครุภัณฑ์ทั้งหมด
    const [totalAssets]: any = await db.query(`
      SELECT COUNT(*) as total FROM assets
    `);

    // 2) แจ้งซ่อมแล้ว - รออนุมัติ
    const [waiting]: any = await db.query(`
      SELECT COUNT(*) as total
      FROM maintenance_tickets
      WHERE status_name = 'WAITING_APPROVAL'
    `);

    // 3) แจ้งซ่อมแล้ว - กำลังดำเนินการ
    const [inProgress]: any = await db.query(`
      SELECT COUNT(*) as total
      FROM maintenance_tickets
      WHERE status_name = 'IN_PROGRESS'
    `);

    // 4) ยังไม่เคยแจ้งซ่อม
    const neverRepair =
      totalAssets[0].total -
      waiting[0].total -
      inProgress[0].total;

    return NextResponse.json({
      success: true,
      data: {
        neverRepair,
        waiting: waiting[0].total,
        inProgress: inProgress[0].total,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
