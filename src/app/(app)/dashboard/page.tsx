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
  Droplets,
  Wind,
  Sun,
  CloudRain,
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

interface Device {
  dev_id: string;
  dev_img: string | null;
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
      } catch (err) {
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-6">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Lahan</h1>
          <p className="text-gray-600 mt-1">
            Monitoring real-time kondisi lahan pertanian
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full lg:w-auto">
          <Site
            onSiteChange={(id) => setSiteId(id)}
            className="w-full sm:w-64"
          />

          <div className="flex items-center gap-3">
            <button
              onClick={fetchData}
              disabled={isRefreshing}
              className="px-4 py-2.5 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <RefreshCw
                className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
              />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <button
              onClick={handleLogout}
              className="px-4 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all flex items-center gap-2 shadow-lg hover:shadow-xl"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Last Updated Info */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Clock className="w-4 h-4" />
          <span>Update Terakhir: </span>
          <span className="font-semibold">
            {data.last_updated || "Sedang memuat..."}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-600">
            Site ID: {siteId || "Belum dipilih"}
          </span>
        </div>
      </div>

      {/* Map & Plant Info Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Map Section */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden h-full">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                Peta Lahan
              </h2>
              <FloatingGallery />
            </div>
            <div className="h-[350px] relative">
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
        </div>

        {/* Plant Info Cards */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl shadow-xl p-5">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Leaf className="w-5 h-5 text-green-600" />
              Informasi Tanaman
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border border-green-100">
                <div className="flex items-center gap-2 mb-2">
                  <Sprout className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-gray-700">
                    Komoditas
                  </span>
                </div>
                <span className="text-xl font-bold text-gray-900">
                  {data.plants?.length ? data.plants[0].commodity : "-"}
                </span>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-xl border border-blue-100">
                <div className="flex items-center gap-2 mb-2">
                  <Sprout className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-gray-700">
                    Varietas
                  </span>
                </div>
                <span className="text-xl font-bold text-gray-900">
                  {data.plants?.length ? data.plants[0].variety : "-"}
                </span>
              </div>

              <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-4 rounded-xl border border-amber-100">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-amber-600" />
                  <span className="text-sm font-medium text-gray-700">
                    Umur Tanam
                  </span>
                </div>
                <span className="text-xl font-bold text-gray-900">
                  {data.plants?.length ? `${data.plants[0].age} HST` : "-"}
                </span>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-violet-50 p-4 rounded-xl border border-purple-100">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-medium text-gray-700">
                    Tanggal Tanam
                  </span>
                </div>
                <span className="text-sm font-bold text-gray-900">
                  {data.plants?.length ? data.plants[0].pl_date_planting : "-"}
                </span>
              </div>

              <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-4 rounded-xl border border-indigo-100">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-indigo-600" />
                  <span className="text-sm font-medium text-gray-700">
                    Fase
                  </span>
                </div>
                <span className="text-xl font-bold text-gray-900">
                  {data.plants?.length ? data.plants[0].phase : "-"}
                </span>
              </div>

              <div className="bg-gradient-to-br from-emerald-500 to-green-600 p-4 rounded-xl shadow-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Wheat className="w-4 h-4 text-white" />
                  <span className="text-sm font-medium text-white">
                    Waktu Panen
                  </span>
                </div>
                <span className="text-xl font-bold text-white">
                  {data.plants?.length
                    ? `${data.plants[0].timeto_harvest} Hari`
                    : "-"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Indicators & Warnings Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Environmental Indicators */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Thermometer className="w-5 h-5 text-blue-600" />
              Indikator Lingkungan
            </h2>
            <span className="text-sm text-gray-500">Real-time</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="col-span-2 md:col-span-1">
              <IndikatorSuhu suhu={data.temperature?.[0]?.read_value || 0} />
            </div>
            <div className="col-span-2 md:col-span-1">
              <IndikatorKelembapan
                humid={data.humidity?.[0]?.read_value || 0}
              />
            </div>
            <div className="col-span-2 md:col-span-1">
              <IndikatorAngin wind={data.wind?.[0]?.read_value || 0} />
            </div>
            <div className="col-span-2 md:col-span-1">
              <IndikatorCahaya lux={data.lux?.[0]?.read_value || 0} />
            </div>
            <div className="col-span-2 md:col-span-1">
              <IndikatorHujan rain={data.rain?.[0]?.read_value || 0} />
            </div>
          </div>
        </div>

        {/* Tasks & Warnings */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              Tugas & Peringatan
            </h2>
            <div className="flex gap-2">
              <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                {data.todos?.length || 0} Tugas
              </span>
              <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                {actionMessages.length} Peringatan
              </span>
            </div>
          </div>

          <div className="space-y-6">
            {/* Tasks Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-3">
                Tugas Hari Ini
              </h3>
              <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                {data.todos && data.todos.length > 0 ? (
                  data.todos.map((todoGroup, groupIndex) =>
                    todoGroup.todos.map((todo, index) => (
                      <div
                        key={`${groupIndex}-${index}`}
                        className="p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200 hover:border-blue-200 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900">
                            {todo.hand_title}
                          </h4>
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                            {todo.todo_date}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          Jenis Pupuk:{" "}
                          <span className="font-semibold text-gray-800">
                            {todo.fertilizer_type}
                          </span>
                        </p>
                      </div>
                    ))
                  )
                ) : (
                  <div className="text-center py-6">
                    <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-2" />
                    <p className="text-gray-500">
                      Tidak ada tugas untuk saat ini
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Warnings Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-3">
                Peringatan Sistem
              </h3>
              <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                {actionMessages.length > 0 ? (
                  actionMessages.map((msg, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-xl border ${
                        msg.value_status === "Danger"
                          ? "bg-gradient-to-r from-red-50 to-rose-50 border-red-200"
                          : "bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`p-2 rounded-lg ${
                            msg.value_status === "Danger"
                              ? "bg-red-100"
                              : "bg-amber-100"
                          }`}
                        >
                          <AlertTriangle
                            className={`w-5 h-5 ${
                              msg.value_status === "Danger"
                                ? "text-red-600"
                                : "text-amber-600"
                            }`}
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 mb-1">
                            {msg.status_message}
                          </h4>
                          <p className="text-sm text-gray-600 mb-2">
                            Sensor: {msg.sensor_name}
                          </p>
                          <div
                            className={`px-3 py-1 rounded-full text-sm font-medium inline-block ${
                              msg.value_status === "Danger"
                                ? "bg-red-100 text-red-700"
                                : "bg-amber-100 text-amber-700"
                            }`}
                          >
                            {msg.action_message}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6">
                    <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-2" />
                    <p className="text-gray-500">
                      Semua sistem dalam kondisi normal
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Realtime Sensors Section */}
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            Data Sensor Real-time
          </h2>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Live Data</span>
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
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Data Sensor Tidak Tersedia
            </h3>
            <p className="text-gray-500">
              Pastikan perangkat sensor terhubung dengan benar
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
