"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import EditSite from "../../Components/editData";
import { MapPin, RefreshCw, AlertCircle, Layers } from "lucide-react";

interface SiteData {
  site_id: string;
  site_name: string;
  site_address: string;
  site_lon: number;
  site_lat: number;
  site_elevasi: number;
  site_sts: number;
}

export default function LahanPage() {
  const [siteData, setSiteData] = useState<SiteData[]>([]);
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
        const response = await fetch(`${API_URL}/api/site`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Gagal mengambil data master lahan.");
        }

        const result = await response.json();
        setSiteData(result.data || []);
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
  const totalPages = Math.ceil(siteData.length / rowsPerPage);
  const paginatedData = siteData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-bone-300/80 rounded-2xl p-4 sm:p-6 shadow-soft flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-forest-900 tracking-tight">
            Data Master Lahan Pertanian
          </h2>
          <p className="text-sm text-sage-700 mt-0.5">
            Daftar koordinat geolokasi, elevasi, dan status plot lahan aktif
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-sage-100 border border-sage-200 text-xs font-semibold text-forest-800">
          <Layers className="w-3.5 h-3.5 text-sage-600" />
          <span>{siteData.length} Total Lahan</span>
        </div>
      </div>

      {/* TABLE CARD */}
      <div className="bg-white border border-bone-300 rounded-2xl shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs sm:text-sm text-left text-forest-800">
            <thead className="bg-forest-900 text-bone-50 uppercase text-[11px] font-bold tracking-wider">
              <tr>
                <th className="px-4 py-3.5">ID Lahan</th>
                <th className="px-4 py-3.5">Nama Lahan</th>
                <th className="px-4 py-3.5">Alamat Lokasi</th>
                <th className="px-4 py-3.5">Latitude</th>
                <th className="px-4 py-3.5">Longitude</th>
                <th className="px-4 py-3.5">Elevasi</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-center">Aksi</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-bone-200">
              {isLoading && (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-sage-600">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-sage-600" />
                    <span>Memuat data lahan...</span>
                  </td>
                </tr>
              )}

              {error && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-clay-700">
                    <AlertCircle className="w-5 h-5 mx-auto mb-1 text-clay-600" />
                    <span>{error}</span>
                  </td>
                </tr>
              )}

              {!isLoading && !error && paginatedData.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-sage-600 font-medium">
                    Tidak ada data lahan yang tersedia.
                  </td>
                </tr>
              )}

              {paginatedData.map((site) => (
                <tr
                  key={site.site_id}
                  className="hover:bg-bone-50/70 transition-colors"
                >
                  <td className="px-4 py-3.5 font-bold text-forest-900">{site.site_id}</td>
                  <td className="px-4 py-3.5 font-semibold text-forest-900">{site.site_name}</td>
                  <td className="px-4 py-3.5 text-sage-800">{site.site_address}</td>
                  <td className="px-4 py-3.5 text-sage-800">{site.site_lat}</td>
                  <td className="px-4 py-3.5 text-sage-800">{site.site_lon}</td>
                  <td className="px-4 py-3.5 text-sage-800">{site.site_elevasi} m</td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                        site.site_sts === 1
                          ? "bg-sage-100 text-forest-900 border-sage-200"
                          : "bg-clay-100 text-clay-900 border-clay-200"
                      }`}
                    >
                      {site.site_sts === 1 ? "Aktif" : "Tidak Aktif"}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <EditSite
                      route={`/lahan/edit-lahan/?id=${site.site_id}`}
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

