"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import IndikatorSuhu from "../../Components/indikator/indikatorSuhuEnv";
import IndikatorKelembapan from "../../Components/indikator/indikatorKelembapanEnv";
import IndikatorAngin from "../../Components/indikator/indikatorKecAngin";
import IndikatorCahaya from "../../Components/indikator/indikatorCahaya";
import IndikatorHujan from "../../Components/indikator/indikatorHujan";
import Map from "../../Components/map";
import FloatingGallery from "../../Components/GalleryModal";
import Site from "../../Components/dropdownSite";
import Realtime from "../../Components/indikator/realtimeDashboard";
import ExecutiveKpiCards from "../../Components/dashboard/ExecutiveKpiCards";
import AiAgronomyWidget from "../../Components/dashboard/AiAgronomyWidget";
import TelemetryTrendChart from "../../Components/dashboard/TelemetryTrendChart";

// New AgroTwin Digital Twin Components
import DigitalTwinKpiCards from "../../Components/digitaltwin/DigitalTwinKpiCards";
import DigitalTwinFieldMap, { PlotData } from "../../Components/digitaltwin/DigitalTwinFieldMap";
import CropEnvironmentStatus from "../../Components/digitaltwin/CropEnvironmentStatus";
import ActionableRecommendations from "../../Components/digitaltwin/ActionableRecommendations";
import YieldPredictionCard from "../../Components/digitaltwin/YieldPredictionCard";
import SpatialVariabilityCard from "../../Components/digitaltwin/SpatialVariabilityCard";

import {
  Calendar,
  Clock,
  MapPin,
  LogOut,
  RefreshCw,
  TrendingUp,
  Activity,
  Layers,
  ChevronDown,
  Sparkles,
} from "lucide-react";

interface ActionMessage {
  sensor_name: string;
  action_message: string;
  status_message: string;
  value_status: string;
}

interface EnvironmentData {
  sensor: string;
  read_value: number;
  read_date: string | null;
  value_status?: string;
  status_message?: string;
  action_message?: string;
  sensor_name?: string;
}

interface Sensor {
  sensor: string;
  sensor_name: string;
  read_value: string;
  read_date: string;
  value_status: string;
  status_message: string;
  action_message: string | null;
}

interface Plant {
  pl_id: string;
  pl_name: string;
  pl_desc: string;
  pl_date_planting: string;
  age: number;
  phase: string;
  timeto_harvest: number;
  commodity: string;
  variety: string;
}

interface DigitalTwinResponse {
  user?: {
    name: string;
    role: string;
    active_season: string;
  };
  site?: {
    site_id: string;
    site_name: string;
    site_address: string;
    lat: number;
    lng: number;
  };
  kpi_summary?: any;
  digital_twin_lahan?: {
    legend: {
      sehat: number;
      perlu_perhatian: number;
      berisiko: number;
    };
    plots: PlotData[];
  };
  status_tanaman_lingkungan?: any;
  analisis_rekomendasi?: any[];
  prediksi_produktivitas?: any;
  peta_spasial_variabilitas?: any;
}

interface DataResponse {
  devices: any;
  nitrogen?: Sensor[];
  fosfor?: Sensor[];
  kalium?: Sensor[];
  soil_ph?: Sensor[];
  temperature?: EnvironmentData[];
  humidity?: EnvironmentData[];
  wind?: EnvironmentData[];
  lux?: EnvironmentData[];
  rain?: EnvironmentData[];
  plants?: Plant[];
  last_updated?: string;
  todos?: {
    plant_id: string;
    todos: {
      hand_title: string;
      todo_date: string;
      fertilizer_type: string;
    }[];
  }[];
}

