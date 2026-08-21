"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Site from "../../Components/dropdownSite";
import SensorRealtime from "../../Components/sensorRealtime";
import Map from "../../Components/map";
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

  const [siteId, setSiteId] = useState<string | null>(null);
  const [data, setData] = useState<DataResponse | null>(null);
  const [warnings, setWarnings] = useState<ActionMessage[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // INIT SITE ID
  useEffect(() => {
    const storedSite = localStorage.getItem("selectedSiteId");
    if (storedSite) setSiteId(storedSite);
  }, []);

  const fetchRealtimeData = async () => {
    setIsRefreshing(true);
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    if (!token || !user) {
      router.push("/login");
      return;
    }

    if (!siteId) {
      setIsRefreshing(false);
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/realtime?site_id=${siteId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        },
      );

      if (!response.ok) throw new Error("Failed fetch realtime");

      const res = await response.json();
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
    } catch (err) {
      console.error(err);
    } finally {
      setIsRefreshing(false);
    }
  };

  // AUTH + FETCH REALTIME
  useEffect(() => {
    fetchRealtimeData();
  }, [siteId, router]);

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="bg-white border border-bone-300/80 rounded-2xl p-4 sm:p-6 shadow-soft flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-forest-900 tracking-tight">
            Telemetri Realtime Lahan
          </h2>
          <p className="text-sm text-sage-700 mt-0.5">
            Streaming data sensor tanah 8-parameter & kondisi mikroklimat
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <Site
            onSiteChange={(id) => setSiteId(id)}
            className="w-full sm:w-60"
          />

          <button
            onClick={fetchRealtimeData}
            disabled={isRefreshing}
            className="px-4 py-2.5 bg-white border border-bone-300 hover:border-sage-400 text-forest-800 text-sm font-semibold rounded-xl transition-all shadow-sm flex items-center gap-2 hover:bg-bone-50 disabled:opacity-60"
          >
            <RefreshCw
              className={`w-4 h-4 text-sage-600 ${isRefreshing ? "animate-spin" : ""}`}
            />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Meta info */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-1 text-xs text-sage-700 font-medium">
        <div className="flex items-center gap-2 bg-bone-100/70 border border-bone-200 px-3 py-1.5 rounded-full">
          <Clock className="w-3.5 h-3.5 text-sage-600" />
          <span>Update Terakhir:</span>
          <span className="font-bold text-forest-900">
            {data?.last_updated || "Sinkronisasi..."}
          </span>
        </div>

        <div className="flex items-center gap-2 bg-bone-100/70 border border-bone-200 px-3 py-1.5 rounded-full">
          <Activity className="w-3.5 h-3.5 text-sage-600" />
          <span>Node Terpasang:</span>
          <span className="font-bold text-forest-900">
            {data?.soil_temp.length || 0} Zona Area
          </span>
        </div>
      </div>

      {/* Map & Warnings Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Map */}
        <div className="lg:col-span-7 bg-white border border-bone-300 rounded-2xl shadow-soft overflow-hidden flex flex-col">
          <div className="p-4 sm:p-5 border-b border-bone-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-forest-50 border border-forest-100 flex items-center justify-center text-forest-700">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-forest-900 text-base">Denah Plot Titik Sensor</h3>
                <p className="text-xs text-sage-700">Penempatan node sensor telemetri</p>
              </div>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-sage-100 border border-sage-200 text-forest-800">
              Live Link
            </span>
          </div>
          <div className="h-[320px] sm:h-[360px] relative bg-bone-100">
            <Map />
          </div>
        </div>

        {/* Warnings Feed */}
        <div className="lg:col-span-5 bg-white border border-bone-300 rounded-2xl shadow-soft p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-bone-200">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-clay-600" />
              <h3 className="font-bold text-forest-900 text-base">Peringatan Status</h3>
            </div>
            <span
              className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                warnings.length > 0
                  ? "bg-wheat-100 text-wheat-900 border-wheat-200"
                  : "bg-sage-100 text-sage-900 border-sage-200"
              }`}
            >
              {warnings.length} Masalah
            </span>
          </div>

          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
            {warnings.length > 0 ? (
              warnings.map((msg, idx) => {
                const isDanger = msg.value_status === "Danger";
                return (
                  <div
                    key={idx}
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
                        {msg.action_message}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-10">
                <CheckCircle className="w-12 h-12 text-sage-500 mx-auto mb-2 opacity-80" />
                <h4 className="text-sm font-bold text-forest-900 mb-1">
                  Semua Parameter Stabil
                </h4>
                <p className="text-xs text-sage-700">
                  Tidak ada anomali sensor yang memerlukan intervensi
                </p>
              </div>
            )}
          </div>

          {warnings.length > 0 && (
            <div className="mt-4 pt-3 border-t border-bone-200 text-xs text-sage-700 font-medium flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-wheat-600 flex-shrink-0" />
              <span>Segera lakukan verifikasi lapangan sesuai petunjuk.</span>
            </div>
          )}
        </div>
      </div>

      {/* Sensor Realtime Matrix */}
      <div className="bg-white border border-bone-300 rounded-2xl shadow-soft p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-bone-200">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-forest-800 text-wheat-300 flex items-center justify-center font-bold">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-forest-900 text-base sm:text-lg">
                Data Sensor Real-time Lengkap
              </h3>
              <p className="text-xs text-sage-700">
                Data terperinci 8 parameter hara dan kondisi fisik tanah
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-3 text-xs font-semibold text-forest-800">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-sage-500" />
              <span>Optimal</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-wheat-500" />
              <span>Perhatian</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-clay-500" />
              <span>Kritis</span>
            </div>
          </div>
        </div>

        {data?.soil_temp.length ? (
          <div className="space-y-4">
            {data.soil_temp.map((sensor, index) => (
              <SensorRealtime
                key={sensor.sensor || index}
                sensor={index + 1}
                suhu={+sensor.read_value || 0}
                humid={+data.soil_hum[index]?.read_value || 0}
                nitrogen={+data.nitrogen[index]?.read_value || 0}
                fosfor={+data.fosfor[index]?.read_value || 0}
                kalium={+data.kalium[index]?.read_value || 0}
                ph={+data.soil_ph[index]?.read_value || 0}
                ec={+data.ec[index]?.read_value || 0}
                tds={+data.tds[index]?.read_value || 0}
                statusSuhu={sensor.value_status}
                statusHumid={data.soil_hum[index]?.value_status}
                statusNitrogen={data.nitrogen[index]?.value_status}
                statusFosfor={data.fosfor[index]?.value_status}
                statusKalium={data.kalium[index]?.value_status}
                statusPh={data.soil_ph[index]?.value_status}
                statusEc={data.ec[index]?.value_status}
                statusTDS={data.tds[index]?.value_status}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-bone-50 rounded-2xl border border-bone-200">
            <Activity className="w-10 h-10 text-sage-400 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-forest-900 mb-1">
              Data Telemetri Belum Tersedia
            </h4>
            <p className="text-xs text-sage-700 mb-4">
              Pilih lokasi lahan atau periksa sambungan gateway IoT
            </p>
            <button
              onClick={fetchRealtimeData}
              className="px-4 py-2 bg-forest-900 hover:bg-forest-800 text-wheat-300 text-xs font-bold rounded-xl transition-all shadow-sm"
            >
              Muat Ulang Telemetri
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

