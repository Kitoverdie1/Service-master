import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";

export async function POST(
  req: Request,
  { params }: { params: { asset_code: string } }
) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { success: false, message: "ไม่พบไฟล์" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir = path.join(
      process.cwd(),
      "public/uploads/assets"
    );

    await fs.mkdir(uploadDir, { recursive: true });

    const filename = `${params.asset_code}.jpg`;
    const filePath = path.join(uploadDir, filename);

    await fs.writeFile(filePath, buffer);

    return NextResponse.json({
      success: true,
      imageUrl: `/uploads/assets/${filename}`,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { success: false },
      { status: 500 }
    );
  }
}
