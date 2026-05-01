// lib/memdb.ts
import mysql from "mysql2/promise";

type MemDB = any;

let _pool: mysql.Pool | null = null;

function pool() {
  if (_pool) return _pool;
  _pool = mysql.createPool({
    host: process.env.MEM_MYSQL_HOST,
    port: Number(process.env.MEM_MYSQL_PORT || 3306),
    user: process.env.MEM_MYSQL_USER,
    password: process.env.MEM_MYSQL_PASSWORD,
    database: process.env.MEM_MYSQL_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
  });
  return _pool;
}

export async function readMemDb(): Promise<MemDB> {
  const p = pool();
  const [rows] = await p.query(
    "SELECT meta_value FROM app_meta WHERE meta_key='db_json' LIMIT 1"
  );

  const r = rows as any[];
  if (!r?.length || !r[0]?.meta_value) {
    return { meta: {}, users: [], assets: [], maintenanceTickets: [] };
  }

  try {
    return JSON.parse(r[0].meta_value as string);
  } catch {
    return { meta: {}, users: [], assets: [], maintenanceTickets: [] };
  }
}

export async function writeMemDb(db: MemDB) {
  const p = pool();
  const jsonText = JSON.stringify(db);

  await p.query(
    `INSERT INTO app_meta (meta_key, meta_value)
     VALUES ('db_json', ?)
     ON DUPLICATE KEY UPDATE meta_value=VALUES(meta_value)`,
    [jsonText]
  );
}
