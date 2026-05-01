import mysql from "mysql2/promise";

/**
 * ใช้ connection pool สำหรับ Next.js
 * ปลอดภัย / ไม่ hardcode / ใช้ .env.local
 */

if (!process.env.DB_HOST) {
  throw new Error("❌ Missing DB_HOST in .env.local");
}

export const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT ?? 3306),

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// log ตอน dev เพื่อ debug
if (process.env.NODE_ENV !== "production") {
  console.log("🔥 MySQL Pool Connected:", {
    host: process.env.DB_HOST,
    db: process.env.DB_NAME,
    port: process.env.DB_PORT,
  });
}
