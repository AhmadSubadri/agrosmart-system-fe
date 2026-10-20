"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Site from "../../Components/dropdownSite";
import SensorRealtime from "../../Components/sensorRealtime";
import Map from "../../Components/map";
import RealtimeStreamingChart from "../../Components/realtime/RealtimeStreamingChart";
import {
  AlertTriangle,
  Clock,
  MapPin,
  Thermometer,
  Droplets,
  Zap,
  RefreshCw,
  Activity,
  CheckCircle,
  TrendingUp,
  Shield,
  Sprout,
  CheckCircle2,
  SlidersHorizontal,
} from "lucide-react";

interface ActionMessage {
  sensor_name: string;
  action_message: string;
  status_message: string;
  value_status: string;
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

interface DataResponse {
  soil_temp: Sensor[];
  soil_hum: Sensor[];
  soil_ph: Sensor[];
  nitrogen: Sensor[];
  fosfor: Sensor[];
  kalium: Sensor[];
  ec: Sensor[];
  tds: Sensor[];
  salinity: Sensor[];
  last_updated?: string;
}

export default function Realtime() {
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const IMAGE_BASE = "/assets/img";

  const [siteId, setSiteId] = useState<string | null>(null);
  const [data, setData] = useState<DataResponse | null>(null);
  const [warnings, setWarnings] = useState<ActionMessage[]>([]);
  const [mapImageUrl, setMapImageUrl] = useState<string | null>(null);
  const [selectedPlotIndex, setSelectedPlotIndex] = useState<number>(0);

  // Auto-Sync Realtime Heartbeat States
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isBackgroundSync, setIsBackgroundSync] = useState(false);
  const [isAutoSync, setIsAutoSync] = useState(true);
  const [countdown, setCountdown] = useState(15);

  // Init site ID from local storage
  useEffect(() => {
    const storedSite = localStorage.getItem("selectedSiteId");
    if (storedSite && storedSite !== "undefined" && storedSite !== "null") {
      setSiteId(storedSite);
    }
  }, []);

  const fetchRealtimeData = async (silent = false) => {
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
      setIsRefreshing(false);
      setIsBackgroundSync(false);
      return;
    }

    const headers = {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    };

