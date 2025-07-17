"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import EditSite from '../Components/editData';
import Site from "../Components/dropdownSite";
import Edit from '../assets/Edit.svg';

interface SiteData {
  site_id: string;
  site_name: string;
  site_address: string;
  site_lon: number;
  site_lat: number;
  site_elevasi: number;
  site_sts: number;
}

export default function TanamanPage() {
  const [SiteData, setSiteData] = useState<SiteData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    // 🔒 Redirect jika belum login
    if (!token || !user) {
      router.push("/login");
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_URL}/api/site`, {
        method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch data: ${response.statusText}`);
        }

        const result = await response.json();
        setSiteData(result.data|| []);
      } catch (error) {
        console.error("Error fetching plant data:", error);
        setError((error as Error).message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [router]);

  return (
  <div className="p-6">
    <div className="w-full overflow-x-auto">
      <table className="min-w-[800px] w-full text-sm md:text-base text-left text-gray-500">
        <thead className="text-black uppercase bg-abu2 border-2 border-abu3">
          <tr>
            <th className="px-4 py-2 border border-abu3 whitespace-nowrap">ID Lahan</th>
            <th className="px-4 py-2 border border-abu3 whitespace-nowrap">Nama Lahan</th>
            <th className="px-4 py-2 border border-abu3 whitespace-nowrap">Lokasi</th>
            <th className="px-4 py-2 border border-abu3 whitespace-nowrap">Latitude</th>
            <th className="px-4 py-2 border border-abu3 whitespace-nowrap">Longitude</th>
            <th className="px-4 py-2 border border-abu3 whitespace-nowrap">Elevasi</th>
            <th className="px-4 py-2 border border-abu3 whitespace-nowrap">Status</th>
            <th className="px-4 py-2 border border-abu3 whitespace-nowrap">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan={8} className="px-4 py-4 text-center">Loading...</td>
            </tr>
          ) : error ? (
            <tr>
              <td colSpan={8} className="px-4 py-4 text-center text-red-500">{error}</td>
            </tr>
          ) : SiteData.length > 0 ? (
            SiteData.map((site, index) => (
              <tr key={index} className="bg-white border-2 border-abu3 text-black">
                <td className="px-4 py-3 border border-abu3 whitespace-nowrap">{site.site_id}</td>
                <td className="px-4 py-3 border border-abu3 whitespace-nowrap">{site.site_name}</td>
                <td className="px-4 py-3 border border-abu3 whitespace-nowrap">{site.site_address}</td>
                <td className="px-4 py-3 border border-abu3 whitespace-nowrap">{site.site_lat}</td>
                <td className="px-4 py-3 border border-abu3 whitespace-nowrap">{site.site_lon}</td>
                <td className="px-4 py-3 border border-abu3 whitespace-nowrap">{site.site_elevasi}</td>
                <td className="px-4 py-3 border border-abu3 whitespace-nowrap">{site.site_sts === 1 ? "Aktif" : "Tidak Aktif"}</td>
                <td className="px-4 py-3 border border-abu3 w-2 whitespace-nowrap">
                  <EditSite route={`/lahan/edit-lahan/${site.site_id}`} />
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={8} className="px-4 py-4 text-center">No Data Available</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);
}
