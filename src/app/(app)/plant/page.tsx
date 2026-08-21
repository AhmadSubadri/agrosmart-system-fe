"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Site from "../../Components/dropdownSite";
import EditPlant from "../../Components/editData";
import { Sprout, RefreshCw, AlertCircle, Calendar } from "lucide-react";

interface PlantData {
  pl_id: string;
  dev_id: string;
  pl_name: string;
  pl_desc: string;
  pl_area: string;
  pl_date_planting: string;
  pl_lat: number;
  pl_lon: number;
}

export default function TanamanPage() {
  const [plantData, setPlantData] = useState<PlantData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // PAGINATION
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 8;

  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    if (!token || !user) {
      router.push("/login");
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_URL}/api/tanaman`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Gagal mengambil data tanaman.");
        }

        const result = await response.json();
        setPlantData(result.data || []);
        setCurrentPage(1);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [router, API_URL]);

  // PAGINATION LOGIC
  const totalPages = Math.ceil(plantData.length / rowsPerPage);
  const paginatedData = plantData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-bone-300/80 rounded-2xl p-4 sm:p-6 shadow-soft flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-forest-900 tracking-tight">
            Data Varietas & Budidaya Tanaman
          </h2>
          <p className="text-sm text-sage-700 mt-0.5">
            Manajemen siklus tanam, varietas bibit, dan zona penanaman
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-sage-100 border border-sage-200 text-xs font-semibold text-forest-800">
          <Sprout className="w-3.5 h-3.5 text-sage-600" />
          <span>{plantData.length} Plot Tanam</span>
        </div>
      </div>

      {/* TABLE CARD */}
      <div className="bg-white border border-bone-300 rounded-2xl shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs sm:text-sm text-left text-forest-800">
            <thead className="bg-forest-900 text-bone-50 uppercase text-[11px] font-bold tracking-wider">
              <tr>
                <th className="px-4 py-3.5">ID Tanaman</th>
                <th className="px-4 py-3.5">ID Device</th>
                <th className="px-4 py-3.5">Varietas</th>
                <th className="px-4 py-3.5">Deskripsi</th>
                <th className="px-4 py-3.5">Area Plot</th>
                <th className="px-4 py-3.5">Tanggal Tanam</th>
                <th className="px-4 py-3.5">Latitude</th>
                <th className="px-4 py-3.5">Longitude</th>
                <th className="px-4 py-3.5 text-center">Aksi</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-bone-200">
              {isLoading && (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-sage-600">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-sage-600" />
                    <span>Memuat data tanaman...</span>
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
                    Tidak ada data plot tanaman yang tersedia.
                  </td>
                </tr>
              )}

              {paginatedData.map((plant) => (
                <tr
                  key={plant.pl_id}
                  className="hover:bg-bone-50/70 transition-colors"
                >
                  <td className="px-4 py-3.5 font-bold text-forest-900">{plant.pl_id}</td>
                  <td className="px-4 py-3.5 text-sage-800">{plant.dev_id}</td>
                  <td className="px-4 py-3.5 font-semibold text-forest-900">{plant.pl_name}</td>
                  <td className="px-4 py-3.5 text-sage-800">{plant.pl_desc || "-"}</td>
                  <td className="px-4 py-3.5 text-sage-800">{plant.pl_area}</td>
                  <td className="px-4 py-3.5 text-sage-800 font-medium">{plant.pl_date_planting}</td>
                  <td className="px-4 py-3.5 text-sage-800">{plant.pl_lat}</td>
                  <td className="px-4 py-3.5 text-sage-800">{plant.pl_lon}</td>
                  <td className="px-4 py-3.5 text-center">
                    <EditPlant
                      route={`/plant/edit-plant/?id=${plant.pl_id}`}
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