    const safeFetch = async (url: string) => {
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
      // Fetch realtime sensors and dashboard info in parallel
      const [res, dashRes] = await Promise.all([
        safeFetch(`${API_URL}/api/realtime?site_id=${siteId}`),
        safeFetch(`${API_URL}/api/dashboard?site_id=${siteId}`),
      ]);

      if (dashRes?.devices?.[0]?.dev_img) {
        setMapImageUrl(`${IMAGE_BASE}/${dashRes.devices[0].dev_img}`);
      }

      if (res) {
        const sensors: Sensor[] = res.sensors || [];

        const groupBy = (prefix: string) =>
          sensors.filter((s) => s.sensor.startsWith(prefix));

        const parsed: DataResponse = {
          soil_temp: groupBy("soil_temp"),
          soil_hum: groupBy("soil_hum"),
          soil_ph: groupBy("soil_ph"),
          nitrogen: groupBy("soil_nitro"),
          fosfor: groupBy("soil_phos"),
          kalium: groupBy("soil_pot"),
          ec: groupBy("soil_con"),
          tds: groupBy("soil_tds"),
          salinity: groupBy("soil_salin"),
          last_updated: res.last_updated,
        };

        setData(parsed);

        // WARNING PARSE
        const warnList: ActionMessage[] = sensors
          .filter((s) => ["Warning", "Danger"].includes(s.value_status))
          .map((s) => ({
            sensor_name: s.sensor_name,
            action_message: s.action_message || "-",
            status_message: s.status_message,
            value_status: s.value_status,
          }));

        setWarnings(warnList);
      }
    } catch (err) {
      console.error("Realtime fetch error:", err);
    } finally {
      setIsRefreshing(false);
      setIsBackgroundSync(false);
      setCountdown(15);
    }
  };

  // Trigger fetch when site changes
  useEffect(() => {
    if (siteId) {
      fetchRealtimeData();
    }
  }, [siteId]);

  // Realtime Auto-Polling Heartbeat (Every 15 Seconds)
  useEffect(() => {
    if (!siteId || !isAutoSync) return;

    const interval = setInterval(() => {
      // Pause polling if user is on another tab to save battery and network
      if (typeof document !== "undefined" && document.hidden) return;

      setCountdown((prev) => {
        if (prev <= 1) {
          fetchRealtimeData(true);
          return 15;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [siteId, isAutoSync]);

  // Calculate field-wide average metrics
  const fieldAverages = useMemo(() => {
    if (!data) return null;

    const calcAvg = (items: Sensor[]) => {
      if (!items || items.length === 0) return 0;
      const sum = items.reduce((acc, curr) => acc + (parseFloat(curr.read_value) || 0), 0);
      return sum / items.length;
    };

    return {
      avgPh: calcAvg(data.soil_ph),
      avgTemp: calcAvg(data.soil_temp),
      avgHum: calcAvg(data.soil_hum),
      avgEc: calcAvg(data.ec),
      totalPlots: data.soil_temp.length,
    };
  }, [data]);

  // Active plot values for the Realtime Streaming Chart
  const activePlotData = useMemo(() => {
    if (!data) return null;
    if (selectedPlotIndex === -1) {
      return {
        nitrogen: data.nitrogen?.[0]?.read_value ? Number(data.nitrogen[0].read_value) : 140,
        fosfor: data.fosfor?.[0]?.read_value ? Number(data.fosfor[0].read_value) : 367,
        kalium: data.kalium?.[0]?.read_value ? Number(data.kalium[0].read_value) : 362,
        ph: fieldAverages?.avgPh || 6.4,
        temp: fieldAverages?.avgTemp || 27.8,
        hum: fieldAverages?.avgHum || 65.8,
        ec: fieldAverages?.avgEc || 844,
      };
    }
    const idx = Math.max(0, selectedPlotIndex);
    return {
      nitrogen: data.nitrogen?.[idx]?.read_value ? Number(data.nitrogen[idx].read_value) : 140,
      fosfor: data.fosfor?.[idx]?.read_value ? Number(data.fosfor[idx].read_value) : 367,
      kalium: data.kalium?.[idx]?.read_value ? Number(data.kalium[idx].read_value) : 362,
      ph: data.soil_ph?.[idx]?.read_value ? Number(data.soil_ph[idx].read_value) : 6.4,
      temp: data.soil_temp?.[idx]?.read_value ? Number(data.soil_temp[idx].read_value) : 27.8,
      hum: data.soil_hum?.[idx]?.read_value ? Number(data.soil_hum[idx].read_value) : 65.8,
      ec: data.ec?.[idx]?.read_value ? Number(data.ec[idx].read_value) : 844,
    };
  }, [data, selectedPlotIndex, fieldAverages]);

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Header Controls Bar */}
      <div className="bg-white border border-bone-300 rounded-xl p-3.5 sm:p-5 shadow-2xs flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-extrabold text-forest-900 tracking-tight">
            Telemetri Realtime Lahan
          </h2>
          <p className="text-[11px] sm:text-xs text-sage-600 mt-0.5">
            Streaming telemetri sensor tanah 8-parameter & pemantauan zona aktif
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <Site
            onSiteChange={(id) => setSiteId(id)}
            className="w-full sm:w-56"
          />

          <button
            onClick={() => fetchRealtimeData()}
            disabled={isRefreshing}
            className="px-3.5 py-2 bg-white border border-bone-300 hover:border-sage-400 text-forest-800 text-xs font-bold rounded-lg transition-all shadow-2xs flex items-center gap-1.5 hover:bg-bone-50 disabled:opacity-60 active:scale-[0.98]"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 text-sage-600 ${isRefreshing ? "animate-spin" : ""}`}
            />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Meta Bar: Last Update, Active Nodes, & Live Sync Heartbeat */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 px-1 text-xs text-sage-700 font-medium">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 bg-bone-100/70 border border-bone-200 px-3 py-1.5 rounded-full">
            <Clock className="w-3.5 h-3.5 text-sage-600" />
            <span>Update Terakhir:</span>
            <span className="font-bold text-forest-900">
              {data?.last_updated || "Sinkronisasi..."}
            </span>
          </div>

          <div className="flex items-center gap-1.5 bg-bone-100/70 border border-bone-200 px-3 py-1.5 rounded-full">
            <Activity className="w-3.5 h-3.5 text-sage-600" />
            <span>Node Aktif:</span>
            <span className="font-bold text-forest-900">
              {data?.soil_temp.length || 0} Zona Plot
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

      {/* Quick Summary Agronomy KPI Tiles (Field-wide) */}
      {fieldAverages && fieldAverages.totalPlots > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
          <div className="bg-white border border-bone-300 rounded-xl p-3 shadow-2xs flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-sage-600 uppercase tracking-wider block">
                Rata-rata pH Tanah
              </span>
              <span className="text-xl font-black text-forest-900">
                {fieldAverages.avgPh.toFixed(1)}
              </span>
              <p className="text-[10px] text-sage-600">
                {fieldAverages.avgPh >= 6.0 && fieldAverages.avgPh <= 7.0
                  ? "Rentang Netral / Ideal"
                  : "Kondisi Masam"}
              </p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-forest-50 border border-forest-100 flex items-center justify-center text-forest-800">
              <Sprout className="w-4 h-4" />
            </div>
          </div>

          <div className="bg-white border border-bone-300 rounded-xl p-3 shadow-2xs flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-sage-600 uppercase tracking-wider block">
                Suhu Rata-rata Tanah
              </span>
              <span className="text-xl font-black text-forest-900">
                {fieldAverages.avgTemp.toFixed(1)}°C
              </span>
              <p className="text-[10px] text-sage-600">Termal Perakaran Sehat</p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-clay-50 border border-clay-100 flex items-center justify-center text-clay-700">
              <Thermometer className="w-4 h-4" />
            </div>
          </div>

          <div className="bg-white border border-bone-300 rounded-xl p-3 shadow-2xs flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-sage-600 uppercase tracking-wider block">
                Kelembapan Tanah
              </span>
              <span className="text-xl font-black text-forest-900">
                {fieldAverages.avgHum.toFixed(0)}%
              </span>
              <p className="text-[10px] text-sage-600">Kondisi Macak-macak</p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-wheat-50 border border-wheat-200 flex items-center justify-center text-wheat-800">
              <Droplets className="w-4 h-4" />
            </div>
          </div>

          <div className="bg-white border border-bone-300 rounded-xl p-3 shadow-2xs flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-sage-600 uppercase tracking-wider block">
                Konduktivitas Listrik (EC)
              </span>
              <span className="text-xl font-black text-forest-900">
                {fieldAverages.avgEc.toFixed(2)}
              </span>
              <p className="text-[10px] text-sage-600">Kelarutan Garam/Pupuk</p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-sage-50 border border-sage-100 flex items-center justify-center text-sage-700">
              <Zap className="w-4 h-4" />
            </div>
          </div>
        </div>
      )}

      {/* Map & Warnings Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4">
        {/* Map Section */}
        <div className="lg:col-span-7 bg-white border border-bone-300 rounded-xl shadow-2xs overflow-hidden flex flex-col">
          <div className="p-3 sm:p-3.5 border-b border-bone-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-forest-50 border border-forest-100 flex items-center justify-center text-forest-700">
                <MapPin className="w-3.5 h-3.5" />
              </div>
              <div>
                <h3 className="font-bold text-forest-900 text-sm">Denah Plot Titik Sensor</h3>
                <p className="text-[11px] text-sage-600">Penempatan node sensor telemetri di lahan</p>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-sage-100 border border-sage-200 text-forest-800">
              Digital Twin
            </span>
          </div>
          <div className="h-[250px] sm:h-[280px] relative bg-bone-100">
            <Map image={mapImageUrl ?? undefined} />
          </div>
        </div>

        {/* Warnings Feed */}
        <div className="lg:col-span-5 bg-white border border-bone-300 rounded-xl shadow-2xs p-3.5 sm:p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-bone-200">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-clay-600" />
                <h3 className="font-bold text-forest-900 text-sm">Peringatan Status</h3>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                  warnings.length > 0
                    ? "bg-wheat-100 text-wheat-900 border-wheat-200"
                    : "bg-sage-100 text-forest-800 border-sage-200"
                }`}
              >
                {warnings.length} Masalah
              </span>
            </div>

            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              {warnings.length > 0 ? (
                warnings.map((msg, idx) => {
                  const isDanger = msg.value_status === "Danger";
                  return (
                    <div
                      key={idx}
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
                          {msg.action_message}
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8">
                  <CheckCircle2 className="w-8 h-8 text-sage-500 mx-auto mb-1 opacity-80" />
                  <h4 className="text-xs font-bold text-forest-900 mb-0.5">
                    Semua Parameter Stabil
                  </h4>
                  <p className="text-[11px] text-sage-600">
                    Tidak ada anomali sensor yang memerlukan intervensi
                  </p>
                </div>
              )}
            </div>
          </div>

          {warnings.length > 0 && (
            <div className="mt-3 pt-2.5 border-t border-bone-200 text-[11px] text-sage-700 font-medium flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-wheat-600 flex-shrink-0" />
              <span>Segera verifikasi lapangan sesuai rekomendasi.</span>
            </div>
          )}
        </div>
      </div>

      {/* Realtime Live Telemetry Streaming Chart */}
      <RealtimeStreamingChart
        activePlotIndex={selectedPlotIndex}
        nitrogenVal={activePlotData?.nitrogen}
        fosforVal={activePlotData?.fosfor}
        kaliumVal={activePlotData?.kalium}
        phVal={activePlotData?.ph}
        tempVal={activePlotData?.temp}
        humVal={activePlotData?.hum}
        ecVal={activePlotData?.ec}
        lastUpdated={data?.last_updated}
        isLiveActive={isAutoSync}
      />

      {/* Sensor Realtime Matrix */}
      <div className="bg-white border border-bone-300 rounded-xl shadow-2xs p-3.5 sm:p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3 pb-2.5 border-b border-bone-200">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-forest-800 text-wheat-300 flex items-center justify-center font-bold">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="font-bold text-forest-900 text-sm sm:text-base">
                Data Sensor Real-time Lengkap
              </h3>
              <p className="text-[11px] text-sage-600">
                8 Parameter kimia (NPK, pH, Salinitas) & fisik tanah (Suhu, Kelembapan, EC, TDS)
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-3 text-xs font-semibold text-forest-800">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-sage-500" />
              <span className="text-[11px]">Optimal</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-wheat-500" />
              <span className="text-[11px]">Perhatian</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-clay-500" />
              <span className="text-[11px]">Kritis</span>
            </div>
          </div>
        </div>

        {data?.soil_temp.length ? (
          <div>
            {/* Interactive Plot / Area Zone Selector Bar */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-3 scrollbar-none">
              {data.soil_temp.map((sensor, index) => {
                const isSelected = selectedPlotIndex === index;
                const hasDanger =
                  sensor.value_status === "Danger" ||
                  data.soil_ph[index]?.value_status === "Danger" ||
                  data.nitrogen[index]?.value_status === "Danger";

                return (
                  <button
                    key={sensor.sensor || index}
                    onClick={() => setSelectedPlotIndex(index)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap active:scale-[0.98] ${
                      isSelected
                        ? "bg-forest-900 text-wheat-300 shadow-2xs"
                        : "bg-bone-100 hover:bg-bone-200 text-forest-800 border border-bone-200"
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        hasDanger ? "bg-clay-500 animate-ping" : "bg-sage-500"
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
                <span>Semua Plot ({data.soil_temp.length})</span>
              </button>
            </div>

            {/* Display Active Plot or All Plots */}
            <div className="space-y-3">
              {(selectedPlotIndex === -1
                ? data.soil_temp
                : data.soil_temp.filter((_, idx) => idx === selectedPlotIndex)
              ).map((sensor, mapIndex) => {
                const actualIndex = selectedPlotIndex === -1 ? mapIndex : selectedPlotIndex;
                return (
                  <SensorRealtime
                    key={sensor.sensor || actualIndex}
                    sensor={actualIndex + 1}
                    suhu={+sensor.read_value || 0}
                    humid={+data.soil_hum[actualIndex]?.read_value || 0}
                    nitrogen={+data.nitrogen[actualIndex]?.read_value || 0}
                    fosfor={+data.fosfor[actualIndex]?.read_value || 0}
                    kalium={+data.kalium[actualIndex]?.read_value || 0}
                    ph={+data.soil_ph[actualIndex]?.read_value || 0}
                    ec={+data.ec[actualIndex]?.read_value || 0}
                    tds={+data.tds[actualIndex]?.read_value || 0}
                    statusSuhu={sensor.value_status}
                    statusHumid={data.soil_hum[actualIndex]?.value_status}
                    statusNitrogen={data.nitrogen[actualIndex]?.value_status}
                    statusFosfor={data.fosfor[actualIndex]?.value_status}
                    statusKalium={data.kalium[actualIndex]?.value_status}
                    statusPh={data.soil_ph[actualIndex]?.value_status}
                    statusEc={data.ec[actualIndex]?.value_status}
                    statusTDS={data.tds[actualIndex]?.value_status}
                  />
                );
              })}
            </div>
          </div>
        ) : (
          <div className="text-center py-10 bg-bone-50 rounded-xl border border-bone-200">
            <Activity className="w-8 h-8 text-sage-400 mx-auto mb-1.5" />
            <h4 className="text-xs font-bold text-forest-900 mb-0.5">
              Data Telemetri Belum Tersedia
            </h4>
            <p className="text-[11px] text-sage-600 mb-3">
              Pilih lokasi lahan atau periksa sambungan gateway IoT
            </p>
            <button
              onClick={() => fetchRealtimeData()}
              className="px-3.5 py-1.5 bg-forest-900 hover:bg-forest-800 text-wheat-300 text-xs font-bold rounded-lg transition-all shadow-2xs"
            >
              Muat Ulang Telemetri
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
