"use client";

import { useState } from "react";

/* ======================================================
   DATA : Complications / Events (1–51)
====================================================== */
const COMPLICATIONS = [
  "Hypotension",
  "Hypertension",
  "Hypoxemia",
  "Hypercapnia",
  "Nausea / Vomiting",
  "Airway obstruction",
  "Difficult intubation",
  "Unplanned difficult intubation",
  "Dental injury",
  "Esophageal intubation",
  "Pneumothorax",
  "Pulmonary edema / effusion",
  "Aspiration",
  "Re-intubation",
  "Tube displacement",
  "Bronchospasm",
  "Laryngospasm",
  "Arrhythmia",
  "Bradycardia (< 40 bpm)",
  "Tachycardia (> 120 bpm)",
  "Myocardial ischemia",
  "Cardiac arrest",
  "Shock",
  "Acute pulmonary embolism",
  "Delayed emergence",
  "Coma / CVA",
  "Awareness under GA",
  "High block",
  "Post-dural puncture headache",
  "Peripheral nerve injury",
  "Back pain",
  "Convulsion",
  "Local anesthetic toxicity",
  "Hypoglycemia",
  "Electrolyte / Acid-base imbalance",
  "Hypothermia (< 36°C)",
  "Fever (> 38°C)",
  "Transfusion reaction",
  "Coagulopathy",
  "Massive blood loss",
  "Allergic reaction",
  "Burn",
  "Shivering",
  "Itching",
  "Drug error / human error",
  "Pressure sore",
  "Re-operation",
  "Other complication 1",
  "Other complication 2",
  "Other complication 3",
];

