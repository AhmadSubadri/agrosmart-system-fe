"use client";

import Header from "../../Components/header";
import Site from "../../Components/dropdownSite";
import EditSensor from "../../Components/editData";
import { useState, useEffect } from "react";

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

export default function Page() {
  const [siteId, setSiteId] = useState<string>("SITE000");
  const [sensorData, setSensorData] = useState<SensorData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // PAGINATION STATE
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 8;

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    if (!siteId) return;

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_URL}/api/sensor?site_id=${siteId}`);

        if (!response.ok) {
          throw new Error("Gagal mengambil data sensor");
        }

        const data: SensorData[] = await response.json();
        setSensorData(data);
        setCurrentPage(1); // reset page saat ganti site
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [siteId]);

  // PAGINATION LOGIC
  const totalPages = Math.ceil(sensorData.length / rowsPerPage);

  const paginatedData = sensorData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  return (
    <section>
      <div className="p-6">
        <Site onSiteChange={(id) => setSiteId(id)} />

        {/* TABLE CARD */}
        <div className="mt-4 bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-600">
              <thead className="bg-gray-100 text-gray-700 uppercase text-sm">
                <tr>
                  <th className="px-4 py-3">ID Sensor</th>
                  <th className="px-4 py-3">Label</th>
                  <th className="px-4 py-3">Nilai Normal</th>
                  <th className="px-4 py-3">Normal Bawah</th>
                  <th className="px-4 py-3">Normal Atas</th>
                  <th className="px-4 py-3">Warning Bawah</th>
                  <th className="px-4 py-3">Warning Atas</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-center">Aksi</th>
                </tr>
              </thead>

              <tbody>
                {isLoading && (
                  <tr>
                    <td colSpan={9} className="px-4 py-6 text-center">
                      Loading...
                    </td>
                  </tr>
                )}

                {error && (
                  <tr>
                    <td
                      colSpan={9}
                      className="px-4 py-6 text-center text-red-500"
                    >
                      {error}
                    </td>
                  </tr>
                )}

                {!isLoading && !error && paginatedData.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-4 py-6 text-center">
                      No Data Available
                    </td>
                  </tr>
                )}

                {paginatedData.map((sensor) => (
                  <tr
                    key={sensor.ds_id}
                    className="border-t hover:bg-gray-50 text-black"
                  >
                    <td className="px-4 py-3">{sensor.ds_id}</td>
                    <td className="px-4 py-3">{sensor.ds_name}</td>
                    <td className="px-4 py-3">{sensor.dc_normal_value}</td>
                    <td className="px-4 py-3">{sensor.ds_min_norm_value}</td>
                    <td className="px-4 py-3">{sensor.ds_max_norm_value}</td>
                    <td className="px-4 py-3">{sensor.ds_min_val_warn}</td>
                    <td className="px-4 py-3">{sensor.ds_max_val_warn}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          sensor.ds_sts === 1
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {sensor.ds_sts === 1 ? "Aktif" : "Tidak Aktif"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
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
            <div className="flex flex-col md:flex-row items-center justify-between px-4 py-3 border-t bg-gray-50">
              <span className="text-sm text-gray-600">
                Halaman <b>{currentPage}</b> dari <b>{totalPages}</b>
              </span>

              <div className="flex gap-2 mt-2 md:mt-0">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border rounded-md text-sm disabled:opacity-40 hover:bg-gray-100"
                >
                  Prev
                </button>

                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`px-3 py-1 rounded-md text-sm ${
                      currentPage === i + 1
                        ? "bg-primary text-white"
                        : "border hover:bg-gray-100"
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
                  className="px-3 py-1 border rounded-md text-sm disabled:opacity-40 hover:bg-gray-100"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
