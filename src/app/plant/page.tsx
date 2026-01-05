"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "../Components/header";
import Site from "../Components/dropdownSite";
import EditPlant from "../Components/editData";

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
          throw new Error("Gagal mengambil data tanaman");
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
  }, [router]);

  // PAGINATION LOGIC
  const totalPages = Math.ceil(plantData.length / rowsPerPage);
  const paginatedData = plantData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  return (
    <section>
      <Header title="Plant" />

      <div className="p-6">
        <Site onSiteChange={() => {}} />

        {/* TABLE CARD */}
        <div className="mt-4 bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-600">
              <thead className="bg-gray-100 text-gray-700 uppercase text-sm">
                <tr>
                  <th className="px-4 py-3">ID Tanaman</th>
                  <th className="px-4 py-3">ID Device</th>
                  <th className="px-4 py-3">Nama</th>
                  <th className="px-4 py-3">Deskripsi</th>
                  <th className="px-4 py-3">Lokasi</th>
                  <th className="px-4 py-3">Tanggal Tanam</th>
                  <th className="px-4 py-3">Latitude</th>
                  <th className="px-4 py-3">Longitude</th>
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

                {paginatedData.map((plant) => (
                  <tr
                    key={plant.pl_id}
                    className="border-t hover:bg-gray-50 text-black"
                  >
                    <td className="px-4 py-3">{plant.pl_id}</td>
                    <td className="px-4 py-3">{plant.dev_id}</td>
                    <td className="px-4 py-3 font-medium">{plant.pl_name}</td>
                    <td className="px-4 py-3">{plant.pl_desc || "-"}</td>
                    <td className="px-4 py-3">{plant.pl_area}</td>
                    <td className="px-4 py-3">{plant.pl_date_planting}</td>
                    <td className="px-4 py-3">{plant.pl_lat}</td>
                    <td className="px-4 py-3">{plant.pl_lon}</td>
                    <td className="px-4 py-3 text-center">
                      <EditPlant route={`/plant/edit-plant/${plant.pl_id}`} />
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
