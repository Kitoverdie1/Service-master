import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const data = await req.json();

  console.log("ANESTHESIA RECORD DATA =>", data);

  // 🔜 ตรงนี้คุณเอาไป insert DB / generate PDF ต่อได้เลย
  return NextResponse.json({ success: true });
}
