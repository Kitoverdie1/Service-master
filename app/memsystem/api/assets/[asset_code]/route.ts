import { NextResponse } from "next/server";
import { db } from "@/app/memsystem/lib/db";

/* =========================
   ROUTE CONTEXT TYPE
========================= */
type RouteContext = {
  params: Promise<{
    asset_code: string;
  }>;
};

/* =========================
   GET : ดึงรายละเอียดครุภัณฑ์
========================= */
export async function GET(
  _req: Request,
  { params }: RouteContext
) {
  try {
    // ✅ Next.js App Router: params ต้อง await
    const { asset_code } = await params;
    const code = decodeURIComponent(asset_code).trim();

    const [rows]: any = await db.query(
      `
      SELECT
        asset_id,
        asset_code,
        asset_name,
        asset_type,
        current_location,
        status,
        department,
        price,
        acquired_date,
        responsible_person
      FROM assets
      WHERE TRIM(asset_code) = ?
      LIMIT 1
      `,
      [code]
    );

    if (!rows || rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "ไม่พบข้อมูล" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: rows[0],
    });
  } catch (error) {
    console.error("❌ GET asset error:", error);
    return NextResponse.json(
      { success: false, message: "ไม่สามารถดึงข้อมูลได้" },
      { status: 500 }
    );
  }
}

/* =========================
   PUT : แก้ไขข้อมูลครุภัณฑ์
========================= */
export async function PUT(
  req: Request,
  { params }: RouteContext
) {
  try {
    const { asset_code } = await params;
    const code = decodeURIComponent(asset_code).trim();
    const body = await req.json();

    await db.query(
      `
      UPDATE assets SET
        asset_name = ?,
        asset_type = ?,
        current_location = ?,
        status = ?,
        department = ?,
        price = ?,
        acquired_date = ?,
        responsible_person = ?
      WHERE TRIM(asset_code) = ?
      `,
      [
        body.asset_name,
        body.asset_type,
        body.current_location,
        body.status,
        body.department,
        body.price,
        body.acquired_date,
        body.responsible_person,
        code,
      ]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ PUT asset error:", error);
    return NextResponse.json(
      { success: false, message: "บันทึกข้อมูลไม่สำเร็จ" },
      { status: 500 }
    );
  }
}

/* =========================
   DELETE : ลบครุภัณฑ์
========================= */
export async function DELETE(
  _req: Request,
  { params }: RouteContext
) {
  try {
    const { asset_code } = await params;
    const code = decodeURIComponent(asset_code).trim();

    if (!code) {
      return NextResponse.json(
        { success: false, message: "ไม่พบ Asset Code" },
        { status: 400 }
      );
    }

    await db.query(
      `
      DELETE FROM assets
      WHERE TRIM(asset_code) = ?
      `,
      [code]
    );

    return NextResponse.json({
      success: true,
      message: "ลบครุภัณฑ์สำเร็จ",
    });
  } catch (error) {
    console.error("❌ DELETE asset error:", error);
    return NextResponse.json(
      { success: false, message: "ลบข้อมูลไม่สำเร็จ" },
      { status: 500 }
    );
  }
}
