"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "../Components/header";
import EditSite from "../Components/editData";

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
          throw new Error("Gagal mengambil data lahan");
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
  }, [router]);

  // PAGINATION LOGIC
  const totalPages = Math.ceil(siteData.length / rowsPerPage);
  const paginatedData = siteData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  return (
    <section>
      <div className="p-6">
        {/* TABLE CARD */}
        <div className="mt-4 bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-600">
              <thead className="bg-gray-100 text-gray-700 uppercase text-sm">
                <tr>
                  <th className="px-4 py-3">ID Lahan</th>
                  <th className="px-4 py-3">Nama Lahan</th>
                  <th className="px-4 py-3">Lokasi</th>
                  <th className="px-4 py-3">Latitude</th>
                  <th className="px-4 py-3">Longitude</th>
                  <th className="px-4 py-3">Elevasi</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-center">Aksi</th>
                </tr>
              </thead>

              <tbody>
                {isLoading && (
                  <tr>
                    <td colSpan={8} className="px-4 py-6 text-center">
                      Loading...
                    </td>
                  </tr>
                )}

                {error && (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-4 py-6 text-center text-red-500"
                    >
                      {error}
                    </td>
                  </tr>
                )}

                {!isLoading && !error && paginatedData.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-6 text-center">
                      No Data Available
                    </td>
                  </tr>
                )}

                {paginatedData.map((site) => (
                  <tr
                    key={site.site_id}
                    className="border-t hover:bg-gray-50 text-black"
                  >
                    <td className="px-4 py-3">{site.site_id}</td>
                    <td className="px-4 py-3 font-medium">{site.site_name}</td>
                    <td className="px-4 py-3">{site.site_address}</td>
                    <td className="px-4 py-3">{site.site_lat}</td>
                    <td className="px-4 py-3">{site.site_lon}</td>
                    <td className="px-4 py-3">{site.site_elevasi} m</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          site.site_sts === 1
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {site.site_sts === 1 ? "Aktif" : "Tidak Aktif"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <EditSite route={`/lahan/edit-lahan/${site.site_id}`} />
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
