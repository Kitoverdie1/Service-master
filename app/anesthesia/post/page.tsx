"use client";

import React from "react";

export default function PostAnestheticUltraReplica() {
  const line = "border-b border-black bg-transparent outline-none px-1";
  const timeCols = ["0", "15", "30", "45", "60", "D/C"];

  const aldreteDetail = [
    {
      title: "Activity",
      detail: [
        "2 = Move 4 extremities",
        "1 = Move 2 extremities",
        "0 = Unable to move",
      ],
    },
    {
      title: "Respiration",
      detail: [
        "2 = Deep breath & cough",
        "1 = Dyspnea / shallow",
        "0 = Apnea",
      ],
    },
    {
      title: "Circulation",
      detail: [
        "2 = BP ±20%",
        "1 = BP ±20–50%",
        "0 = BP >50%",
      ],
    },
    {
      title: "Consciousness",
      detail: [
        "2 = Fully awake",
        "1 = Arousable",
        "0 = No response",
      ],
    },
    {
      title: "Oxygenation",
      detail: [
        "2 = SpO₂ >92% RA",
        "1 = Need O₂ >90%",
        "0 = <90% with O₂",
      ],
    },
  ];

  return (
    <div className="bg-gray-300 p-6 print:p-0 print:bg-white">
      <div
        className="bg-white mx-auto border-2 border-black text-[9px]"
        style={{
          width: "210mm",
          minHeight: "297mm",
          padding: "5mm",
          fontFamily: "Arial, Helvetica, sans-serif",
          lineHeight: "1.15",
        }}
      >
        {/* HEADER */}
        <div className="text-center border-b-2 border-black pb-[2mm]">
          <div className="font-bold text-[11px]">
            UNIVERSITY OF PHAYAO HOSPITAL
          </div>
          <div className="font-bold text-[10px]">
            POST ANESTHETIC RECORD
          </div>
        </div>

        {/* PATIENT INFO */}
        <div className="grid grid-cols-[62%_38%] border-b border-black">
          <div className="border-r border-black pr-2 space-y-[2px] py-1">
            <div>
              Date <input type="date" className={`${line} w-[30mm]`} />
              OR No. <input className={`${line} w-[30mm]`} />
            </div>
            <div>Pre-Op Diagnosis <input className={`${line} w-full`} /></div>
            <div>HN <input className={`${line} w-[60mm]`} /></div>
            <div>Name <input className={`${line} w-full`} /></div>
            <div>Operation / Procedure <input className={`${line} w-full`} /></div>
            <div>Surgeon <input className={`${line} w-full`} /></div>
            <div>Anesthesiologist <input className={`${line} w-full`} /></div>
          </div>

          <div className="pl-2 space-y-[2px] py-1">
            <div>Department <input className={`${line} w-full`} /></div>

            <div>
              ASA :
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <label key={n} className="ml-1">
                  <input type="radio" name="asa" /> {n}
                </label>
              ))}
              <label className="ml-1">
                <input type="radio" name="asa" /> E
              </label>
            </div>

            <div>
              Time In <input type="time" className={`${line} w-[25mm]`} />
              Time Out <input type="time" className={`${line} w-[25mm]`} />
            </div>

            <div>
              Total Time
              <input className={`${line} w-[12mm]`} /> hr
              <input className={`${line} w-[12mm]`} /> min
            </div>

            <div>Problem <input className={`${line} w-full`} /></div>
          </div>
        </div>

        {/* MAIN BODY */}
        <div className="grid grid-cols-[62%_38%] mt-1">

          {/* LEFT PANEL */}
          <div className="border-r border-black pr-2">

            {/* VITAL GRID */}
            <div className="border border-black">
              <div className="text-center font-bold border-b border-black">
                TIME / VITAL SIGNS
              </div>

              <div className="flex">
                <div className="w-[16mm] border-r border-black text-[8px] p-[2px]">
                  <div>BP</div>
                  <div>HR</div>
                  <div>SpO₂</div>
                  <div>Temp</div>
                  <div className="mt-2">Admission (A)</div>
                  <div>Transfer (T)</div>
                </div>

                <div
                  className="flex-1"
                  style={{
                    height: "120mm",
                    backgroundImage: `
                      linear-gradient(to right, black 1px, transparent 1px),
                      linear-gradient(to bottom, black 1px, transparent 1px),
                      linear-gradient(to right, #aaa 1px, transparent 1px),
                      linear-gradient(to bottom, #aaa 1px, transparent 1px)
                    `,
                    backgroundSize: `
                      20mm 20mm,
                      20mm 20mm,
                      5mm 5mm,
                      5mm 5mm
                    `,
                  }}
                />
              </div>
            </div>

            {/* SYMBOL GRID */}
            <div className="border border-black mt-1">
              <table className="w-full border-collapse text-[8px]">
                <tbody>
                  {["SpO₂", "RR", "Pain Score"].map((row) => (
                    <tr key={row}>
                      <td className="border border-black w-[25%] px-1">{row}</td>
                      {Array.from({ length: 8 }).map((_, i) => (
                        <td key={i} className="border border-black h-[6mm]" />
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* INTAKE OUTPUT */}
            <div className="border border-black mt-1">
              <div className="flex">
                <div className="w-[25mm] border-r border-black p-[2px]">Intake</div>
                <div className="flex-1 h-[15mm]" />
              </div>
              <div className="flex border-t border-black">
                <div className="w-[25mm] border-r border-black p-[2px]">Output</div>
                <div className="flex-1 h-[15mm]" />
              </div>
            </div>

            {/* ALDRETE */}
            <div className="border border-black mt-1">
              <div className="text-center font-bold border-b border-black">
                ALDRETE SCORE
              </div>

              <table className="w-full border-collapse text-[8px]">
                <thead>
                  <tr>
                    <th className="border border-black w-[40%]">Criteria</th>
                    {timeCols.map((t) => (
                      <th key={t} className="border border-black">{t}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {aldreteDetail.map((section) =>
                    section.detail.map((d, idx) => (
                      <tr key={d}>
                        <td className="border border-black px-1">
                          {idx === 0 && <strong>{section.title}</strong>} {d}
                        </td>
                        {timeCols.map((t) => (
                          <td key={t} className="border border-black h-[6mm]" />
                        ))}
                      </tr>
                    ))
                  )}
                  {["TOTAL", "Bleeding", "Pain", "N/V", "Total Discharge Score"]
                    .map((row) => (
                      <tr key={row}>
                        <td className="border border-black font-bold px-1">{row}</td>
                        {timeCols.map((t) => (
                          <td key={t} className="border border-black h-[6mm]" />
                        ))}
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div className="pl-2 space-y-1 text-[8px]">

            {/* NURSE NOTE */}
            <div className="border border-black p-[3px]">
              <div className="font-bold border-b border-black">NURSE NOTE</div>
              <div>F: Focus A: Assessment I: Intervention E: Evaluation</div>

              <div className="mt-1 space-y-[2px]">
                <div>
                  GA <input type="checkbox" />
                  ETT <input type="checkbox" />
                  LMA <input type="checkbox" />
                  TIVA <input type="checkbox" />
                </div>
                <div>
                  RA:
                  Spinal <input type="checkbox" />
                  Epidural <input type="checkbox" />
                  CSE <input type="checkbox" />
                </div>
                <div>
                  PNB <input type="checkbox" />
                  MAC <input type="checkbox" />
                  Combined GA+RA <input type="checkbox" />
                </div>
                <div>□ ประเมิน consciousness</div>
                <div>□ EKG, BP, HR, RR q 5 / 10 / 15 min</div>
                <div>□ ประเมิน PARS ทุก 15 นาที</div>
                <div>□ ประเมิน Anesthetic level / motor power grade</div>
                <div>□ ประเมิน Pain</div>
                <div>□ ประเมิน surgical drain</div>
              </div>

              <textarea className="w-full border border-black h-[40mm] mt-1" />
            </div>

            {/* RESPIRATORY */}
            <div className="border border-black p-[3px]">
              <div className="font-bold border-b border-black">RESPIRATORY</div>
              Room air <input type="checkbox" />
              O₂ cannula <input type="checkbox" />
              Mask <input type="checkbox" />
              Mask + bag <input type="checkbox" />
              ETT / Tracheostomy <input type="checkbox" />
              <br />
              Ambu bag <input type="checkbox" />
              Collar mask <input type="checkbox" />
            </div>

            {/* PCA SETTING */}
            <div className="border border-black p-[3px]">
              <div className="font-bold border-b border-black">PCA SETTING</div>
              PCA No <input className={`${line} w-[20mm]`} />
              ml <input className={`${line} w-[15mm]`} />
              PCA dose <input className={`${line} w-[15mm]`} /> mg
              <br />
              Lock out <input className={`${line} w-[15mm]`} /> min
              Continuous <input className={`${line} w-[15mm]`} /> mg/hr
              <br />
              Loading dose <input className={`${line} w-[15mm]`} /> mg
            </div>

            {/* PCA RECORD */}
            <div className="border border-black p-[3px]">
              <div className="font-bold border-b border-black">PCA RECORD</div>
              <div className="h-[20mm]" />
            </div>

            {/* DISCHARGE */}
            <div className="border border-black p-[3px]">
              <div className="font-bold border-b border-black">DISCHARGE</div>
              Home <input type="checkbox" />
              Ward <input type="checkbox" />
              ICU <input type="checkbox" />

              <div className="mt-1">
                Transfer by <input className={`${line} w-[30mm]`} />
              </div>

              <div className="mt-1">
                BP <input className={`${line} w-[12mm]`} />
                HR <input className={`${line} w-[12mm]`} />
                O₂sat <input className={`${line} w-[15mm]`} />
                T° <input className={`${line} w-[10mm]`} />
              </div>

              <div className="mt-1">
                Level:
                Alert <input type="radio" name="loc" />
                Drowsiness <input type="radio" name="loc" />
                Stupor <input type="radio" name="loc" />
                Confusion <input type="radio" name="loc" />
                Unconscious <input type="radio" name="loc" />
              </div>

              <div className="mt-1">
                D/C by <input className={`${line} w-[25mm]`} />
                PARS <input className={`${line} w-[10mm]`} />
              </div>
            </div>

            {/* POST VISIT */}
            <div className="border border-black p-[3px]">
              <div className="font-bold border-b border-black">
                POST ANESTHESIA VISIT
              </div>
              <label>
                <input type="checkbox" /> No anesthetic complication
              </label>
              <textarea className="w-full border border-black h-[20mm] mt-1" />
              <div className="mt-1">
                Date <input type="date" className={`${line} w-[30mm]`} />
                Signature <input className={`${line} w-[35mm]`} />
                Code <input className={`${line} w-[20mm]`} />
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}