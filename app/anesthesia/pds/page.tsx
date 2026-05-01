"use client";

import { useState } from "react";

/* ========================
        TYPE
======================== */
type TopForm = {
  hospital: string;
  name: string;
  hn: string;
  age: string;
  sex: string;
  weight: string;
  height: string;
  dateOfOperation: string;
  diagnosis: string;
  operation: string;
  surgeon: string;
  service: string;

  admission: "OPD" | "IPD" | "ER" | "";
  preopCondition:
    | "OPD & Admit"
    | "Admit with complication related anesthesia"
    | "None"
    | "";
  asaStatus: string;
  technique: "General" | "Spinal" | "Epidural" | "Local" | "";
  arrivalTime: string;
};

type PreopConditions = {
  respiratory: Record<string, boolean>;
  neuro: Record<string, boolean>;
  hematologic: Record<string, boolean>;
  liver: Record<string, boolean>;
  cardiovascular: Record<string, boolean>;
  endocrine: Record<string, boolean>;
  renal: Record<string, boolean>;
  miscellaneous: Record<string, boolean>;

  monitors: Record<string, boolean>;
  specialTech: Record<string, boolean>;
  anestheticAgents: Record<string, boolean>;
};


export default function PerianestheticPage() {
  /* ========================
        STATE
  ======================== */
  const [form, setForm] = useState<TopForm>({
    hospital: "",
    name: "",
    hn: "",
    age: "",
    sex: "",
    weight: "",
    height: "",
    dateOfOperation: "",
    diagnosis: "",
    operation: "",
    surgeon: "",
    service: "",
    admission: "",
    preopCondition: "",
    asaStatus: "",
    technique: "",
    arrivalTime: "",
  });

  const [preop, setPreop] = useState<PreopConditions>({
  respiratory: {},
  neuro: {},
  hematologic: {},
  liver: {},
  cardiovascular: {},
  endocrine: {},
  renal: {},
  miscellaneous: {},

  monitors: {},
  specialTech: {},
  anestheticAgents: {},
});


  /* ========================
        DATA
  ======================== */
  const PREOP_DATA = [
    {
      key: "respiratory",
      title: "Respiratory",
      items: [
        "101 Strong smoker",
        "102 Bronchial asthma / COPD",
        "103 Acute URI",
        "104 Old pulmonary TB",
        "105 Pneumonia",
        "106 Restrictive lung disease",
        "107 Pleural effusion",
        "108 Pulmonary edema",
        "109 Pulmonary embolism",
        "110 Obstructive sleep apnea",
        "111 Hypoxia",
      ],
    },
    {
      key: "neuro",
      title: "Neuro",
      items: [
        "201 History of convulsion",
        "202 CVA",
        "203 Increased ICP",
        "204 Head injury",
        "205 Peripheral neuropathy",
        "206 Parkinsonism",
        "207 Brain tumor",
        "208 Head injury / increased ICP",
        "209 Myasthenia gravis",
        "210 GBS",
        "211 Mental retardation",
      ],
    },
    {
      key: "hematologic",
      title: "Hematologic / Infection",
      items: [
        "301 Anemia",
        "302 Bleeding disorder",
        "303 Anticoagulant therapy",
        "304 HIV infection",
        "305 Hepatitis B",
        "306 Hepatitis C",
        "307 Sepsis",
      ],
    },
    {
      key: "liver",
      title: "Liver disease",
      items: [
        "401 Chronic hepatitis",
        "402 Cirrhosis",
        "403 Obstructive jaundice",
      ],
    },
    {
      key: "cardiovascular",
      title: "Cardiovascular",
      items: [
        "501 Hypertension",
        "502 Ischemic heart disease",
        "503 Valvular heart disease",
        "504 Arrhythmia",
        "505 Heart failure",
        "506 Congenital heart disease",
        "507 Pacemaker",
      ],
    },
    {
      key: "endocrine",
      title: "Endocrine / Metabolic",
      items: [
        "601 Diabetes mellitus",
        "602 Thyroid disease",
        "603 Adrenal disease",
        "604 Obesity",
        "605 Electrolyte imbalance",
      ],
    },
    {
      key: "renal",
      title: "Renal disease",
      items: [
        "701 Acute renal failure",
        "702 Chronic renal failure",
        "703 Dialysis",
      ],
    },
    {
    key: "miscellaneous",
    title: "Miscellaneous",
    items: [
      "801 Pregnancy",
      "802 Post transplant",
      "803 Drug allergy",
      "804 Malignancy",
      "805 Chemotherapy",
      "806 Radiotherapy",
      "807 Others",
    ],
  },

  /* ====== เพิ่มใหม่ ====== */

  {
    key: "monitors",
    title: "Monitors",
    items: [
      "1 NIBP",
      "2 SpO2",
      "3 ECG",
      "4 BP",
      "5 EtCO2 / Fi gas",
      "6 Urine",
      "7 Temp",
    ],
  },
  {
    key: "specialTech",
    title: "Special tech",
    items: [
      "1 Awake intubation",
      "2 Fiberoptic intubation",
      "3 Rapid sequence induction",
      "4 CPB",
      "5 Awake craniotomy",
      "6 Others",
    ],
  },
  {
    key: "anestheticAgents",
    title: "Anesthetic agents",
    items: [
      "1 Thiopental",
      "2 Propofol",
      "3 Ketamine",
      "4 Etomidate",
      "5 Dexmedetomidine",
      "6 Midazolam",
      "7 Isoflurane",
      "8 Sevoflurane",
      "9 Desflurane",
      "10 Suxamethonium",
      "11 Atracurium",
      "12 Cis-atracurium",
      "13 Rocuronium",
      "14 Morphine",
      "15 Fentanyl",
      "16 Pethidine",
      "17 Tramadol",
      "18 Xylocaine",
      "19 Marcaine",
      "20 Levobupivacaine",
      "21 Others",
    ],
  },
] as const;
  /* ========================
        HANDLER
  ======================== */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const togglePreop = (
    section: keyof PreopConditions,
    item: string
  ) => {
    setPreop((p) => ({
      ...p,
      [section]: {
        ...p[section],
        [item]: !p[section]?.[item],
      },
    }));
  };

  /* ========================
        STYLE
  ======================== */
  const inputStyle: React.CSSProperties = {
    width: "100%",
    border: "1px solid #000",
    padding: "4px 6px",
  };

  const labelStyle: React.CSSProperties = {
    fontWeight: "bold",
    marginBottom: 4,
  };

  /* ========================
        RENDER
  ======================== */
  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: 24 }}>
      <h1 style={{ fontSize: 22, fontWeight: "bold", marginBottom: 16 }}>
        Perianesthetic Data Sheet
      </h1>

      {/* ================= PATIENT INFO ================= */}
      <fieldset style={{ border: "1px solid #000", padding: 16 }}>
        <legend style={{ fontWeight: "bold" }}>Patient Information</legend>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 16,
          }}
        >
          {[
            ["hospital", "Hospital"],
            ["hn", "HN"],
            ["name", "Name – Surname"],
            ["service", "Service"],
            ["diagnosis", "Diagnosis"],
            ["operation", "Operation"],
            ["surgeon", "Surgeon"],
          ].map(([name, label]) => (
            <div key={name}>
              <div style={labelStyle}>{label}</div>
              <input
                name={name}
                style={inputStyle}
                value={(form as any)[name]}
                onChange={handleChange}
              />
            </div>
          ))}

          <div>
            <div style={labelStyle}>Age / Sex / Wt / Ht</div>
            <div style={{ display: "flex", gap: 8 }}>
              <input name="age" placeholder="Age" style={inputStyle} onChange={handleChange} />
              <input name="sex" placeholder="Sex" style={inputStyle} onChange={handleChange} />
              <input name="weight" placeholder="Wt (kg)" style={inputStyle} onChange={handleChange} />
              <input name="height" placeholder="Ht (cm)" style={inputStyle} onChange={handleChange} />
            </div>
          </div>

          <div>
            <div style={labelStyle}>Date of Operation</div>
            <input type="date" name="dateOfOperation" style={inputStyle} onChange={handleChange} />
          </div>
        </div>

        <hr style={{ margin: "16px 0" }} />

        {/* Admission */}
        <div>
          <div style={labelStyle}>Admission</div>
          {["OPD", "IPD", "ER"].map((v) => (
            <label key={v} style={{ marginRight: 16 }}>
              <input
                type="radio"
                checked={form.admission === v}
                onChange={() => setForm((p) => ({ ...p, admission: v as any }))}
              />{" "}
              {v}
            </label>
          ))}
        </div>

        {/* Preop condition */}
        <div style={{ marginTop: 8 }}>
          <div style={labelStyle}>Preoperative Conditions</div>
          {[
            "OPD & Admit",
            "Admit with complication related anesthesia",
            "None",
          ].map((v) => (
            <div key={v}>
              <label>
                <input
                  type="radio"
                  checked={form.preopCondition === v}
                  onChange={() =>
                    setForm((p) => ({ ...p, preopCondition: v as any }))
                  }
                />{" "}
                {v}
              </label>
            </div>
          ))}
        </div>

        {/* ASA / Technique / Arrival */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 16,
            marginTop: 16,
          }}
        >
          <div>
            <div style={labelStyle}>ASA Status</div>
            <input name="asaStatus" style={inputStyle} onChange={handleChange} />
          </div>

          <div>
            <div style={labelStyle}>Technique</div>
            {["General", "Spinal", "Epidural", "Local"].map((v) => (
              <div key={v}>
                <label>
                  <input
                    type="radio"
                    checked={form.technique === v}
                    onChange={() =>
                      setForm((p) => ({ ...p, technique: v as any }))
                    }
                  />{" "}
                  {v} anesthesia
                </label>
              </div>
            ))}
          </div>

          <div>
            <div style={labelStyle}>Arrival</div>
            <input type="time" name="arrivalTime" style={inputStyle} onChange={handleChange} />
          </div>
        </div>
      </fieldset>

      {/* ================= PREOP TABLE ================= */}
      <fieldset style={{ border: "1px solid #000", padding: 16, marginTop: 24 }}>
        <legend style={{ fontWeight: "bold" }}>Preoperative Conditions</legend>

        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <tbody>
            {PREOP_DATA.map((sec) => (
              <tr key={sec.key}>
                <td style={{ width: "25%", border: "1px solid #000", padding: 8, fontWeight: "bold" }}>
                  {sec.title}
                </td>
                <td style={{ border: "1px solid #000", padding: 8 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
                    {sec.items.map((i) => (
                      <label key={i}>
                        <input
                          type="checkbox"
                          checked={!!preop[sec.key][i]}
                          onChange={() => togglePreop(sec.key, i)}
                        />{" "}
                        {i}
                      </label>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </fieldset>
    </div>
  );
}
