"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Site from "../../Components/dropdownSite";
import Select from "react-select";
import dynamic from "next/dynamic";
import {
  Calendar,
  Filter,
  TrendingUp,
  BarChart3,
  RefreshCw,
  AlertCircle,
  MapPin,
  Clock,
  Download,
  ChevronRight,
} from "lucide-react";

const Chart = dynamic(() => import("../../Components/Chart"), { ssr: false });

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
  const [isLoading, setIsLoading] = useState<boolean>(false);

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

    setIsLoading(true);
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
    } catch (err) {
      console.error(err);
      setErrorMessage("Gagal mengambil data historis dari server.");
      setChartData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchHistoryData();
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-bone-300/80 rounded-2xl p-4 sm:p-6 shadow-soft flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-forest-900 tracking-tight">
            Riwayat Telemetri Sensor
          </h2>
          <p className="text-sm text-sage-700 mt-0.5">
            Analisis time-series hara tanah dan kecenderungan agronomi
          </p>
        </div>

        <div className="w-full md:w-auto">
          <Site
            onSiteChange={(id) => setSiteId(id)}
            className="w-full sm:w-60"
          />
        </div>
      </div>

      {/* Filter Card */}
      <div className="bg-white border border-bone-300 rounded-2xl shadow-soft p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-bone-200">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-forest-800" />
            <h3 className="font-bold text-forest-900 text-base">Filter Periode & Parameter</h3>
          </div>
          <span className="text-xs text-sage-700 font-medium">Rentang waktu analisis</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          {/* Area / Sensor Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-forest-800 mb-2">
              Pilih Parameter Sensor
            </label>
            {loadingAreas ? (
              <div className="flex items-center gap-2 text-xs text-sage-600 py-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Memuat daftar sensor...</span>
              </div>
            ) : (
              <Select
                isMulti
                options={areaOptions}
                value={selectedSensors}
                onChange={(val) => setSelectedSensors(val as any)}
                placeholder="Pilih satu atau beberapa node sensor..."
                className="react-select-container text-xs sm:text-sm font-medium"
                classNamePrefix="react-select"
                styles={{
                  control: (base, state) => ({
                    ...base,
                    borderColor: state.isFocused ? "#7A9471" : "#E2DDD2",
                    borderRadius: "0.75rem",
                    padding: "0.25rem",
                    backgroundColor: "#FAF9F6",
                    boxShadow: "none",
                    "&:hover": {
                      borderColor: "#7A9471",
                    },
                  }),
                  multiValue: (base) => ({
                    ...base,
                    backgroundColor: "#E2DDD2",
                    borderRadius: "0.5rem",
                  }),
                  multiValueLabel: (base) => ({
                    ...base,
                    color: "#2C3E2D",
                    fontWeight: "600",
                    fontSize: "0.75rem",
                  }),
                }}
              />
            )}
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-forest-800 mb-2">
                Tanggal Mulai
              </label>
              <div className="relative">
                <input
                  type="date"
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-bone-50/50 border border-bone-300 rounded-xl text-xs sm:text-sm text-forest-900 focus:outline-none focus:ring-2 focus:ring-sage-500/20 focus:border-sage-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-forest-800 mb-2">
                Tanggal Akhir
              </label>
              <div className="relative">
                <input
                  type="date"
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-bone-50/50 border border-bone-300 rounded-xl text-xs sm:text-sm text-forest-900 focus:outline-none focus:ring-2 focus:ring-sage-500/20 focus:border-sage-500"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="submit"
              disabled={isLoading || !siteId}
              className="py-3 px-5 bg-forest-900 hover:bg-forest-800 text-wheat-300 font-bold text-xs sm:text-sm rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 flex-1 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-wheat-300" />
                  <span>Memuat Data Historis...</span>
                </>
              ) : (
                <>
                  <TrendingUp className="w-4 h-4" />
                  <span>Tampilkan Grafik Tren</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedSensors([]);
                setStartDate(null);
                setEndDate(null);
                setChartData(null);
                setErrorMessage(null);
              }}
              className="py-3 px-4 bg-white border border-bone-300 text-forest-800 text-xs sm:text-sm font-semibold rounded-xl hover:bg-bone-50 transition-all flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5 text-sage-600" />
              <span>Reset Filter</span>
            </button>
          </div>
        </form>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="bg-clay-50 border border-clay-200 text-clay-900 rounded-2xl p-4 flex items-start gap-3 text-xs font-semibold">
          <AlertCircle className="w-4 h-4 text-clay-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-bold">Informasi Data</h4>
            <p className="mt-0.5 font-medium">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Chart Section */}
      {chartData && (
        <div className="bg-white border border-bone-300 rounded-2xl shadow-soft p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 pb-3 border-b border-bone-200">
            <div>
              <h3 className="font-bold text-forest-900 text-base flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-forest-800" />
                Grafik Tren Telemetri
              </h3>
              <p className="text-xs text-sage-700 mt-0.5">
                Periode: {startDate} s/d {endDate} • {selectedSensors.length} node terpilih
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {selectedSensors.map((sensor, index) => (
                <span
                  key={index}
                  className="px-2.5 py-1 bg-sage-100 border border-sage-200 text-forest-800 text-xs font-semibold rounded-full"
                >
                  {sensor.label}
                </span>
              ))}
            </div>
          </div>

          <div className="border border-bone-200 rounded-xl p-3 bg-bone-50/50">
            <Chart
              data={chartData}
              sensorName={selectedSensors.map((s) => s.label).join(", ")}
            />
          </div>
        </div>
      )}

      {/* Empty State */}
      {!chartData && !errorMessage && (
        <div className="bg-white border border-bone-300 rounded-2xl shadow-soft p-8 sm:p-12 text-center">
          <div className="w-14 h-14 bg-bone-100 rounded-2xl border border-bone-200 flex items-center justify-center mx-auto mb-3 text-forest-800">
            <TrendingUp className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-forest-900 mb-1">
            Siap Memvisualisasikan Data Historis
          </h4>
          <p className="text-xs text-sage-700 max-w-sm mx-auto">
            Tentukan parameter sensor dan rentang tanggal di atas untuk menganalisis fluktuasi hara tanah
          </p>
        </div>
      )}
    </div>
  );
}
