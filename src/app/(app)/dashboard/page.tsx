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
import {
  Calendar,
  Thermometer,
  CloudSun,
  Leaf,
  Sprout,
  Wheat,
  Clock,
  AlertTriangle,
  CheckCircle2,
  MapPin,
  LogOut,
  RefreshCw,
  TrendingUp,
  Activity,
  CheckCircle,
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
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const IMAGE_BASE = "/assets/img";

  const fetchData = async (silent = false) => {
    if (silent) {
      setIsBackgroundSync(true);
    } else {
      setIsRefreshing(true);
    }
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    if (!token || !user) {
      router.push("/login");
      return;
    }

    if (!siteId || siteId === "undefined" || siteId === "null") {
      console.warn("Invalid or missing siteId, please select a site.");
      setIsRefreshing(false);
      setIsBackgroundSync(false);
      return;
    }

    const headers = {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    };

    const fetchJSON = async (url: string) => {
      try {
        const res = await fetch(url, { headers });
        if (!res.ok) {
          throw new Error(`HTTP ${res.status} - ${res.statusText}`);
        }
        return await res.json();
      } catch {
        return null;
      }
    };

    try {
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
        setActionMessages(warnings);
      }

      if (realtimeData?.sensors) {
        const grouped: Record<
          number,
          {
            nitrogen?: Sensor;
            fosfor?: Sensor;
            kalium?: Sensor;
            soil_ph?: Sensor;
          }
        > = {};
        const warnings: ActionMessage[] = [];

        realtimeData.sensors.forEach((sensor: Sensor) => {
          const match = sensor.sensor.match(/(\d+)$/);
          if (!match) return;
          const area = parseInt(match[1]);
          if (!grouped[area]) grouped[area] = {};

          if (sensor.sensor.startsWith("soil_nitro"))
            grouped[area].nitrogen = sensor;
          else if (sensor.sensor.startsWith("soil_phos"))
            grouped[area].fosfor = sensor;
          else if (sensor.sensor.startsWith("soil_pot"))
            grouped[area].kalium = sensor;
          else if (sensor.sensor.startsWith("soil_ph"))
            grouped[area].soil_ph = sensor;

          if (
            sensor.value_status === "Danger" ||
            sensor.value_status === "Warning"
          ) {
            warnings.push({
              sensor_name: sensor.sensor_name,
              status_message: sensor.status_message,
              action_message: sensor.action_message || "-",
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
        setActionMessages((prev) => [...prev, ...warnings]);
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

  // Realtime Auto-Polling Heartbeat (Every 15 Seconds)
  useEffect(() => {
    if (!siteId || !isAutoSync) return;

    const interval = setInterval(() => {
      // Pause polling if the user has minimized or switched tabs
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

  const mapImageUrl = useMemo(() => {
    const filename = data.devices?.[0]?.dev_img;
    if (!filename) return null;
    return `${IMAGE_BASE}/${filename}`;
  }, [data.devices]);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    const token = localStorage.getItem("token");
    try {
      await fetch(`${API_URL}/api/logout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("selectedSiteId");
      router.push("/login");
    }
  };

  const currentPlant = data.plants?.[0];

  return (
    <div className="space-y-6">
      {/* Control Bar: Title & Site Controls */}
      <div className="bg-white border border-bone-300/80 rounded-2xl p-4 sm:p-6 shadow-soft flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-extrabold text-forest-900 tracking-tight">
              Dashboard Lahan & Tanaman
            </h2>
          </div>
          <p className="text-sm text-sage-700 mt-0.5">
            Sistem monitoring agronomik cerdas berbasis IoT & Digital Twin
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <Site
            onSiteChange={(id) => setSiteId(id)}
            className="w-full sm:w-60"
          />

          <button
            onClick={() => fetchData()}
            disabled={isRefreshing || isLoggingOut}
            className="px-4 py-2.5 bg-white border border-bone-300 hover:border-sage-400 text-forest-800 text-sm font-semibold rounded-xl transition-all shadow-sm flex items-center gap-2 hover:bg-bone-50 disabled:opacity-60"
          >
            <RefreshCw
              className={`w-4 h-4 text-sage-600 ${isRefreshing ? "animate-spin" : ""}`}
            />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className={`px-4 py-2.5 text-white text-sm font-semibold rounded-xl transition-all shadow-sm flex items-center gap-2 ${
              isLoggingOut
                ? "bg-clay-700 cursor-wait opacity-90 scale-[0.98]"
                : "bg-clay-600 hover:bg-clay-700 active:scale-95"
            }`}
          >
            {isLoggingOut ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-wheat-300" />
                <span>Memproses Keluar...</span>
              </>
            ) : (
              <>
                <LogOut className="w-4 h-4" />
                <span>Keluar</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Meta Bar: Last Update, Active Plot, & Realtime Live Sync */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-1 text-xs text-sage-700 font-medium">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 bg-bone-100/70 border border-bone-200 px-3 py-1.5 rounded-full">
            <Clock className="w-3.5 h-3.5 text-sage-600" />
            <span>Update Terakhir:</span>
            <span className="font-bold text-forest-900">
              {data.last_updated || "Sinkronisasi data..."}
            </span>
          </div>

          <div className="flex items-center gap-2 bg-bone-100/70 border border-bone-200 px-3 py-1.5 rounded-full">
            <MapPin className="w-3.5 h-3.5 text-clay-500" />
            <span>ID Lokasi:</span>
            <span className="font-bold text-forest-900">
              {siteId ? `Lahan #${siteId}` : "Belum Dipilih"}
            </span>
          </div>
        </div>

        {/* Live Realtime Heartbeat Pill */}
        <div className="flex items-center gap-2 bg-bone-100/70 border border-bone-200 px-3 py-1.5 rounded-full">
          <span
            className={`w-2 h-2 rounded-full transition-all ${
              isAutoSync
                ? isBackgroundSync
                  ? "bg-amber-500 animate-ping"
                  : "bg-emerald-500 animate-pulse"
                : "bg-sage-400"
            }`}
          />
          <span>Auto-Sync:</span>
          <button
            onClick={() => setIsAutoSync(!isAutoSync)}
            className="font-bold text-forest-900 hover:text-forest-700 underline underline-offset-2 flex items-center gap-1 transition-colors"
            title={isAutoSync ? "Klik untuk jeda sinkronisasi otomatis" : "Klik untuk aktifkan sinkronisasi otomatis"}
          >
            {isAutoSync ? (
              <span>{isBackgroundSync ? "Sinkron..." : `Live (${countdown}s)`}</span>
            ) : (
              <span className="text-clay-600">Jeda (Mati)</span>
            )}
          </button>
        </div>
      </div>

      {/* Executive KPI Summary Cards */}
      <ExecutiveKpiCards
        ph={data.soil_ph?.[0]?.read_value ? Number(data.soil_ph[0].read_value) : 6.4}
        nitrogen={data.nitrogen?.[0]?.read_value ? Number(data.nitrogen[0].read_value) : 45}
        fosfor={data.fosfor?.[0]?.read_value ? Number(data.fosfor[0].read_value) : 38}
        kalium={data.kalium?.[0]?.read_value ? Number(data.kalium[0].read_value) : 52}
        humidity={data.humidity?.[0]?.read_value || 76}
        temperature={data.temperature?.[0]?.read_value || 28.5}
        rain={data.rain?.[0]?.read_value || 0}
        activeNodes={data.soil_ph?.length || 4}
        totalNodes={data.soil_ph?.length || 4}
      />

      {/* Top Grid: Interactive Map & Plant Information */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4">
        {/* Map Section */}
        <div className="lg:col-span-7 bg-white border border-bone-300 rounded-xl shadow-2xs overflow-hidden flex flex-col">
          <div className="p-3 sm:p-3.5 border-b border-bone-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-forest-50 border border-forest-100 flex items-center justify-center text-forest-700">
                <MapPin className="w-3.5 h-3.5" />
              </div>
              <div>
                <h3 className="font-bold text-forest-900 text-sm">Peta Digital Twin Lahan</h3>
                <p className="text-[11px] text-sage-600">Visualisasi tata letak sensor & plot tanah</p>
              </div>
            </div>
            <FloatingGallery />
          </div>

          <div className="h-[250px] sm:h-[280px] relative bg-bone-100">
            <Map
              image={mapImageUrl ?? undefined}
              alt={
                data.devices?.[0]?.dev_id
                  ? `Lahan ${data.devices[0].dev_id}`
                  : "Peta Lahan"
              }
            />
          </div>
        </div>

        {/* Plant Overview Section */}
        <div className="lg:col-span-5 bg-white border border-bone-300 rounded-xl shadow-2xs p-3 sm:p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-bone-200">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-sage-50 border border-sage-100 flex items-center justify-center text-sage-600">
                <Leaf className="w-3.5 h-3.5" />
              </div>
              <div>
                <h3 className="font-bold text-forest-900 text-sm">Data Agronomi Tanaman</h3>
                <p className="text-[11px] text-sage-600">Status pertumbuhan vegetatif saat ini</p>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-forest-900 text-wheat-300">
              {currentPlant ? currentPlant.phase || "Aktif" : "Tidak Ada Data"}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-2.5">
            <div className="p-2 sm:p-2.5 rounded-lg bg-bone-50 border border-bone-200">
              <span className="text-[10px] font-bold text-sage-600 uppercase tracking-wider block mb-0.5">
                Komoditas
              </span>
              <span className="text-sm sm:text-base font-extrabold text-forest-900 block truncate">
                {currentPlant?.commodity || "Padi Sawah"}
              </span>
            </div>

            <div className="p-2 sm:p-2.5 rounded-lg bg-bone-50 border border-bone-200">
              <span className="text-[10px] font-bold text-sage-600 uppercase tracking-wider block mb-0.5">
                Varietas
              </span>
              <span className="text-sm sm:text-base font-extrabold text-forest-900 block truncate">
                {currentPlant?.variety || "Ciherang / IR64"}
              </span>
            </div>

            <div className="p-2 sm:p-2.5 rounded-lg bg-bone-50 border border-bone-200">
              <span className="text-[10px] font-bold text-sage-600 uppercase tracking-wider block mb-0.5">
                Umur Tanaman
              </span>
              <span className="text-sm sm:text-base font-extrabold text-forest-900 block">
                {currentPlant?.age ? `${currentPlant.age} HST` : "-"}
              </span>
            </div>

            <div className="p-2 sm:p-2.5 rounded-lg bg-bone-50 border border-bone-200">
              <span className="text-[10px] font-bold text-sage-600 uppercase tracking-wider block mb-0.5">
                Tanggal Tanam
              </span>
              <span className="text-xs sm:text-sm font-bold text-forest-900 block truncate">
                {currentPlant?.pl_date_planting || "-"}
              </span>
            </div>
          </div>

          {/* Harvest Countdown Banner */}
          <div className="p-2.5 sm:p-3 rounded-lg bg-gradient-to-r from-forest-900 to-forest-800 text-bone-100 flex items-center justify-between border border-forest-700 shadow-2xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-wheat-400/20 border border-wheat-400/30 flex items-center justify-center text-wheat-300">
                <Wheat className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] text-sage-300 font-medium block">Estimasi Waktu Panen</span>
                <span className="text-sm sm:text-base font-extrabold text-wheat-300">
                  {currentPlant?.timeto_harvest
                    ? `${currentPlant.timeto_harvest} Hari Lagi`
                    : "Menunggu Jadwal"}
                </span>
              </div>
            </div>
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-forest-950/60 text-sage-300 uppercase tracking-wider">
              Agronomi
            </span>
          </div>
        </div>
      </div>

      {/* AI Agronomy & Vision Intelligence Hub */}
      <AiAgronomyWidget
        currentPhase={currentPlant?.phase}
        plantAge={currentPlant?.age ? Number(currentPlant.age) : undefined}
        plantCommodity={currentPlant?.commodity}
        soilPh={data.soil_ph?.[0]?.read_value ? Number(data.soil_ph[0].read_value) : undefined}
        temperature={data.temperature?.[0]?.read_value}
        humidity={data.humidity?.[0]?.read_value}
      />

      {/* Environmental Telemetry Row */}
      <div className="bg-white border border-bone-300 rounded-xl shadow-2xs p-3.5 sm:p-4">
        <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-bone-200">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-wheat-100 border border-wheat-200 flex items-center justify-center text-wheat-700">
              <CloudSun className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="font-bold text-forest-900 text-sm sm:text-base">
                Stasiun Cuaca & Lingkungan Mikro
              </h3>
              <p className="text-[11px] text-sage-600">Pemantauan iklim mikro sekitar tanaman</p>
            </div>
          </div>
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-sage-100 border border-sage-200 text-forest-800">
            Realtime
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-2.5 sm:gap-3">
          <IndikatorSuhu suhu={data.temperature?.[0]?.read_value || 0} />
          <IndikatorKelembapan humid={data.humidity?.[0]?.read_value || 0} />
          <IndikatorAngin wind={data.wind?.[0]?.read_value || 0} />
          <IndikatorCahaya lux={data.lux?.[0]?.read_value || 0} />
          <div className="col-span-2 md:col-span-1">
            <IndikatorHujan rain={data.rain?.[0]?.read_value || 0} />
          </div>
        </div>
      </div>

      {/* 24-Hour Telemetry Trend Chart */}
      <TelemetryTrendChart
        nitrogen={data.nitrogen?.[0]?.read_value ? Number(data.nitrogen[0].read_value) : undefined}
        fosfor={data.fosfor?.[0]?.read_value ? Number(data.fosfor[0].read_value) : undefined}
        kalium={data.kalium?.[0]?.read_value ? Number(data.kalium[0].read_value) : undefined}
        ph={data.soil_ph?.[0]?.read_value ? Number(data.soil_ph[0].read_value) : undefined}
        temperature={data.temperature?.[0]?.read_value}
        humidity={data.humidity?.[0]?.read_value}
      />

      {/* Tasks & Agronomic Warnings Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
        {/* Farm Action Items / Tasks */}
        <div className="bg-white border border-bone-300 rounded-xl shadow-2xs p-3.5 sm:p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-bone-200">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-forest-800" />
              <h3 className="font-bold text-forest-900 text-sm">Jadwal Pemupukan & Tugas Lahan</h3>
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-sage-100 text-forest-800">
              {data.todos?.length || 0} Tugas
            </span>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {data.todos && data.todos.length > 0 ? (
              data.todos.map((todoGroup, groupIndex) =>
                todoGroup.todos.map((todo, index) => (
                  <div
                    key={`${groupIndex}-${index}`}
                    className="p-2.5 bg-bone-50 border border-bone-200 rounded-lg hover:border-sage-400 transition-colors flex items-center justify-between gap-2"
                  >
                    <div>
                      <h4 className="font-bold text-xs text-forest-900">
                        {todo.hand_title}
                      </h4>
                      <p className="text-[11px] text-sage-600 mt-0.5">
                        Jenis Pupuk: <span className="font-semibold text-forest-800">{todo.fertilizer_type}</span>
                      </p>
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white border border-bone-300 text-forest-900 shadow-2xs whitespace-nowrap">
                      {todo.todo_date}
                    </span>
                  </div>
                ))
              )
            ) : (
              <div className="text-center py-6">
                <CheckCircle2 className="w-8 h-8 text-sage-500 mx-auto mb-1 opacity-80" />
                <p className="text-[11px] text-sage-600 font-medium">
                  Tidak ada agenda pemupukan tertunda hari ini
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Warning / Alerts Feed */}
        <div className="bg-white border border-bone-300 rounded-xl shadow-2xs p-3.5 sm:p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-bone-200">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-clay-600" />
              <h3 className="font-bold text-forest-900 text-sm">Peringatan & Rekomendasi</h3>
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-wheat-100 text-wheat-900 border border-wheat-200">
              {actionMessages.length} Peringatan
            </span>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {actionMessages.length > 0 ? (
              actionMessages.map((msg, index) => {
                const isDanger = msg.value_status === "Danger";
                return (
                  <div
                    key={index}
                    className={`p-2.5 rounded-lg border flex items-start gap-2 ${
                      isDanger
                        ? "bg-clay-50 border-clay-200 text-clay-900"
                        : "bg-wheat-50 border-wheat-200 text-wheat-900"
                    }`}
                  >
                    <div
                      className={`p-1 rounded-md mt-0.5 ${
                        isDanger ? "bg-clay-100 text-clay-700" : "bg-wheat-100 text-wheat-700"
                      }`}
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1.5">
                        <h4 className="font-bold text-xs truncate">
                          {msg.status_message}
                        </h4>
                        <span className="text-[9px] font-bold uppercase tracking-wider opacity-80">
                          {msg.sensor_name}
                        </span>
                      </div>
                      <p className="text-[11px] mt-0.5 font-medium opacity-90">
                        Rekomendasi: {msg.action_message}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-6">
                <CheckCircle className="w-8 h-8 text-sage-500 mx-auto mb-1 opacity-80" />
                <p className="text-[11px] text-sage-600 font-medium">
                  Semua parameter lahan dalam ambang batas optimal
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Soil Sensors Telemetry Section */}
      <div className="bg-white border border-bone-300 rounded-xl shadow-2xs p-3.5 sm:p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3 pb-2.5 border-b border-bone-200">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-forest-800 text-wheat-300 flex items-center justify-center font-bold">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="font-bold text-forest-900 text-sm sm:text-base">
                Monitoring Telemetri Sensor Tanah
              </h3>
              <p className="text-[11px] text-sage-600">Data hara NPK dan pH per zona lahan</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-forest-800">
            <span className="w-2 h-2 rounded-full bg-sage-500 animate-pulse"></span>
            <span className="text-[11px]">Live Stream</span>
          </div>
        </div>

        {data.soil_ph?.length ? (
          <div>
            {/* Plot / Zone Selector Bar */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-3 scrollbar-none">
              {data.soil_ph.map((sensor, index) => {
                const isSelected = selectedPlotIndex === index;
                const isDanger = sensor.value_status === "Danger";
                return (
                  <button
                    key={sensor.sensor}
                    onClick={() => setSelectedPlotIndex(index)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap active:scale-[0.98] ${
                      isSelected
                        ? "bg-forest-900 text-wheat-300 shadow-2xs"
                        : "bg-bone-100 hover:bg-bone-200 text-forest-800 border border-bone-200"
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isDanger ? "bg-clay-500 animate-ping" : "bg-sage-500"
                      }`}
                    />
                    <span>Plot Area {index + 1}</span>
                  </button>
                );
              })}
              <button
                onClick={() => setSelectedPlotIndex(-1)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap active:scale-[0.98] ${
                  selectedPlotIndex === -1
                    ? "bg-forest-900 text-wheat-300 shadow-2xs"
                    : "bg-bone-100 hover:bg-bone-200 text-forest-800 border border-bone-200"
                }`}
              >
                <span>Semua Plot ({data.soil_ph.length})</span>
              </button>
            </div>

            {/* Render selected plot or all plots */}
            <div className="space-y-3">
              {(selectedPlotIndex === -1
                ? data.soil_ph
                : data.soil_ph.filter((_, idx) => idx === selectedPlotIndex)
              ).map((sensor, mapIndex) => {
                const actualIndex = selectedPlotIndex === -1 ? mapIndex : selectedPlotIndex;
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
          <div className="text-center py-8 bg-bone-50 rounded-xl border border-bone-200">
            <TrendingUp className="w-8 h-8 text-sage-400 mx-auto mb-2" />
            <h4 className="text-xs font-bold text-forest-900 mb-0.5">
              Data Sensor Belum Tersedia
            </h4>
            <p className="text-[11px] text-sage-600">
              Pilih lokasi lahan yang memiliki node sensor aktif
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

