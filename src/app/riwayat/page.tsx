"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "../Components/header";
import Site from "../Components/dropdownSite";
import Select from "react-select";
import dynamic from "next/dynamic";

const Chart = dynamic(() => import("../Components/Chart"), { ssr: false });

function transformChartData(rawData: any[]) {
  const groupedData: Record<string, { x: string; y: number }[]> = {};

  rawData.forEach((item) => {
    const indicatorName = item.sensor_name ?? item.ds_id;
    if (!groupedData[indicatorName]) {
      groupedData[indicatorName] = [];
    }

    groupedData[indicatorName].push({
      x: item.read_date,
      y: parseFloat(item.read_value) || 0,
    });
  });

  return Object.entries(groupedData).map(([name, readings]) => ({
    name,
    data: readings,
  }));
}

export default function RiwayatPage() {
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const [siteId, setSiteId] = useState<string | null>(null);
  const [areaOptions, setAreaOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [selectedSensors, setSelectedSensors] = useState<
    { value: string; label: string }[]
  >([]);
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [chartData, setChartData] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loadingAreas, setLoadingAreas] = useState<boolean>(false);

  // AUTH CHECK
  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    if (!token || !user) {
      router.push("/login");
    } else {
      const storedSiteId = localStorage.getItem("selectedSiteId");
      if (storedSiteId) setSiteId(storedSiteId);
    }
  }, [router]);

  // FETCH AREA OPTIONS
  useEffect(() => {
    if (!siteId) return;

    const token = localStorage.getItem("token");
    setLoadingAreas(true);

    fetch(`${API_URL}/api/area-options?site_id=${siteId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setAreaOptions(data.areas || []);
        setLoadingAreas(false);
      })
      .catch(() => {
        setAreaOptions([]);
        setLoadingAreas(false);
      });
  }, [siteId]);

  const fetchHistoryData = async () => {
    if (selectedSensors.length === 0 || !startDate || !endDate) {
      setErrorMessage("Semua filter wajib diisi.");
      return;
    }

    const requestBody = {
      site_id: siteId,
      areas: selectedSensors.map((sensor) => sensor.value),
      sensors: ["all"],
      start_date: startDate,
      end_date: endDate,
    };

    try {
      const response = await fetch(`${API_URL}/api/riwayat2`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(requestBody),
      });

      const rawData = await response.json();

      if (rawData.message) {
        setErrorMessage(rawData.message);
        setChartData(null);
      } else {
        setChartData(transformChartData(rawData));
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
      <Header title="Riwayat Data" />

      <div className="p-6 space-y-6">
        {/* FILTER CARD */}
        <div className="bg-white rounded-xl shadow border border-gray-200 p-4">
          <div className="mb-4">
            <Site onSiteChange={(id) => setSiteId(id)} />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Area</label>
              {loadingAreas ? (
                <div className="text-gray-500">Loading area options...</div>
              ) : (
                <Select
                  isMulti
                  options={areaOptions}
                  value={selectedSensors}
                  onChange={(val) => setSelectedSensors(val as any)}
                  placeholder="Pilih area"
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