export default function AnesthesiaDetailPage() {
  /* ================= STATE ================= */

  const [complications, setComplications] =
    useState<Record<string, 1 | 2 | 3>>({});

  const [painMgmt, setPainMgmt] = useState<string[]>([]);
  const [pacuDuration, setPacuDuration] = useState<"LE1" | "GT1">("LE1");
  const [minutes, setMinutes] = useState("");
  const [airway, setAirway] = useState("Extubated");
  const [disposition, setDisposition] = useState("Ward");
  const [offService, setOffService] = useState("<24");
  const [note, setNote] = useState("");
  const [satisfaction, setSatisfaction] = useState("4");

  const toggle = (value: string, list: string[], set: any) => {
    set(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  };

  const mid = Math.ceil(COMPLICATIONS.length / 2);

  return (
    <div style={page}>
      <h2 style={title}>Post-Anesthesia Record</h2>

      {/* ======================================================
          COMPLICATIONS
      ====================================================== */}
      <Section title="Complications / Events (1–51)">
        <div style={legend}>
          <b>Legend :</b>
          <span>1 = Intra-operative</span>
          <span>2 = PACU</span>
          <span>3 = Post-op &gt; 24 hrs</span>
        </div>

        {/* Header */}
        <div style={compGrid}>
          <Header />
          <div style={divider} />
          <Header />
        </div>

        {/* Data */}
        <div style={compGrid}>
          <div style={col}>
            {COMPLICATIONS.slice(0, mid).map((c, i) => (
              <CompRow
                key={c}
                no={i + 1}
                label={c}
                value={complications[c]}
                onSelect={(n) =>
                  setComplications({ ...complications, [c]: n })
                }
              />
            ))}
          </div>

          <div style={divider} />

          <div style={col}>
            {COMPLICATIONS.slice(mid).map((c, i) => (
              <CompRow
                key={c}
                no={mid + i + 1}
                label={c}
                value={complications[c]}
                onSelect={(n) =>
                  setComplications({ ...complications, [c]: n })
                }
              />
            ))}
          </div>
        </div>
      </Section>

      {/* ======================================================
          LOWER PART (❗ ไม่ได้ตัดออกแล้ว)
      ====================================================== */}
      <div style={{ marginTop: 24 }}>
        <div style={grid2}>
          <Section title="Post-op Pain Management">
            {["IV / IM", "PCA", "Epidural", "Spinal", "Peripheral nerve block"].map(
              (p) => (
                <Check
                  key={p}
                  label={p}
                  checked={painMgmt.includes(p)}
                  onChange={() => toggle(p, painMgmt, setPainMgmt)}
                />
              )
            )}
          </Section>

          <Section title="PACU Duration">
            <Radio
              name="pacu"
              label="≤ 1 hr"
              checked={pacuDuration === "LE1"}
              onChange={() => setPacuDuration("LE1")}
            />
            <Radio
              name="pacu"
              label="> 1 hr"
              checked={pacuDuration === "GT1"}
              onChange={() => setPacuDuration("GT1")}
            />
            <div style={{ marginTop: 8 }}>
              Minutes:{" "}
              <input
                value={minutes}
                onChange={(e) => setMinutes(e.target.value)}
                style={input}
              />
            </div>
          </Section>

          <Section title="Airway / Ventilation">
            {["Extubated", "Intubated (ET tube)", "Ventilator / ICU"].map((a) => (
              <Radio
                key={a}
                name="airway"
                label={a}
                checked={airway === a}
                onChange={() => setAirway(a)}
              />
            ))}
          </Section>

          <Section title="Disposition">
            {["Ward", "ICU", "Home", "Refer other hospital", "Dead within 24 hrs"].map(
              (d) => (
                <Radio
                  key={d}
                  name="disposition"
                  label={d}
                  checked={disposition === d}
                  onChange={() => setDisposition(d)}
                />
              )
            )}
          </Section>

          <Section title="Hours off service">
            <Radio
              name="offService"
              label="< 24 hrs"
              checked={offService === "<24"}
              onChange={() => setOffService("<24")}
            />
            <Radio
              name="offService"
              label="≥ 24 hrs"
              checked={offService === ">=24"}
              onChange={() => setOffService(">=24")}
            />
          </Section>

          <Section title="Other note">
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              style={{ width: "100%", minHeight: 80 }}
            />
          </Section>
        </div>

        <Section title="Patient Satisfaction" full>
          {[1, 2, 3, 4, 5].map((n) => (
            <Radio
              key={n}
              name="satisfaction"
              label={String(n)}
              checked={satisfaction === String(n)}
              onChange={() => setSatisfaction(String(n))}
              inline
            />
          ))}
        </Section>
      </div>
    </div>
  );
}

/* ======================================================
   COMPONENTS
====================================================== */

function Header() {
  return (
    <div style={{ ...row, fontWeight: "bold", borderBottom: "1px solid #ccc" }}>
      <div>No. / Complication</div>
      <div style={radioCol}>
        <div>1</div>
        <div>2</div>
        <div>3</div>
      </div>
    </div>
  );
}

function CompRow({ no, label, value, onSelect }: any) {
  return (
    <div style={row}>
      <div>
        {no}. {label}
      </div>
      <div style={radioCol}>
        {[1, 2, 3].map((n) => (
          <label key={n} style={radioItem}>
            <input
              type="radio"
              name={`comp-${label}`}
              checked={value === n}
              onChange={() => onSelect(n)}
            />
          </label>
        ))}
      </div>
    </div>
  );
}

function Section({ title, children, full }: any) {
  return (
    <div style={{ ...box, gridColumn: full ? "1 / -1" : undefined }}>
      <h4 style={{ marginBottom: 12 }}>{title}</h4>
      {children}
    </div>
  );
}

function Check({ label, checked, onChange }: any) {
  return (
    <label style={{ display: "block", marginBottom: 4 }}>
      <input type="checkbox" checked={checked} onChange={onChange} /> {label}
    </label>
  );
}

function Radio({ name, label, checked, onChange, inline }: any) {
  return (
    <label style={{ display: inline ? "inline-block" : "block", marginRight: 12 }}>
      <input type="radio" name={name} checked={checked} onChange={onChange} />{" "}
      {label}
    </label>
  );
}

/* ======================================================
   STYLES
====================================================== */

const page = {
  maxWidth: 1200,
  margin: "0 auto",
  padding: 16,
};

const title = {
  textAlign: "center" as const,
  marginBottom: 24,
};

const grid2 = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 24,
};

const compGrid = {
  display: "grid",
  gridTemplateColumns: "1fr 1px 1fr",
  gap: 12,
};

const divider = {
  background: "#999",
};

const col = {
  display: "flex",
  flexDirection: "column" as const,
  gap: 6,
};

const row = {
  display: "grid",
  gridTemplateColumns: "1fr 120px",
  alignItems: "center",
  fontSize: 14,
  minHeight: 28,
};

const radioCol = {
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  textAlign: "center" as const,
};

const radioItem = {
  display: "flex",
  justifyContent: "center",
};

const legend = {
  display: "flex",
  gap: 20,
  fontSize: 13,
  marginBottom: 12,
};

const box = {
  border: "1px solid #ccc",
  padding: 16,
  borderRadius: 6,
};

const input = {
  border: "1px solid #ccc",
  padding: "4px 6px",
  width: 80,
};
