import { NextResponse } from "next/server";
import { db } from "@/app/memsystem/lib/db";

/* ======================================================
   GET : ดึงรายการครุภัณฑ์
   - SEARCH (หลาย field รวมผู้รับผิดชอบ)
   - ASSET CODE RANGE
   - PAGINATION
   - ALL (สำหรับ QR Code)
====================================================== */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    /* ===============================
       MODE
    =============================== */
    const isAll = searchParams.get("all") === "true";

    /* ===============================
       PAGINATION (ใช้เฉพาะไม่ใช่ all)
    =============================== */
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.max(1, Number(searchParams.get("limit")) || 20);
    const offset = (page - 1) * limit;

    /* ===============================
       FILTER PARAMS
    =============================== */
    const search = searchParams.get("search")?.trim() || "";
    const prefix = searchParams.get("prefix");
    const start = searchParams.get("start");
    const end = searchParams.get("end");

    /* ===============================
       BUILD WHERE + PARAMS
    =============================== */
    const where: string[] = [];
    const params: any[] = [];

    // 🔍 SEARCH
    if (search) {
      where.push(`
        (
          CAST(asset_id AS CHAR) LIKE ?
          OR asset_code LIKE ?
          OR asset_name LIKE ?
          OR asset_type LIKE ?
          OR current_location LIKE ?
          OR responsible_person LIKE ?
          OR status LIKE ?
        )
      `);
      params.push(...Array(7).fill(`%${search}%`));
    }

    // 🔢 ASSET CODE RANGE
    if (prefix && start && end) {
      const safePrefix = prefix.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");

      where.push(`
        asset_code REGEXP ?
        AND CAST(SUBSTRING(asset_code, -3) AS UNSIGNED)
            BETWEEN ? AND ?
      `);

      params.push(
        `^${safePrefix}-[0-9]{3}$`,
        Number(start),
        Number(end)
      );
    }

    const whereClause =
      where.length > 0 ? `WHERE ${where.join(" AND ")}` : "";

    /* ===============================
       QUERY DATA
    =============================== */
    let rows: any[] = [];
    let total = 0;
    let totalPages = 1;

    // 🟢 MODE: ALL (สำหรับ QR)
    if (isAll) {
      const [data]: any = await db.query(
        `
        SELECT
          asset_id,
          asset_code,
          asset_name,
          asset_type,
          current_location,
          responsible_person,
          status
        FROM assets
        ${whereClause}
        ORDER BY
          asset_code ASC,
          CAST(SUBSTRING(asset_code, -3) AS UNSIGNED) ASC
        `,
        params
      );

      rows = data;
      total = data.length;
    }

    // 🔵 MODE: PAGINATION (เดิม)
    else {
      const [countRows]: any = await db.query(
        `
        SELECT COUNT(*) AS total
        FROM assets
        ${whereClause}
        `,
        params
      );

      total = countRows?.[0]?.total ?? 0;
      totalPages = Math.max(1, Math.ceil(total / limit));

      const [data]: any = await db.query(
        `
        SELECT
          asset_id,
          asset_code,
          asset_name,
          asset_type,
          current_location,
          responsible_person,
          status
        FROM assets
        ${whereClause}
        ORDER BY
          asset_code ASC,
          CAST(SUBSTRING(asset_code, -3) AS UNSIGNED) ASC
        LIMIT ? OFFSET ?
        `,
        [...params, limit, offset]
      );

      rows = data;
    }

    return NextResponse.json({
      success: true,
      data: rows,
      page: isAll ? 1 : page,
      totalPages,
      total,
    });
  } catch (error) {
    console.error("❌ API /assets GET ERROR:", error);
    return NextResponse.json(
      { success: false, data: [] },
      { status: 500 }
    );
  }
}

/* ======================================================
   POST : เพิ่มครุภัณฑ์ใหม่
====================================================== */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    let {
      asset_id,
      asset_code,
      asset_name,
      asset_type,
      current_location,
      responsible_person,
      status,
    } = body;

    // 🧹 sanitize
    asset_id = asset_id?.trim();
    asset_code = asset_code?.trim();
    asset_name = asset_name?.trim();
    responsible_person = responsible_person?.trim();

    if (!asset_code || !asset_name) {
      return NextResponse.json(
        { success: false, message: "ข้อมูลไม่ครบ" },
        { status: 400 }
      );
    }

    await db.query(
      `
      INSERT INTO assets (
        asset_id,
        asset_code,
        asset_name,
        asset_type,
        current_location,
        responsible_person,
        status
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        asset_id || null,
        asset_code,
        asset_name,
        asset_type || "ไม่ระบุ",
        current_location || "ไม่ระบุ",
        responsible_person || null,
        status || "พร้อมใช้งาน",
      ]
    );

    return NextResponse.json({
      success: true,
      message: "เพิ่มครุภัณฑ์สำเร็จ",
    });
  } catch (error: any) {
    console.error("❌ API /assets POST ERROR:", error);

    if (error.code === "ER_DUP_ENTRY") {
      return NextResponse.json(
        {
          success: false,
          message: "มี Asset ID หรือ Asset Code นี้อยู่แล้ว",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: error?.sqlMessage || "ไม่สามารถเพิ่มครุภัณฑ์ได้",
      },
      { status: 500 }
    );
  }
}
