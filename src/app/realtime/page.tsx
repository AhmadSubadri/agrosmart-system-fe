"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "../Components/header";
import Site from "../Components/dropdownSite";
import SensorRealtime from "../Components/sensorRealtime";
import Map from "../Components/map";

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

  // INIT SITE ID
  useEffect(() => {
    const storedSite = localStorage.getItem("selectedSiteId");
    if (storedSite) setSiteId(storedSite);
  }, []);

  // AUTH + FETCH REALTIME
  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    if (!token || !user) {
      router.push("/login");
      return;
    }

    if (!siteId) return;

    const fetchRealtime = async () => {
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
      }
    };

    fetchRealtime();
  }, [siteId, router]);

  return (
    <section>
      <div className="p-6 space-y-6">
        {/* FILTER HEADER */}
        <div className="bg-white rounded-xl shadow border border-gray-200 p-4 flex flex-col md:flex-row justify-between gap-3">
          <Site onSiteChange={(id) => setSiteId(id)} />
          <span className="text-sm text-gray-600">
            Update Terakhir: {data?.last_updated || "-"}
          </span>
        </div>

        {/* MAP + WARNING */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* MAP */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
            <div className="p-3 font-semibold border-b">Peta Lokasi</div>
            <div className="h-[300px] lg:h-[500px]">
              <Map />
            </div>
          </div>

          {/* WARNING */}
          <div className="bg-white rounded-xl shadow border border-gray-200 p-4 overflow-y-auto max-h-[500px]">
            <h3 className="font-semibold text-lg mb-3">Peringatan</h3>

            <div className="space-y-3">
              {warnings.length > 0 ? (
                warnings.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg text-white ${
                      msg.value_status === "Danger"
                        ? "bg-red-600"
                        : "bg-yellow-500"
                    }`}
                  >
                    <h4 className="font-bold text-lg">{msg.status_message}</h4>
                    <p className="text-sm">Sensor: {msg.sensor_name}</p>
                    <p className="mt-2 font-semibold">
                      Aksi: {msg.action_message}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">
                  Semua sensor dalam kondisi normal.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* SENSOR REALTIME */}
        <div className="bg-white rounded-xl shadow border border-gray-200 p-4">
          <h3 className="font-semibold text-lg mb-4">Data Sensor Realtime</h3>

          {data?.soil_temp.length ? (
            <div className="grid gap-4">
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
            <p className="text-gray-500 text-sm">Data sensor belum tersedia.</p>
          )}
        </div>
      </div>
    </section>
  );
}