export default function Dashboard() {
  const [siteId, setSiteId] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("selectedSiteId") || null;
    }
    return null;
  });

  const [digitalTwinData, setDigitalTwinData] = useState<DigitalTwinResponse | null>(null);
  const [selectedSeason, setSelectedSeason] = useState("Musim Tanam 2025/2026");
  const [viewMode, setViewMode] = useState<"digital_twin" | "telemetri">("digital_twin");

  const [data, setData] = useState<DataResponse>({
    devices: null,
    nitrogen: [],
    fosfor: [],
    kalium: [],
    soil_ph: [],
    temperature: [],
    humidity: [],
    wind: [],
    lux: [],
    rain: [],
    plants: [],
    last_updated: undefined,
    todos: [],
  });

  const [actionMessages, setActionMessages] = useState<ActionMessage[]>([]);
  const [selectedPlotIndex, setSelectedPlotIndex] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isBackgroundSync, setIsBackgroundSync] = useState(false);
  const [isAutoSync, setIsAutoSync] = useState(true);
  const [countdown, setCountdown] = useState(15);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const IMAGE_BASE = "/assets/img";

  const fetchData = async (silent = false) => {
    if (silent) {
      setIsBackgroundSync(true);
    } else {
      setIsRefreshing(true);
    }
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const userStr = typeof window !== "undefined" ? localStorage.getItem("user") : null;

    const headers: Record<string, string> = {
      Accept: "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const fetchJSON = async (url: string) => {
      try {
        const res = await fetch(url, { headers });
        if (!res.ok) return null;
        const contentType = res.headers.get("content-type") || "";
        if (!contentType.includes("application/json")) {
          const text = await res.text();
          if (!text || text.trim().startsWith("<")) return null;
          try {
            return JSON.parse(text);
          } catch {
            return null;
          }
        }
        return await res.json();
      } catch {
        return null;
      }
    };

    try {
      // 1. Fetch Digital Twin Engine Endpoint
      const dtUrl = siteId
        ? `${API_URL}/api/digital-twin/dashboard?site_id=${siteId}`
        : `${API_URL}/api/digital-twin/dashboard`;

      const dtRes = await fetchJSON(dtUrl);
      if (dtRes && dtRes.status === "success") {
        setDigitalTwinData(dtRes);
      }

      // 2. Fetch Legacy Realtime & Telemetries if siteId is present
      if (siteId && siteId !== "undefined" && siteId !== "null") {
        const dashData = await fetchJSON(
          `${API_URL}/api/dashboard?site_id=${siteId}`
        );
        const realtimeData = await fetchJSON(
          `${API_URL}/api/realtime?site_id=${siteId}`
        );

        if (dashData) {
          setData(dashData);
          const warnings: ActionMessage[] = [];
          ["temperature", "humidity"].forEach((key) => {
            const d = dashData[key as keyof DataResponse] as EnvironmentData[];
            if (
              d?.[0]?.value_status &&
              ["Warning", "Danger"].includes(d[0].value_status)
            ) {
              warnings.push({
                sensor_name: d[0].sensor_name || key,
                status_message: d[0].status_message || "-",
                action_message: d[0].action_message || "-",
                value_status: d[0].value_status,
              });
            }
          });

          if (realtimeData?.sensors) {
            const sensors = realtimeData.sensors;
            const grouped: { [key: number]: any } = {};

            sensors.forEach((sensor: any) => {
              const match = sensor.sensor.match(/_(\w+)(\d+)?$/);
              if (match) {
                const type = match[1];
                const areaNumber = match[2] ? parseInt(match[2], 10) : 1;

                if (!grouped[areaNumber]) {
                  grouped[areaNumber] = {
                    soil_ph: null,
                    nitrogen: null,
                    fosfor: null,
                    kalium: null,
                  };
                }

                if (type.includes("ph")) {
                  grouped[areaNumber].soil_ph = sensor;
                } else if (type.includes("n")) {
                  grouped[areaNumber].nitrogen = sensor;
                } else if (type.includes("p")) {
                  grouped[areaNumber].fosfor = sensor;
                } else if (type.includes("k")) {
                  grouped[areaNumber].kalium = sensor;
                }
              }

              if (sensor.value_status && ["Warning", "Danger"].includes(sensor.value_status)) {
                warnings.push({
                  sensor_name: sensor.sensor_name,
                  status_message: sensor.status_message,
                  action_message: sensor.action_message,
                  value_status: sensor.value_status,
                });
              }
            });

            const soil_ph: Sensor[] = [];
            const nitrogen: Sensor[] = [];
            const fosfor: Sensor[] = [];
            const kalium: Sensor[] = [];

            Object.keys(grouped)
              .sort((a, b) => Number(a) - Number(b))
              .forEach((key) => {
                const areaData = grouped[Number(key)];
                if (areaData.soil_ph) soil_ph.push(areaData.soil_ph);
                if (areaData.nitrogen) nitrogen.push(areaData.nitrogen);
                if (areaData.fosfor) fosfor.push(areaData.fosfor);
                if (areaData.kalium) kalium.push(areaData.kalium);
              });

            setData((prev) => ({ ...prev, soil_ph, nitrogen, fosfor, kalium }));
            setActionMessages(warnings);
          }
        }
      }
    } finally {
      setIsRefreshing(false);
      setIsBackgroundSync(false);
      setCountdown(15);
    }
  };

  useEffect(() => {
    fetchData();
  }, [siteId]);

  // Realtime Polling
  useEffect(() => {
    if (!isAutoSync) return;

    const interval = setInterval(() => {
      if (typeof document !== "undefined" && document.hidden) return;
      setCountdown((prev) => {
        if (prev <= 1) {
          fetchData(true);
          return 15;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [siteId, isAutoSync]);

  const userName = useMemo(() => {
    if (typeof window !== "undefined") {
      const u = localStorage.getItem("user");
      if (u) {
        try {
          const parsed = JSON.parse(u);
          return parsed.name || parsed.user_name || "Pak Suyanto";
        } catch {
          return "Pak Suyanto";
        }
      }
    }
    return digitalTwinData?.user?.name || "Pak Suyanto";
  }, [digitalTwinData]);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    try {
      if (token) {
        await fetch(`${API_URL}/api/logout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });
      }
    } catch {
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("selectedSiteId");
      router.push("/login");
    }
  };

  return (
    <div className="space-y-5 pb-10">
      {/* 1. Header Welcome Bar & Season Dropdown */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
              Selamat Datang, {userName}!
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-[10px] font-bold text-emerald-700 border border-emerald-200">
              <Sparkles className="w-3 h-3" />
              Digital Twin Active
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Pantau kondisi lahan dan dapatkan rekomendasi terbaik untuk panen maksimal.
          </p>
        </div>

        {/* Action Controls & Season Selector */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Season Selector */}
          <div className="relative">
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/90 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-100 cursor-pointer">
              <Calendar className="w-3.5 h-3.5 text-emerald-600" />
              <select
                value={selectedSeason}
                onChange={(e) => setSelectedSeason(e.target.value)}
                className="bg-transparent focus:outline-none appearance-none pr-5 cursor-pointer"
              >
                <option value="Musim Tanam 2025/2026">Musim Tanam 2025/2026</option>
                <option value="Musim Tanam 2024/2025">Musim Tanam 2024/2025</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 pointer-events-none" />
            </div>
          </div>

          {/* Site Selector Dropdown */}
          <Site
            onSiteChange={(id) => setSiteId(id)}
            className="w-48 sm:w-56"
          />

          {/* View Mode Toggle Pill */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl text-xs font-bold">
            <button
              onClick={() => setViewMode("digital_twin")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                viewMode === "digital_twin"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Digital Twin
            </button>
            <button
              onClick={() => setViewMode("telemetri")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                viewMode === "telemetri"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Telemetri
            </button>
          </div>

          {/* Refresh Button */}
          <button
            onClick={() => fetchData()}
            disabled={isRefreshing}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-2xs"
            title="Sinkronisasi Data"
          >
            <RefreshCw
              className={`w-4 h-4 ${isRefreshing ? "animate-spin text-emerald-600" : ""}`}
            />
          </button>
        </div>
      </div>

      {/* 2. Top Summary KPI Cards (4 Cards) */}
      <DigitalTwinKpiCards data={digitalTwinData?.kpi_summary} />

      {viewMode === "digital_twin" ? (
        <>
          {/* 3. Middle Section: Digital Twin Lahan (Left) & Status Tanaman & Lingkungan (Right) */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
            {/* Left Area: Digital Twin Lahan */}
            <div className="xl:col-span-7 h-full">
              <DigitalTwinFieldMap
                plots={digitalTwinData?.digital_twin_lahan?.plots}
              />
            </div>

            {/* Right Area: Status Tanaman & Lingkungan */}
            <div className="xl:col-span-5 h-full">
              <CropEnvironmentStatus
                tanaman={digitalTwinData?.status_tanaman_lingkungan?.tanaman}
                tanah={digitalTwinData?.status_tanaman_lingkungan?.tanah}
                cuaca={digitalTwinData?.status_tanaman_lingkungan?.cuaca}
              />
            </div>
          </div>

          {/* 4. Bottom Section: Analisis Rekomendasi (Left), Prediksi Produktivitas (Center), Peta Spasial (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Col 1: Analisis & Rekomendasi Hari Ini */}
            <div className="h-full">
              <ActionableRecommendations
                recommendations={digitalTwinData?.analisis_rekomendasi}
                realtimeSensors={{
                  suhu: digitalTwinData?.status_tanaman_lingkungan?.cuaca?.suhu ?? 26.9,
                  kelembapan: digitalTwinData?.status_tanaman_lingkungan?.tanah?.kelembapan ?? 76.5,
                  curah_hujan: digitalTwinData?.status_tanaman_lingkungan?.cuaca?.curah_hujan ?? 12,
                  ph: digitalTwinData?.status_tanaman_lingkungan?.tanah?.ph ?? 6.5,
                  hst: digitalTwinData?.kpi_summary?.fase_pertumbuhan?.hst ?? 22,
                }}
              />
            </div>

            {/* Col 2: Prediksi Produktivitas & Tren Hasil Panen */}
            <div className="h-full">
              <YieldPredictionCard
                data={digitalTwinData?.prediksi_produktivitas}
              />
            </div>

            {/* Col 3: Peta Spasial & Variabilitas Lahan (Heatmap) */}
            <div className="h-full">
              <SpatialVariabilityCard
                activeMetric={digitalTwinData?.peta_spasial_variabilitas?.active_metric}
                metrics={digitalTwinData?.peta_spasial_variabilitas?.metrics}
              />
            </div>
          </div>
        </>
      ) : (
        /* Legacy / Detailed Telemetries View */
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
            <h3 className="font-bold text-slate-800 text-base mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-600" />
              Detail Monitoring Telemetri Sensor Tanah Per Plot
            </h3>

            {data.soil_ph?.length ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 overflow-x-auto pb-2">
                  {data.soil_ph.map((sensor, idx) => (
                    <button
                      key={sensor.sensor}
                      onClick={() => setSelectedPlotIndex(idx)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        selectedPlotIndex === idx
                          ? "bg-emerald-600 text-white"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      Plot Area {idx + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setSelectedPlotIndex(-1)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      selectedPlotIndex === -1
                        ? "bg-emerald-600 text-white"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    Semua Plot
                  </button>
                </div>

                <div className="space-y-3">
                  {(selectedPlotIndex === -1
                    ? data.soil_ph
                    : data.soil_ph.filter((_, idx) => idx === selectedPlotIndex)
                  ).map((sensor, mapIndex) => {
                    const actualIndex =
                      selectedPlotIndex === -1 ? mapIndex : selectedPlotIndex;
                    const nitrogen = data.nitrogen?.[actualIndex]?.read_value || 0;
                    const fosfor = data.fosfor?.[actualIndex]?.read_value || 0;
                    const kalium = data.kalium?.[actualIndex]?.read_value || 0;
                    const ph = sensor.read_value || 0;

                    return (
                      <Realtime
                        key={sensor.sensor}
                        sensor={actualIndex + 1}
                        nitrogen={Number(nitrogen)}
                        fosfor={Number(fosfor)}
                        kalium={Number(kalium)}
                        ph={Number(ph)}
                        statusPh={data.soil_ph?.[actualIndex]?.value_status ?? ""}
                        statusNitrogen={data.nitrogen?.[actualIndex]?.value_status ?? ""}
                        statusFosfor={data.fosfor?.[actualIndex]?.value_status ?? ""}
                        statusKalium={data.kalium?.[actualIndex]?.value_status ?? "OK"}
                      />
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center py-10 text-slate-400 text-sm">
                Tidak ada data sensor mentah untuk lokasi ini.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
