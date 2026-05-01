import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { db } from "@/app/memsystem/lib/db";

/* =========================
   TYPE
========================= */
type ImportAsset = {
  seq: number | null;

  asset_id: string;
  asset_code: string;

  asset_name: string | null;
  asset_type: string | null;
  brand: string | null;
  model: string | null;
  serial_number: string | null;
  department: string | null;

  location: string;
  current_location: string | null;

  responsible_person: string | null; // ✅ เพิ่ม

  purchase_date: string | null;
  price: number;
  status: string;
  note: string | null;
};

/* =========================
   HELPERS
========================= */
const normalize = (v: string) =>
  String(v).toLowerCase().replace(/\s+/g, "").replace(/[()]/g, "").trim();

const clean = (v: any): string | null => {
  if (v === undefined || v === null) return null;
  const s = String(v).trim();
  return s === "" ? null : s;
};

const parseExcelDate = (value: any): string | null => {
  if (!value) return null;

  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }

  if (typeof value === "number") {
    const d = new Date((value - 25569) * 86400 * 1000);
    return isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
  }

  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
};

const parsePrice = (value: any): number => {
  if (!value) return 0;
  const n = Number(String(value).replace(/,/g, ""));
  return isNaN(n) ? 0 : Math.min(n, 999999999);
};

/* =========================
   COLUMN MAP
========================= */
const columnMap: Record<string, keyof ImportAsset> = {
  [normalize("ลำดับ")]: "seq",

  [normalize("assetid")]: "asset_id",
  [normalize("asset_id")]: "asset_id",
  [normalize("asset id")]: "asset_id",

  [normalize("รหัสเครื่องมือ")]: "asset_code",
  [normalize("รหัสเครื่องมือห้องปฏิบัติการ")]: "asset_code",

  [normalize("ชื่อ")]: "asset_name",
  [normalize("ประเภทครุภัณฑ์")]: "asset_type",
  [normalize("ยี่ห้อ")]: "brand",
  [normalize("โมเดล")]: "model",
  [normalize("หมายเลขเครื่อง")]: "serial_number",
  [normalize("หน่วยงาน")]: "department",

  [normalize("สถานที่ทะเบียน")]: "location",
  [normalize("สถานที่ใช้งานปัจจุบัน")]: "current_location",
  [normalize("สถานที่ใช้งาน(ปัจจุบัน)")]: "current_location",

  [normalize("ผู้รับผิดชอบปัจจุบัน")]: "responsible_person", // ✅ เพิ่ม

  [normalize("วันที่จัดซื้อ")]: "purchase_date",
  [normalize("ต้นทุนต่อหน่วย")]: "price",
  [normalize("สถานะ")]: "status",
  [normalize("หมายเหตุ")]: "note",
};

/* =========================
   API
========================= */
export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, message: "ไม่พบไฟล์ Excel" },
        { status: 400 }
      );
    }

    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];

    const rawRows: any[] = XLSX.utils.sheet_to_json(sheet, {
      defval: "",
      raw: false,
    });

    let upserted = 0;
    const skipped: number[] = [];

    for (const [index, raw] of rawRows.entries()) {
      const row: any = {};

      for (const key in raw) {
        const mapped = columnMap[normalize(key)];
        if (mapped) {
          row[mapped] =
            typeof raw[key] === "string" ? raw[key].trim() : raw[key];
        }
      }

      const asset_id = clean(row.asset_id);
      const asset_code = clean(row.asset_code);

      if (!asset_id || !asset_code) {
        skipped.push(index + 2);
        continue;
      }

      const data: ImportAsset = {
        seq: row.seq ? Number(row.seq) : null,
        asset_id,
        asset_code,

        asset_name: clean(row.asset_name),
        asset_type: clean(row.asset_type),
        brand: clean(row.brand),
        model: clean(row.model),
        serial_number: clean(row.serial_number),
        department: clean(row.department),

        location: clean(row.location) ?? "ไม่ระบุ",
        current_location: clean(row.current_location),

        responsible_person: clean(row.responsible_person), // ✅

        purchase_date: parseExcelDate(row.purchase_date),
        price: parsePrice(row.price),

        status: clean(row.status) ?? "ใช้งาน",
        note: clean(row.note),
      };

      // ✅ UPSERT (หัวใจของงานนี้)
      await db.query(
        `
        INSERT INTO assets SET ?
        ON DUPLICATE KEY UPDATE
          asset_name = VALUES(asset_name),
          asset_type = VALUES(asset_type),
          brand = VALUES(brand),
          model = VALUES(model),
          serial_number = VALUES(serial_number),
          department = VALUES(department),
          location = VALUES(location),
          current_location = VALUES(current_location),
          responsible_person = VALUES(responsible_person),
          purchase_date = VALUES(purchase_date),
          price = VALUES(price),
          status = VALUES(status),
          note = VALUES(note)
        `,
        [data]
      );

      upserted++;
    }

    return NextResponse.json({
      success: true,
      message: `นำเข้า/อัปเดต ${upserted} รายการสำเร็จ${
        skipped.length ? ` (ข้าม ${skipped.length} แถว)` : ""
      }`,
    });
  } catch (err: any) {
    console.error("❌ IMPORT ERROR:", err);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
