"use client";

import React, { useState } from "react";

/* ======================================================
   ANESTHESIA RECORD – PAPER FORM (A4 READY, FULL, SAVABLE)
   🔒 ORIGINAL STRUCTURE 100% PRESERVED
====================================================== */

type FormState = Record<string, any>;

export default function AnesthesiaPage() {
  const [form, setForm] = useState<FormState>({});
  const [saving, setSaving] = useState(false);

  const setValue = (key: string, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const res = await fetch("/anesthesia/api", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Save failed");

      alert("✅ Saved successfully");
    } catch (err) {
      console.error(err);
      alert("❌ Save error (check console)");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white text-black text-[13px] leading-tight p-6 space-y-3">

      {/* ================= HEADER ================= */}
      <div className="border border-black text-center py-3">
        <div className="text-lg font-bold tracking-wide">
          ANESTHESIA RECORD
        </div>
        <div className="text-sm">University of Phayao Hospital</div>
      </div>

      {/* ================= A ================= */}
      <Section title="A. Patient & Case Information">
        <TwoCol
          left={
            <>
              <Line label="HN" k="hn" form={form} setValue={setValue} />
              <Line label="Patient Name" k="patient_name" form={form} setValue={setValue} />
              <TwoLine>
                <Line label="Age" k="age" form={form} setValue={setValue} />
                <Line label="Sex" k="sex" form={form} setValue={setValue} />
              </TwoLine>
              <Line label="Weight (kg)" k="weight" form={form} setValue={setValue} />
              <Line label="Pre-op Diagnosis" k="preop_dx" form={form} setValue={setValue} />
            </>
          }
          right={
            <>
              <Line label="Date" k="date" form={form} setValue={setValue} />
              <Line label="Operation" k="operation" form={form} setValue={setValue} />
              <Line label="Surgeon" k="surgeon" form={form} setValue={setValue} />
              <Line label="Anesthesiologist" k="anesthesiologist" form={form} setValue={setValue} />
              <CheckRow
                label="ASA"
                k="asa"
                options={["I", "II", "III", "IV", "V", "E"]}
                form={form}
                setValue={setValue}
              />
            </>
          }
        />
      </Section>

     {/* ================= B ================= */}
      <Section title="B. Anesthesia Technique / Airway">
        <TwoCol
          left={
            <>
              <CheckRow
                label="Technique"
                k="technique"
                options={["GA", "RA", "MAC"]}
                form={form}
                setValue={setValue}
              />
              <CheckColumn
                label="Anesthesia Type"
                k="anesthesia_type"
                options={[
                  "Inhalation",
                  "TIVA",
                  "Spinal",
                  "Epidural",
                  "Peripheral nerve block",
                  "IV regional",
                ]}
                form={form}
                setValue={setValue}
              />
              <InlineOther
                label="Other"
                k="anesthesia_other"
                form={form}
                setValue={setValue}
              />
            </>
          }
          right={
            <>
              <div className="font-semibold mb-1">Airway</div>
              <ThreeLine>
                <Input placeholder="ETT / LMA / Mask" k="airway_type" form={form} setValue={setValue} />
                <Input placeholder="Size" k="airway_size" form={form} setValue={setValue} />
                <Input placeholder="Attempt" k="airway_attempt" form={form} setValue={setValue} />
              </ThreeLine>
              <TwoLine>
                <Line label="Cormack-Lehane" k="cl" form={form} setValue={setValue} />
                <Line label="Laryngoscope" k="laryngoscope" form={form} setValue={setValue} />
              </TwoLine>
              <CheckRow
                label="Adjunct"
                k="adjunct"
                options={["Stylet", "Bougie", "Fiberoptic"]}
                form={form}
                setValue={setValue}
              />
            </>
          }
        />
      </Section>

      {/* ================= C ================= */}
      <Section title="C. Monitoring">
        <CheckRow label="Basic" k="monitor_basic" options={["ECG", "NIBP", "SpO₂", "Temp", "Urine"]} form={form} setValue={setValue} />
        <CheckRow label="Ventilation" k="monitor_vent" options={["EtCO₂", "FiO₂", "RR", "TV/MV", "Paw"]} form={form} setValue={setValue} />
        <CheckRow label="Invasive" k="monitor_invasive" options={["A-line", "IBP", "CVP", "PA"]} form={form} setValue={setValue} />
        <CheckRow label="Neuromonitoring" k="monitor_neuro" options={["BIS", "TOF"]} form={form} setValue={setValue} />
      </Section>

      {/* ================= D ================= */}
      <Section title="D. Drug Record">
        <DrugTable rows={6} form={form} setValue={setValue} />
      </Section>

      {/* ================= E ================= */}
      <Section title="E. Intake / Output">
        <div className="grid grid-cols-2 border border-black">
          <div className="border-r border-black">
            <HeaderCell>Intake (ml)</HeaderCell>
            <IOBlock title="IV Fluid">
              <IORow label="Crystalloid" k="iv_crystalloid" form={form} setValue={setValue} />
              <IORow label="Colloid" k="iv_colloid" form={form} setValue={setValue} />
              <IORow label="Other" k="iv_other" form={form} setValue={setValue} />
            </IOBlock>
            <IOBlock title="Oral">
              <IORow label="Water" k="oral_water" form={form} setValue={setValue} />
              <IORow label="Other" k="oral_other" form={form} setValue={setValue} />
            </IOBlock>
            <IOBlock title="Blood / Blood Product">
              <IORow label="PRC" k="blood_prc" form={form} setValue={setValue} />
              <IORow label="FFP" k="blood_ffp" form={form} setValue={setValue} />
              <IORow label="Platelet" k="blood_platelet" form={form} setValue={setValue} />
              <IORow label="Other" k="blood_other" form={form} setValue={setValue} />
            </IOBlock>
          </div>
          <div>
            <HeaderCell>Output (ml)</HeaderCell>
            <IOBlock title="Urine">
              <IORow label="Total" k="urine_total" form={form} setValue={setValue} />
              <IORow label="Other" k="urine_other" form={form} setValue={setValue} />
            </IOBlock>
            <IOBlock title="Blood Loss">
              <IORow label="Estimated" k="bloodloss_est" form={form} setValue={setValue} />
              <IORow label="Suction" k="bloodloss_suction" form={form} setValue={setValue} />
              <IORow label="Sponge" k="bloodloss_sponge" form={form} setValue={setValue} />
            </IOBlock>
            <IOBlock title="Drain">
              <IORow label="JP" k="drain_jp" form={form} setValue={setValue} />
              <IORow label="Hemovac" k="drain_hemo" form={form} setValue={setValue} />
              <IORow label="Other" k="drain_other" form={form} setValue={setValue} />
            </IOBlock>
          </div>
        </div>
      </Section>

      {/* ================= F–I ================= */}
      <Section title="F. Intra-operative Record">
        <BigBox k="intraop_record" form={form} setValue={setValue} />
      </Section>

      <Section title="G. Events">
        <BigBox k="events" form={form} setValue={setValue} />
      </Section>

      <Section title="H. Complications">
        <BigBox k="complications" form={form} setValue={setValue} />
      </Section>

      <Section title="I. Pre-induction Assessment">
        <TwoCol
          left={<Line label="Last oral intake" k="last_oral" form={form} setValue={setValue} />}
          right={<Line label="Premedication" k="premed" form={form} setValue={setValue} />}
        />
      </Section>

      {/* ================= SAVE ================= */}
      <div className="flex justify-end pt-4">
        <button
          type="button"
          disabled={saving}
          onClick={handleSave}
          className="border border-black px-4 py-1 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
}

/* ================= COMPONENTS ================= */

function Section({ title, children }: any) {
  return (
    <section className="border border-black">
      <div className="border-b border-black px-2 py-1 font-bold">{title}</div>
      <div className="p-2 space-y-2">{children}</div>
    </section>
  );
}

function TwoCol({ left, right }: any) {
  return (
    <div className="grid grid-cols-2">
      <div className="border-r border-black p-2 space-y-2">{left}</div>
      <div className="p-2 space-y-2">{right}</div>
    </div>
  );
}

const Line = ({ label, k, form, setValue }: any) => (
  <div>
    <div className="font-semibold">{label}</div>
    <input
      value={form[k] || ""}
      onChange={(e) => setValue(k, e.target.value)}
      className="border border-black h-7 w-full px-1 outline-none bg-transparent"
    />
  </div>
);

const Input = ({ placeholder, k, form, setValue }: any) => (
  <input
    placeholder={placeholder}
    value={form[k] || ""}
    onChange={(e) => setValue(k, e.target.value)}
    className="border border-black h-7 w-full px-1 outline-none bg-transparent"
  />
);

const TwoLine = ({ children }: any) => <div className="grid grid-cols-2 gap-2">{children}</div>;
const ThreeLine = ({ children }: any) => <div className="grid grid-cols-3 gap-2">{children}</div>;

function CheckRow({ label, options, k, form, setValue }: any) {
  const values = form[k] || [];
  return (
    <div>
      <div className="font-semibold">{label}</div>
      <div className="flex gap-4 flex-wrap">
        {options.map((o: string) => (
          <label key={o} className="flex gap-1 items-center">
            <input
              type="checkbox"
              checked={values.includes(o)}
              onChange={(e) =>
                setValue(
                  k,
                  e.target.checked
                    ? [...values, o]
                    : values.filter((v: string) => v !== o)
                )
              }
            />
            {o}
          </label>
        ))}
      </div>
    </div>
  );
}

function CheckColumn({ label, options, k, form, setValue }: any) {
  const values = form[k] || [];
  return (
    <div>
      <div className="font-semibold">{label}</div>
      {options.map((o: string) => (
        <label key={o} className="flex gap-2 items-center">
          <input
            type="checkbox"
            checked={values.includes(o)}
            onChange={(e) =>
              setValue(
                k,
                e.target.checked
                  ? [...values, o]
                  : values.filter((v: string) => v !== o)
              )
            }
          />
          {o}
        </label>
      ))}
    </div>
  );
}

const InlineOther = ({ label, k, form, setValue }: any) => (
  <div className="flex gap-2 items-center">
    <span>{label}</span>
    <input
      value={form[k] || ""}
      onChange={(e) => setValue(k, e.target.value)}
      className="border border-black h-7 flex-1 px-1 outline-none bg-transparent"
    />
  </div>
);

function DrugTable({ rows, form, setValue }: any) {
  return (
    <div className="border border-black">
      <div className="grid grid-cols-4 text-center font-semibold">
        {["Time", "Drug", "Dose", "Route"].map((h) => (
          <div key={h} className="border-r border-black py-1 last:border-r-0">
            {h}
          </div>
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="grid grid-cols-4">
          {["time", "drug", "dose", "route"].map((f) => (
            <input
              key={f}
              value={form[`drug_${i}_${f}`] || ""}
              onChange={(e) => setValue(`drug_${i}_${f}`, e.target.value)}
              className="border-t border-r border-black h-7 px-1 outline-none bg-transparent last:border-r-0"
            />
          ))}
        </div>
      ))}
    </div>
  );
}

const HeaderCell = ({ children }: any) => (
  <div className="border-b border-black text-center font-bold py-1">
    {children}
  </div>
);

function IOBlock({ title, children }: any) {
  return (
    <div className="border-b border-black">
      <div className="border-b border-black px-2 font-semibold py-[2px]">
        {title}
      </div>
      {children}
    </div>
  );
}

function IORow({ label, k, form, setValue }: any) {
  return (
    <div className="grid grid-cols-[120px_1fr] border-b border-black h-8">
      <div className="border-r border-black px-2 flex items-center">
        {label}
      </div>
      <input
        value={form[k] || ""}
        onChange={(e) => setValue(k, e.target.value)}
        className="px-1 outline-none bg-transparent"
      />
    </div>
  );
}

const BigBox = ({ k, form, setValue }: any) => (
  <textarea
    value={form[k] || ""}
    onChange={(e) => setValue(k, e.target.value)}
    className="border border-black h-24 w-full outline-none resize-none bg-transparent"
  />
);
