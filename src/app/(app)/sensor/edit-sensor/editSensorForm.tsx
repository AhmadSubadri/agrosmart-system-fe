"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Back from "../../../Components/backButton";

interface SensorData {
  ds_id: string;
  ds_name: string;
  dc_normal_value: number;
  ds_min_norm_value: number;
  ds_max_norm_value: number;
  ds_min_value: number;
  ds_max_value: number;
  ds_min_val_warn: number;
  ds_max_val_warn: number;
  ds_sts: number;
}

export default function EditSensorFormClient({
  sensorId,
}: {
  sensorId: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [sensorData, setSensorData] = useState<SensorData | null>(null);

  // ===============================
  // FETCH DATA SENSOR
  // ===============================
  useEffect(() => {
    const fetchSensor = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL;

        const res = await fetch(`${API_URL}/api/sensor/${sensorId}`, {
          cache: "no-store",
        });

        if (!res.ok) throw new Error("Sensor tidak ditemukan");

        const data = await res.json();
        setSensorData(data);
      } catch (error) {
        alert("Gagal mengambil data sensor");
        router.replace("/sensor");
      } finally {
        setLoading(false);
      }
    };

    fetchSensor();
  }, [sensorId, router]);

  // ===============================
  // HANDLE INPUT
  // ===============================
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    if (!sensorData) return;

    const { name, value } = e.target;

    setSensorData({
      ...sensorData,
      [name]:
        name === "ds_sts"
          ? Number(value)
          : Number.isNaN(Number(value))
          ? value
          : Number(value),
    });
  };

  // ===============================
  // HANDLE SUBMIT
  // ===============================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sensorData) return;

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL;

      const res = await fetch(`${API_URL}/api/sensor/${sensorData.ds_id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(sensorData),
      });

      if (!res.ok) throw new Error("Update gagal");

      alert("Sensor berhasil diperbarui");
      router.push("/sensor");
    } catch (error) {
      alert("Gagal menyimpan data sensor");
    }
  };

  // ===============================
  // RENDER STATE
  // ===============================
  if (loading) {
    return <p className="p-6">Loading data sensor...</p>;
  }

  if (!sensorData) return null;

  // ===============================
  // RENDER FORM
  // ===============================
  return (
    <div className="p-6">
      <div className="mt-6 ml-6 bg-abu p-4">
        <form
          onSubmit={handleSubmit}
          className="max-w-screen-md mx-0 space-y-6"
        >
          {/* ID SENSOR */}
          <div className="flex space-x-5 items-center">
            <label className="w-40 font-bold">ID Sensor</label>
            <input
              type="text"
              name="ds_id"
              value={sensorData.ds_id}
              disabled
              className="bg-gray-200 border p-2 w-full"
            />
          </div>

          {/* NAMA SENSOR */}
          <div className="flex space-x-5 items-center">
            <label className="w-40 font-bold">Label</label>
            <input
              type="text"
              name="ds_name"
              value={sensorData.ds_name}
              onChange={handleChange}
              className="border p-2 w-full"
              required
            />
          </div>

          {/* STATUS */}
          <div className="flex space-x-5 items-center">
            <label className="w-40 font-bold">Status</label>
            <select
              name="ds_sts"
              value={sensorData.ds_sts}
              onChange={handleChange}
              className="border p-2 w-full"
            >
              <option value={1}>Aktif</option>
              <option value={0}>Tidak Aktif</option>
            </select>
          </div>

          {/* NILAI */}
          {[
            ["dc_normal_value", "Nilai Normal"],
            ["ds_min_norm_value", "Batas Normal Bawah"],
            ["ds_max_norm_value", "Batas Normal Atas"],
            ["ds_min_val_warn", "Peringatan Bawah"],
            ["ds_max_val_warn", "Peringatan Atas"],
          ].map(([key, label]) => (
            <div key={key} className="flex space-x-5 items-center">
              <label className="w-40 font-bold">{label}</label>
              <input
                type="number"
                name={key}
                value={(sensorData as any)[key]}
                onChange={handleChange}
                className="border p-2 w-full"
                required
              />
            </div>
          ))}

          {/* ACTION */}
          <div className="flex gap-4 pt-6">
            <Back route="/sensor" />
            <button
              type="submit"
              className="bg-[#F9B300] text-white px-6 py-2 rounded-md"
            >
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
