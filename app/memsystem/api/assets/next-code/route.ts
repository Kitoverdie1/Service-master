import { NextResponse } from "next/server";
import { db } from "@/app/memsystem/lib/db";

/*
  GET : สร้าง Asset Code ถัดไป
  ?prefix=LAB-AS-EQ
  รูปแบบ: LAB-AS-EQ-A102
*/
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const prefix = searchParams.get("prefix");

    if (!prefix) {
      return NextResponse.json(
        { success: false, message: "missing prefix" },
        { status: 400 }
      );
    }

    const [rows]: any = await db.query(
      `
      SELECT
        MAX(
          CAST(SUBSTRING_INDEX(asset_code, 'A', -1) AS UNSIGNED)
        ) AS max_no
      FROM assets
      WHERE asset_code LIKE ?
      `,
      [`${prefix}-A%`]
    );

    const nextNumber = (rows?.[0]?.max_no ?? 0) + 1;

    const nextCode = `${prefix}-A${nextNumber}`;

    return NextResponse.json({
      success: true,
      asset_code: nextCode,
    });
  } catch (error) {
    console.error("NEXT ASSET CODE ERROR:", error);
    return NextResponse.json(
      {
        success: false,
        message: "ไม่สามารถสร้าง Asset Code ได้",
      },
      { status: 500 }
    );
  }
}
