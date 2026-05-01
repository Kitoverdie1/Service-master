import Link from "next/link";

export default function AnesthesiaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ padding: 24 }}>
      {/* ===== Navigation ===== */}
      <div
        style={{
          display: "flex",
          gap: 12,
          marginBottom: 24,
          borderBottom: "1px solid #ccc",
          paddingBottom: 12,
          flexWrap: "wrap",
        }}
      >
        <Link href="/anesthesia">
          <button style={btnStyle}>
            📝 Anesthesia Record
          </button>
        </Link>

        <Link href="/anesthesia/pds">
          <button style={btnStyle}>
            🧪 B2 : Induction / Maintenance
          </button>
        </Link>

        <Link href="/anesthesia/detail">
          <button style={btnStyle}>
            📄 Post-Anesthesia Detail
          </button>
        </Link>

        {/* ✅ เพิ่มปุ่ม Post Anesthetic Record */}
        <Link href="/anesthesia/post">
          <button style={btnStyle}>
            🛏️ Post Anesthetic Record
          </button>
        </Link>
      </div>

      {/* ===== Page Content ===== */}
      {children}
    </div>
  );
}

/* ===== Simple Button Style ===== */
const btnStyle: React.CSSProperties = {
  padding: "6px 12px",
  border: "1px solid #ccc",
  borderRadius: 6,
  background: "#fff",
  cursor: "pointer",
};
