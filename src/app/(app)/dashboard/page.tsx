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
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const IMAGE_BASE = "/assets/img";

  const fetchData = async () => {
    setIsRefreshing(true);
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    if (!token || !user) {
      router.push("/login");
      return;
    }

    if (!siteId || siteId === "undefined" || siteId === "null") {
      console.warn("Invalid or missing siteId, please select a site.");
      setIsRefreshing(false);
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
    }
  };

  useEffect(() => {
    fetchData();
  }, [siteId]);

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
            onClick={fetchData}
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

      {/* Meta Bar: Last Update & Active Plot */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-1 text-xs text-sage-700 font-medium">
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

      {/* Top Grid: Interactive Map & Plant Information */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Map Section */}
        <div className="lg:col-span-7 bg-white border border-bone-300 rounded-2xl shadow-soft overflow-hidden flex flex-col">
          <div className="p-4 sm:p-5 border-b border-bone-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-forest-50 border border-forest-100 flex items-center justify-center text-forest-700">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-forest-900 text-base">Peta Digital Twin Lahan</h3>
                <p className="text-xs text-sage-700">Visualisasi tata letak sensor & plot tanah</p>
              </div>
            </div>
            <FloatingGallery />
          </div>

          <div className="h-[320px] sm:h-[360px] relative bg-bone-100">
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
        <div className="lg:col-span-5 bg-white border border-bone-300 rounded-2xl shadow-soft p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-bone-200">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-sage-50 border border-sage-100 flex items-center justify-center text-sage-600">
                <Leaf className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-forest-900 text-base">Data Agronomi Tanaman</h3>
                <p className="text-xs text-sage-700">Status pertumbuhan vegetatif saat ini</p>
              </div>
            </div>
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-forest-900 text-wheat-300">
              {currentPlant ? currentPlant.phase || "Aktif" : "Tidak Ada Data"}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="p-3.5 rounded-xl bg-bone-50 border border-bone-200">
              <span className="text-[11px] font-bold text-sage-700 uppercase tracking-wider block mb-1">
                Komoditas
              </span>
              <span className="text-base sm:text-lg font-extrabold text-forest-900 block truncate">
                {currentPlant?.commodity || "Padi Sawah"}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-bone-50 border border-bone-200">
              <span className="text-[11px] font-bold text-sage-700 uppercase tracking-wider block mb-1">
                Varietas
              </span>
              <span className="text-base sm:text-lg font-extrabold text-forest-900 block truncate">
                {currentPlant?.variety || "Ciherang / IR64"}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-bone-50 border border-bone-200">
              <span className="text-[11px] font-bold text-sage-700 uppercase tracking-wider block mb-1">
                Umur Tanaman
              </span>
              <span className="text-base sm:text-lg font-extrabold text-forest-900 block">
                {currentPlant?.age ? `${currentPlant.age} HST` : "-"}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-bone-50 border border-bone-200">
              <span className="text-[11px] font-bold text-sage-700 uppercase tracking-wider block mb-1">
                Tanggal Tanam
              </span>
              <span className="text-sm sm:text-base font-bold text-forest-900 block truncate">
                {currentPlant?.pl_date_planting || "-"}
              </span>
            </div>
          </div>

          {/* Harvest Countdown Banner */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-forest-900 to-forest-800 text-bone-100 flex items-center justify-between border border-forest-700 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-wheat-400/20 border border-wheat-400/30 flex items-center justify-center text-wheat-300">
                <Wheat className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-sage-300 font-medium block">Estimasi Waktu Panen</span>
                <span className="text-lg font-extrabold text-wheat-300">
                  {currentPlant?.timeto_harvest
                    ? `${currentPlant.timeto_harvest} Hari Lagi`
                    : "Menunggu Jadwal"}
                </span>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-1 rounded bg-forest-950/60 text-sage-300 uppercase tracking-wider">
              Agronomi
            </span>
          </div>
        </div>
      </div>

      {/* Environmental Telemetry Row */}
      <div className="bg-white border border-bone-300 rounded-2xl shadow-soft p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-bone-200">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-wheat-100 border border-wheat-200 flex items-center justify-center text-wheat-700">
              <CloudSun className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-forest-900 text-base sm:text-lg">
                Stasiun Cuaca & Lingkungan Mikro
              </h3>
              <p className="text-xs text-sage-700">Pemantauan iklim mikro sekitar tanaman</p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-sage-100 border border-sage-200 text-forest-800">
            Realtime
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4">
          <IndikatorSuhu suhu={data.temperature?.[0]?.read_value || 0} />
          <IndikatorKelembapan humid={data.humidity?.[0]?.read_value || 0} />
          <IndikatorAngin wind={data.wind?.[0]?.read_value || 0} />
          <IndikatorCahaya lux={data.lux?.[0]?.read_value || 0} />
          <div className="col-span-2 md:col-span-1">
            <IndikatorHujan rain={data.rain?.[0]?.read_value || 0} />
          </div>
        </div>
      </div>

      {/* Tasks & Agronomic Warnings Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Farm Action Items / Tasks */}
        <div className="bg-white border border-bone-300 rounded-2xl shadow-soft p-4 sm:p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-bone-200">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-forest-800" />
              <h3 className="font-bold text-forest-900 text-base">Jadwal Pemupukan & Tugas Lahan</h3>
            </div>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-sage-100 text-forest-800">
              {data.todos?.length || 0} Tugas
            </span>
          </div>

          <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
            {data.todos && data.todos.length > 0 ? (
              data.todos.map((todoGroup, groupIndex) =>
                todoGroup.todos.map((todo, index) => (
                  <div
                    key={`${groupIndex}-${index}`}
                    className="p-3.5 bg-bone-50 border border-bone-200 rounded-xl hover:border-sage-400 transition-colors flex items-center justify-between gap-3"
                  >
                    <div>
                      <h4 className="font-bold text-sm text-forest-900">
                        {todo.hand_title}
                      </h4>
                      <p className="text-xs text-sage-700 mt-0.5">
                        Jenis Pupuk: <span className="font-semibold text-forest-800">{todo.fertilizer_type}</span>
                      </p>
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-white border border-bone-300 text-forest-900 shadow-2xs whitespace-nowrap">
                      {todo.todo_date}
                    </span>
                  </div>
                ))
              )
            ) : (
              <div className="text-center py-8">
                <CheckCircle2 className="w-10 h-10 text-sage-500 mx-auto mb-2 opacity-80" />
                <p className="text-xs text-sage-700 font-medium">
                  Tidak ada agenda pemupukan tertunda hari ini
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Warning / Alerts Feed */}
        <div className="bg-white border border-bone-300 rounded-2xl shadow-soft p-4 sm:p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-bone-200">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-clay-600" />
              <h3 className="font-bold text-forest-900 text-base">Peringatan & Rekomendasi</h3>
            </div>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-wheat-100 text-wheat-900 border border-wheat-200">
              {actionMessages.length} Peringatan
            </span>
          </div>

          <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
            {actionMessages.length > 0 ? (
              actionMessages.map((msg, index) => {
                const isDanger = msg.value_status === "Danger";
                return (
                  <div
                    key={index}
                    className={`p-3.5 rounded-xl border flex items-start gap-3 ${
                      isDanger
                        ? "bg-clay-50 border-clay-200 text-clay-900"
                        : "bg-wheat-50 border-wheat-200 text-wheat-900"
                    }`}
                  >
                    <div
                      className={`p-1.5 rounded-lg mt-0.5 ${
                        isDanger ? "bg-clay-100 text-clay-700" : "bg-wheat-100 text-wheat-700"
                      }`}
                    >
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-bold text-xs sm:text-sm truncate">
                          {msg.status_message}
                        </h4>
                        <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">
                          {msg.sensor_name}
                        </span>
                      </div>
                      <p className="text-xs mt-1 font-medium opacity-90">
                        Rekomendasi: {msg.action_message}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8">
                <CheckCircle className="w-10 h-10 text-sage-500 mx-auto mb-2 opacity-80" />
                <p className="text-xs text-sage-700 font-medium">
                  Semua parameter lahan dalam ambang batas optimal
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Soil Sensors Telemetry Section */}
      <div className="bg-white border border-bone-300 rounded-2xl shadow-soft p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-bone-200">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-forest-800 text-wheat-300 flex items-center justify-center font-bold">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-forest-900 text-base sm:text-lg">
                Monitoring Telemetri Sensor Tanah
              </h3>
              <p className="text-xs text-sage-700">Data hara NPK dan pH per zona lahan</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-forest-800">
            <span className="w-2 h-2 rounded-full bg-sage-500"></span>
            <span>Live Stream</span>
          </div>
        </div>

        {data.soil_ph?.length ? (
          <div className="space-y-4">
            {data.soil_ph.map((sensor, index) => {
              const nitrogen = data.nitrogen?.[index]?.read_value || 0;
              const fosfor = data.fosfor?.[index]?.read_value || 0;
              const kalium = data.kalium?.[index]?.read_value || 0;
              const ph = sensor.read_value || 0;

              return (
                <Realtime
                  key={sensor.sensor}
                  sensor={index + 1}
                  nitrogen={Number(nitrogen)}
                  fosfor={Number(fosfor)}
                  kalium={Number(kalium)}
                  ph={Number(ph)}
                  statusPh={data.soil_ph?.[index]?.value_status ?? ""}
                  statusNitrogen={data.nitrogen?.[index]?.value_status ?? ""}
                  statusFosfor={data.fosfor?.[index]?.value_status ?? ""}
                  statusKalium={data.kalium?.[index]?.value_status ?? "OK"}
                />
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-bone-50 rounded-2xl border border-bone-200">
            <TrendingUp className="w-10 h-10 text-sage-400 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-forest-900 mb-1">
              Data Sensor Belum Tersedia
            </h4>
            <p className="text-xs text-sage-700">
              Pilih lokasi lahan yang memiliki node sensor aktif
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

