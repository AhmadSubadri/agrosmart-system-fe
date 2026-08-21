"use client";

import Site from "../../Components/dropdownSite";
import EditSensor from "../../Components/editData";
import { useState, useEffect } from "react";
import { Cpu, RefreshCw, AlertCircle } from "lucide-react";

interface SensorData {
  ds_id: string;
  ds_name: string;
  dc_normal_value: number;
  ds_min_norm_value: number;
  ds_max_norm_value: number;
  ds_min_val_warn: number;
  ds_max_val_warn: number;
  ds_sts: number;
}

export default function SensorPage() {
  const [siteId, setSiteId] = useState<string>("SITE000");
  const [sensorData, setSensorData] = useState<SensorData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // PAGINATION STATE
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 8;

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  // INIT SITE ID
  useEffect(() => {
    const storedSite = localStorage.getItem("selectedSiteId");
    if (storedSite) setSiteId(storedSite);
  }, []);

  useEffect(() => {
    if (!siteId) return;

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_URL}/api/sensor?site_id=${siteId}`);

        if (!response.ok) {
          throw new Error("Gagal mengambil konfigurasi sensor");
        }

        const data: SensorData[] = await response.json();
        setSensorData(data || []);
        setCurrentPage(1);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [siteId, API_URL]);

  // PAGINATION LOGIC
  const totalPages = Math.ceil(sensorData.length / rowsPerPage);

  const paginatedData = sensorData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="bg-white border border-bone-300/80 rounded-2xl p-4 sm:p-6 shadow-soft flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-forest-900 tracking-tight">
            Konfigurasi & Ambang Batas Sensor
          </h2>
          <p className="text-sm text-sage-700 mt-0.5">
            Pengaturan batas nilai normal dan ambang peringatan (warning threshold)
          </p>
        </div>

        <div className="w-full md:w-auto">
          <Site
            onSiteChange={(id) => setSiteId(id)}
            className="w-full sm:w-60"
          />
        </div>
      </div>

      {/* TABLE CARD */}
      <div className="bg-white border border-bone-300 rounded-2xl shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs sm:text-sm text-left text-forest-800">
            <thead className="bg-forest-900 text-bone-50 uppercase text-[11px] font-bold tracking-wider">
              <tr>
                <th className="px-4 py-3.5">ID Sensor</th>
                <th className="px-4 py-3.5">Label Parameter</th>
                <th className="px-4 py-3.5">Target Normal</th>
                <th className="px-4 py-3.5">Min Normal</th>
                <th className="px-4 py-3.5">Max Normal</th>
                <th className="px-4 py-3.5">Min Warning</th>
                <th className="px-4 py-3.5">Max Warning</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-center">Aksi</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-bone-200">
              {isLoading && (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-sage-600">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-sage-600" />
                    <span>Memuat konfigurasi sensor...</span>
                  </td>
                </tr>
              )}

              {error && (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-clay-700">
                    <AlertCircle className="w-5 h-5 mx-auto mb-1 text-clay-600" />
                    <span>{error}</span>
                  </td>
                </tr>
              )}

              {!isLoading && !error && paginatedData.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-sage-600 font-medium">
                    Tidak ada parameter sensor yang terpasang pada site ini.
                  </td>
                </tr>
              )}

              {paginatedData.map((sensor) => (
                <tr
                  key={sensor.ds_id}
                  className="hover:bg-bone-50/70 transition-colors"
                >
                  <td className="px-4 py-3.5 font-bold text-forest-900">{sensor.ds_id}</td>
                  <td className="px-4 py-3.5 font-semibold text-forest-900">{sensor.ds_name}</td>
                  <td className="px-4 py-3.5 text-sage-800 font-medium">{sensor.dc_normal_value}</td>
                  <td className="px-4 py-3.5 text-sage-800">{sensor.ds_min_norm_value}</td>
                  <td className="px-4 py-3.5 text-sage-800">{sensor.ds_max_norm_value}</td>
                  <td className="px-4 py-3.5 text-clay-700">{sensor.ds_min_val_warn}</td>
                  <td className="px-4 py-3.5 text-clay-700">{sensor.ds_max_val_warn}</td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                        sensor.ds_sts === 1
                          ? "bg-sage-100 text-forest-900 border-sage-200"
                          : "bg-clay-100 text-clay-900 border-clay-200"
                      }`}
                    >
                      {sensor.ds_sts === 1 ? "Aktif" : "Tidak Aktif"}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <EditSensor
                      route={`/sensor/edit-sensor/?id=${sensor.ds_id}`}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between px-5 py-3.5 border-t border-bone-200 bg-bone-50/50 gap-3">
            <span className="text-xs text-sage-700 font-medium">
              Menampilkan halaman <b>{currentPage}</b> dari <b>{totalPages}</b>
            </span>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 bg-white border border-bone-300 rounded-lg text-xs font-semibold text-forest-800 hover:bg-bone-50 disabled:opacity-40 transition-all"
              >
                Sebelumnya
              </button>

              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                    currentPage === i + 1
                      ? "bg-forest-900 text-wheat-300 shadow-2xs"
                      : "bg-white border border-bone-300 text-forest-800 hover:bg-bone-50"
                  }`}
                >
                  {i + 1}
                </button>
              ))}

              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(p + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 bg-white border border-bone-300 rounded-lg text-xs font-semibold text-forest-800 hover:bg-bone-50 disabled:opacity-40 transition-all"
              >
                Selanjutnya
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

