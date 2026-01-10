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
  CheckCircle2,
  TrendingUp,
  Shield,
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

    if (!siteId) return;

    try {
      const response = await fetch(
        `${API_URL}/api/realtime?site_id=${siteId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-6">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold text-gray-900">
            Monitoring Real-time
          </h1>
          <p className="text-gray-600 mt-1">
            Data sensor terkini dari lahan pertanian
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full lg:w-auto">
          <Site
            onSiteChange={(id) => setSiteId(id)}
            className="w-full sm:w-64"
          />

          <button
            onClick={fetchRealtimeData}
            disabled={isRefreshing}
            className="px-4 py-2.5 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <RefreshCw
              className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
            />
            <span>Refresh Data</span>
          </button>
        </div>
      </div>

      {/* Update Info */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Clock className="w-4 h-4" />
          <span>Update Terakhir: </span>
          <span className="font-semibold">
            {data?.last_updated || "Sedang memuat..."}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-green-500" />
          <span className="text-sm text-gray-600">
            {data?.soil_temp.length || 0} Sensor Aktif
          </span>
        </div>
      </div>

      {/* Map & Warnings Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Map Section */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden h-full">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                Peta Lokasi Lahan
              </h2>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                Live View
              </span>
            </div>
            <div className="h-[400px] relative">
              <Map />
            </div>
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Zap className="w-4 h-4 text-green-500" />
                <span>
                  Sistem monitoring aktif dengan {data?.soil_temp.length || 0}{" "}
                  titik sensor
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Warnings Section */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              Peringatan Sistem
            </h2>
            <div
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                warnings.length > 0
                  ? "bg-amber-100 text-amber-700"
                  : "bg-green-100 text-green-700"
              }`}
            >
              {warnings.length} Peringatan
            </div>
          </div>

          <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2">
            {warnings.length > 0 ? (
              warnings.map((msg, idx) => (
                <div
                  key={idx}
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
                      <div className="flex items-center gap-2 mb-2">
                        <Thermometer className="w-3 h-3 text-gray-500" />
                        <span className="text-sm text-gray-600">
                          {msg.sensor_name}
                        </span>
                      </div>
                      <div
                        className={`px-3 py-1.5 rounded-full text-sm font-medium inline-block ${
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
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  Semua Sistem Normal
                </h3>
                <p className="text-gray-500 text-sm">
                  Tidak ada peringatan atau gangguan pada sistem sensor
                </p>
              </div>
            )}
          </div>

          {warnings.length > 0 && (
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span>Segera lakukan tindakan sesuai rekomendasi sistem</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sensor Realtime Section */}
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Data Sensor Real-time
            </h2>
            <p className="text-gray-600 text-sm mt-1">
              Data terkini dari semua sensor yang terpasang di lahan
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Normal</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Warning</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Danger</span>
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
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Activity className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Data Sensor Belum Tersedia
            </h3>
            <p className="text-gray-500 mb-4">
              Pilih lokasi lahan atau pastikan sensor terhubung dengan sistem
            </p>
            <button
              onClick={fetchRealtimeData}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all"
            >
              Coba Muat Ulang
            </button>
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Droplets className="w-4 h-4 text-blue-500" />
            <span>Data diperbarui setiap 5 menit secara otomatis</span>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-xl border border-blue-100">
          <div className="flex items-center gap-3 mb-2">
            <Thermometer className="w-5 h-5 text-blue-600" />
            <h4 className="font-semibold text-gray-900">Sensor Suhu Tanah</h4>
          </div>
          <p className="text-sm text-gray-600">
            Monitoring suhu tanah untuk optimasi pertumbuhan tanaman
          </p>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-100">
          <div className="flex items-center gap-3 mb-2">
            <Droplets className="w-5 h-5 text-green-600" />
            <h4 className="font-semibold text-gray-900">Sensor Kelembapan</h4>
          </div>
          <p className="text-sm text-gray-600">
            Pantau kelembapan tanah untuk pengaturan irigasi yang optimal
          </p>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-4 rounded-xl border border-purple-100">
          <div className="flex items-center gap-3 mb-2">
            <Activity className="w-5 h-5 text-purple-600" />
            <h4 className="font-semibold text-gray-900">Sensor Nutrisi</h4>
          </div>
          <p className="text-sm text-gray-600">
            Analisis kandungan NPK dan pH tanah untuk pemupukan presisi
          </p>
        </div>
      </div>
    </div>
  );
}
