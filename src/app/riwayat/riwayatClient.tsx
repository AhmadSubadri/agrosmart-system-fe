"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Header from "../Components/header";
import Site from "../Components/dropdownSite";
import Chart from "../Components/Chart";

// react-select dynamic
const Select = dynamic(() => import("react-select"), { ssr: false });

interface SensorData {
  ds_id: string;
  ds_name: string;
}

export default function RiwayatClient() {
  const [siteId, setSiteId] = useState<string>("SITE001");
  const [sensorData, setSensorData] = useState<SensorData[]>([]);
  const [selectedSensors, setSelectedSensors] = useState<
    { value: string; label: string }[]
  >([]);
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [chartData, setChartData] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loadingSensors, setLoadingSensors] = useState<boolean>(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  // FETCH SENSOR LIST
  useEffect(() => {
    if (!siteId) return;

    setLoadingSensors(true);

    fetch(`/api/sensor?site_id=${siteId}`)
      .then((res) => res.json())
      .then((data: SensorData[]) => {
        setSensorData(data || []);
        setLoadingSensors(false);
      })
      .catch(() => {
        setSensorData([]);
        setLoadingSensors(false);
      });
  }, [siteId]);

  const fetchHistoryData = async () => {
    if (selectedSensors.length === 0 || !startDate || !endDate) {
      setErrorMessage("Semua filter wajib diisi.");
      return;
    }

    const requestBody = {
      site_id: siteId,
      sensors: selectedSensors.map((s) => s.value),
      start_date: startDate,
      end_date: endDate,
    };

    try {
      const response = await fetch(`${API_URL}/api/riwayat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (data.message) {
        setErrorMessage(data.message);
        setChartData(null);
      } else {
        setChartData(data);
        setErrorMessage(null);
      }
    } catch {
      setErrorMessage("Terjadi kesalahan saat mengambil data.");
      setChartData(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchHistoryData();
  };

  return (
    <section>
      <Header title="Riwayat Sensor" />

      <div className="p-6 space-y-6">
        {/* FILTER CARD */}
        <div className="bg-white rounded-xl shadow border border-gray-200 p-4">
          <div className="mb-4">
            <Site onSiteChange={(id) => setSiteId(id)} />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Sensor</label>

              {loadingSensors ? (
                <div className="text-gray-500">Loading sensor...</div>
              ) : (
                <Select
                  isMulti
                  options={sensorData.map((sensor) => ({
                    value: sensor.ds_id,
                    label: sensor.ds_name,
                  }))}
                  value={selectedSensors}
                  onChange={(val) => setSelectedSensors(val as any)}
                  placeholder="Pilih sensor"
                />
              )}
            </div>

            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex w-full">
                <span className="inline-flex items-center px-3 text-sm font-semibold bg-gray-100 border border-r-0 rounded-l-md">
                  Dari
                </span>
                <input
                  type="date"
                  className="border rounded-r-md w-full p-2 text-sm"
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              <div className="flex w-full">
                <span className="inline-flex items-center px-3 text-sm font-semibold bg-gray-100 border border-r-0 rounded-l-md">
                  Ke
                </span>
                <input
                  type="date"
                  className="border rounded-r-md w-full p-2 text-sm"
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              className="bg-primary text-white font-semibold text-sm rounded-md px-4 py-2"
            >
              Tampilkan Data
            </button>
          </form>
        </div>

        {/* ERROR */}
        {errorMessage && (
          <div className="bg-red-100 text-red-700 p-3 rounded-md">
            {errorMessage}
          </div>
        )}

        {/* CHART CARD */}
        {chartData && (
          <div className="bg-white rounded-xl shadow border border-gray-200 p-4">
            <Chart
              data={chartData}
              sensorName={selectedSensors.map((s) => s.label).join(", ")}
            />
          </div>
        )}
      </div>
    </section>
  );
}
