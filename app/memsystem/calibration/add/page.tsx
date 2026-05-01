"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CalibrationAddPage() {
  const router = useRouter();

  const [assetId, setAssetId] = useState("");
  const [name, setName] = useState("");
  const [lastCalibration, setLastCalibration] = useState("");
  const [nextCalibration, setNextCalibration] = useState("");
  const [status, setStatus] = useState("ครบกำหนด");
  const [value, setValue] = useState<number | "">(0);

  const handleSubmit = () => {
    if (!assetId || !name || !lastCalibration || !nextCalibration || value === "") {
      alert("กรุณากรอกข้อมูลครบทุกช่อง");
      return;
    }

    // ตัวอย่าง: บันทึกลง local state หรือส่ง API จริง
    console.log({
      assetId,
      name,
      lastCalibration,
      nextCalibration,
      status,
      value,
    });

    alert("เพิ่มรายการสำเร็จ");

    // กลับไปหน้าผลสอบเทียบ
    router.push("/memsystem/calibration");
  };

  return (
    <div className="px-4 md:px-8 py-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">➕ เพิ่มรายการสอบเทียบใหม่</h1>
      <div className="bg-white p-6 rounded-lg shadow space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Asset ID"
            value={assetId}
            onChange={(e) => setAssetId(e.target.value)}
            className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <input
            type="text"
            placeholder="ชื่ออุปกรณ์"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <input
            type="date"
            placeholder="สอบเทียบล่าสุด"
            value={lastCalibration}
            onChange={(e) => setLastCalibration(e.target.value)}
            className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <input
            type="date"
            placeholder="สอบเทียบถัดไป"
            value={nextCalibration}
            onChange={(e) => setNextCalibration(e.target.value)}
            className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="ครบกำหนด">ครบกำหนด</option>
            <option value="ใกล้ครบกำหนด">ใกล้ครบกำหนด</option>
            <option value="เกินกำหนด">เกินกำหนด</option>
          </select>
          <input
            type="number"
            placeholder="ค่า (สำหรับกราฟ)"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            บันทึก
          </button>
        </div>
      </div>
    </div>
  );
}
