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
    } catch {
      setErrorMessage("Terjadi kesalahan saat mengambil data.");
      setChartData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchHistoryData();
  };

  const handleExportData = () => {
    if (!chartData) return;
    // Implement export functionality here
    console.log("Exporting data:", chartData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-6">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold text-gray-900">
            Riwayat Data Sensor
          </h1>
          <p className="text-gray-600 mt-1">
            Analisis historis data sensor dari lahan pertanian
          </p>
        </div>

        <div className="flex items-center gap-3">
          {chartData && (
            <button
              onClick={handleExportData}
              className="px-4 py-2.5 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Ekspor Data</span>
            </button>
          )}
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-600 mb-8">
        <MapPin className="w-4 h-4" />
        <span>Lahan</span>
        <ChevronRight className="w-3 h-3" />
        <span className="font-medium text-gray-900">Riwayat Data</span>
      </div>

      {/* Filter Card */}
      <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Filter className="w-5 h-5 text-blue-600" />
            Filter Data
          </h2>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Clock className="w-4 h-4" />
            <span>Pilih periode untuk analisis</span>
          </div>
        </div>

        <div className="mb-6">
          <Site
            onSiteChange={(id) => setSiteId(id)}
            className="w-full max-w-md"
          />
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Area Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Area Sensor
            </label>
            {loadingAreas ? (
              <div className="flex items-center gap-2 text-gray-500">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Memuat area...</span>
              </div>
            ) : (
              <Select
                isMulti
                options={areaOptions}
                value={selectedSensors}
                onChange={(val) => setSelectedSensors(val as any)}
                placeholder="Pilih area sensor..."
                className="react-select-container"
                classNamePrefix="react-select"
                styles={{
                  control: (base) => ({
                    ...base,
                    border: "1px solid #d1d5db",
                    borderRadius: "0.75rem",
                    padding: "0.5rem",
                    "&:hover": {
                      borderColor: "#3b82f6",
                    },
                  }),
                  multiValue: (base) => ({
                    ...base,
                    backgroundColor: "#eff6ff",
                    borderRadius: "0.5rem",
                  }),
                  multiValueLabel: (base) => ({
                    ...base,
                    color: "#1e40af",
                    fontWeight: "500",
                  }),
                }}
              />
            )}
            <p className="text-sm text-gray-500 mt-2">
              Pilih satu atau beberapa area untuk dianalisis
            </p>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Tanggal Mulai
              </label>
              <div className="relative">
                <input
                  type="date"
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
                <Calendar className="absolute right-3 top-3 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Tanggal Akhir
              </label>
              <div className="relative">
                <input
                  type="date"
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
                <Calendar className="absolute right-3 top-3 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button
              type="submit"
              disabled={isLoading || !siteId}
              className="px-6 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl flex-1"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>Memuat Data...</span>
                </>
              ) : (
                <>
                  <TrendingUp className="w-5 h-5" />
                  <span>Tampilkan Riwayat</span>
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
              className="px-6 py-3.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-5 h-5" />
              <span>Reset Filter</span>
            </button>
          </div>
        </form>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="mb-6">
          <div className="bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-red-800">Perhatian</h3>
              <p className="text-red-700 text-sm mt-1">{errorMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Chart Section */}
      {chartData && (
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                Grafik Riwayat Data
              </h2>
              <p className="text-gray-600 text-sm mt-1">
                Periode: {startDate} hingga {endDate} • {selectedSensors.length}{" "}
                area terpilih
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedSensors.map((sensor, index) => (
                <span
                  key={index}
                  className="px-3 py-1.5 bg-blue-100 text-blue-700 text-sm font-medium rounded-full"
                >
                  {sensor.label}
                </span>
              ))}
            </div>
          </div>

          <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
            <Chart
              data={chartData}
              sensorName={selectedSensors.map((s) => s.label).join(", ")}
            />
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-700">
                  Garis biru: Data sensor individual
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-700">
                  Area hijau: Rentang nilai normal
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                <span className="text-sm text-gray-700">
                  Titik kuning: Nilai peringatan
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!chartData && !errorMessage && (
        <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <TrendingUp className="w-10 h-10 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Belum Ada Data yang Dipilih
          </h3>
          <p className="text-gray-600 max-w-md mx-auto mb-6">
            Pilih area sensor dan periode waktu untuk melihat grafik riwayat
            data
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <Filter className="w-4 h-4" />
            <span>Gunakan filter di atas untuk memulai analisis</span>
          </div>
        </div>
      )}

      {/* Info Section */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-xl border border-blue-100">
          <div className="flex items-center gap-3 mb-3">
            <Clock className="w-5 h-5 text-blue-600" />
            <h4 className="font-semibold text-gray-900">Data Historis</h4>
          </div>
          <p className="text-sm text-gray-600">
            Akses data sensor hingga 30 hari kebelakang untuk analisis trend
          </p>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-100">
          <div className="flex items-center gap-3 mb-3">
            <BarChart3 className="w-5 h-5 text-green-600" />
            <h4 className="font-semibold text-gray-900">Analisis Trend</h4>
          </div>
          <p className="text-sm text-gray-600">
            Identifikasi pola dan perubahan kondisi lahan dari waktu ke waktu
          </p>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-4 rounded-xl border border-purple-100">
          <div className="flex items-center gap-3 mb-3">
            <AlertCircle className="w-5 h-5 text-purple-600" />
            <h4 className="font-semibold text-gray-900">Deteksi Anomali</h4>
          </div>
          <p className="text-sm text-gray-600">
            Temukan pola abnormal yang mungkin memerlukan perhatian khusus
          </p>
        </div>
      </div>
    </div>
  );
}
