"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import IndikatorSuhu from "../Components/indikator/indikatorSuhuEnv";
import IndikatorKelembapan from "../Components/indikator/indikatorKelembapanEnv";
import IndikatorAngin from "../Components/indikator/indikatorKecAngin";
import IndikatorCahaya from "../Components/indikator/indikatorCahaya";
import IndikatorHujan from "../Components/indikator/indikatorHujan";
import Map from "../Components/map";
import FloatingGallery from "../Components/GalleryModal";
import Site from "../Components/dropdownSite";
import Realtime from "../Components/indikator/realtimeDashboard";

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
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const IMAGE_BASE = "/assets/img";
  useEffect(() => {
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

    const fetchAll = async () => {
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
    };

    fetchAll();
  }, [siteId]);

  const mapImageUrl = useMemo(() => {
    const filename = data.devices?.[0]?.dev_img;
    if (!filename) return null;
    return `${IMAGE_BASE}/${filename}`; // contoh: /assets/img/Lahan-cianjur.jpg
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
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
        <Site
          onSiteChange={(id) => setSiteId(id)}
          className="w-full sm:w-auto"
        />
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">
            Update Terakhir: {data.last_updated || "Tidak tersedia"}
          </span>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Map & Plant Info Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden h-[300px] lg:h-[400px] relative">
          <Map
            image={mapImageUrl ?? undefined}
            alt={
              data.devices?.[0]?.dev_id
                ? `Lahan ${data.devices[0].dev_id}`
                : "Peta Lahan"
            }
          />
          <FloatingGallery />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-xl shadow-lg">
            <h5 className="text-md font-semibold text-gray-700 mb-3">
              Komoditas
            </h5>
            <span className="text-2xl font-bold text-gray-900">
              {data.plants?.length ? data.plants[0].commodity : "Unknown Plant"}
            </span>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-lg">
            <h5 className="text-md font-semibold text-gray-700 mb-3">
              Varietas
            </h5>
            <span className="text-2xl font-bold text-gray-900">
              {data.plants?.length ? data.plants[0].variety : "Unknown Plant"}
            </span>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-lg">
            <h5 className="text-md font-semibold text-gray-700 mb-3">
              Umur Tanam
            </h5>
            <span className="text-2xl font-bold text-gray-900">
              {data.plants?.length ? `${data.plants[0].age} HST` : "N/A"}
            </span>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-lg">
            <h5 className="text-md font-semibold text-gray-700 mb-3">
              Tanggal Tanam
            </h5>
            <span className="text-2xl font-bold text-gray-900">
              {data.plants?.length ? data.plants[0].pl_date_planting : "N/A"}
            </span>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-lg">
            <h5 className="text-md font-semibold text-gray-700 mb-3">Fase</h5>
            <span className="text-2xl font-bold text-gray-900">
              {data.plants?.length ? data.plants[0].phase : "N/A"}
            </span>
          </div>
          <div className="bg-green-600 p-4 rounded-xl shadow-lg">
            <h5 className="text-md font-semibold text-white mb-3">
              Waktu Menuju Panen
            </h5>
            <span className="text-2xl font-bold text-white">
              {data.plants?.length
                ? `${data.plants[0].timeto_harvest} Hari`
                : "N/A"}
            </span>
          </div>
        </div>
      </div>

      {/* Indicators & Tasks Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Indikator Lingkungan
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <IndikatorSuhu suhu={data.temperature?.[0]?.read_value || 0} />
            <IndikatorKelembapan humid={data.humidity?.[0]?.read_value || 0} />
            <IndikatorAngin wind={data.wind?.[0]?.read_value || 0} />
            <IndikatorCahaya lux={data.lux?.[0]?.read_value || 0} />
            <IndikatorHujan rain={data.rain?.[0]?.read_value || 0} />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-4">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Tugas & Peringatan
          </h3>
          <div className="space-y-4">
            {/* Tasks */}
            <div>
              <h4 className="text-xl font-semibold text-gray-700 mb-2">
                Tugas
              </h4>
              {data.todos && data.todos.length > 0 ? (
                data.todos.map((todoGroup, groupIndex) =>
                  todoGroup.todos.map((todo, index) => (
                    <div
                      key={`${groupIndex}-${index}`}
                      className="p-3 bg-gray-100 rounded-lg mb-2 shadow"
                    >
                      <h5 className="text-lg font-medium text-gray-900">
                        {todo.hand_title}
                      </h5>
                      <p className="text-sm text-gray-600">
                        Waktu:{" "}
                        <span className="font-semibold">{todo.todo_date}</span>
                      </p>
                      <p className="text-sm text-gray-600">
                        Pupuk:{" "}
                        <span className="font-semibold">
                          {todo.fertilizer_type}
                        </span>
                      </p>
                    </div>
                  ))
                )
              ) : (
                <p className="text-gray-500">Tidak ada tugas saat ini.</p>
              )}
            </div>
            {/* Warnings */}
            <div className="mt-4">
              <h4 className="text-xl font-semibold text-gray-700 mb-2">
                Peringatan
              </h4>
              <div className="space-y-2 max-h-[280px] overflow-y-auto">
                {actionMessages.length > 0 ? (
                  actionMessages.map((msg, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg ${
                        msg.value_status === "Danger"
                          ? "bg-red-600"
                          : "bg-yellow-500"
                      } text-white`}
                    >
                      <h5 className="text-lg font-medium">
                        {msg.status_message}
                      </h5>
                      <p className="text-sm">Indikator: {msg.sensor_name}</p>
                      <p className="text-sm font-semibold mt-1">
                        Aksi: {msg.action_message}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">
                    Semua sensor dalam kondisi baik.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Realtime Section */}
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Realtime</h3>
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
          <p className="text-gray-500">Data sensor tidak tersedia.</p>
        )}
      </div>
    </div>
  );
}
