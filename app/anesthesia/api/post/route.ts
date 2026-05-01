import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const data = await req.json();

  console.log("DATA FROM CLIENT:", data); // 👈 อันนี้จะขึ้นใน VS Code terminal

  return NextResponse.json({ success: true });
}
