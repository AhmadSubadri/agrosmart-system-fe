"use client";

import React, { useEffect, useState } from "react";
import { MapPin, ChevronDown, Loader2 } from "lucide-react";

interface DropdownSiteProps {
  onSiteChange: (id: string) => void;
  className?: string;
}

export interface SiteOption {
  site_id: string;
  site_name: string;
}

const DropdownSite: React.FC<DropdownSiteProps> = ({ onSiteChange, className = "" }) => {
  const [sites, setSites] = useState<SiteOption[]>([]);
  const [selectedSite, setSelectedSite] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    const fetchSites = async () => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

      // Default fallback options agar dropdown tidak pernah kosong
      const defaultSites: SiteOption[] = [
        { site_id: "SITE002", site_name: "BPP Karangtengah" },
        { site_id: "SITE001", site_name: "BPP Selaawi" },
      ];

      // Check local cache first
      if (typeof window !== "undefined") {
        const cached = sessionStorage.getItem("cached_sites_list");
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            if (Array.isArray(parsed) && parsed.length > 0 && isMounted) {
              setSites(parsed);
              const savedSite = localStorage.getItem("selectedSiteId") || parsed[0].site_id;
              setSelectedSite(savedSite);
              onSiteChange(savedSite);
              setLoading(false);
              return;
            }
          } catch {}
        }
      }

      try {
        const headers: Record<string, string> = { Accept: "application/json" };
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const res = await fetch(`${API_URL}/api/site`, { headers });
        if (res.ok) {
          const result = await res.json();
          if (result && Array.isArray(result.data) && result.data.length > 0 && isMounted) {
            setSites(result.data);
            if (typeof window !== "undefined") {
              sessionStorage.setItem("cached_sites_list", JSON.stringify(result.data));
            }
            const savedSite = (typeof window !== "undefined" ? localStorage.getItem("selectedSiteId") : null) || result.data[0].site_id;
            setSelectedSite(savedSite);
            onSiteChange(savedSite);
            return;
          }
        }
        // Fallback jika API belum memiliki site untuk user
        if (isMounted) {
          setSites(defaultSites);
          setSelectedSite("SITE002");
          onSiteChange("SITE002");
        }
      } catch (err) {
        console.error("Error fetching site list:", err);
        if (isMounted) {
          setSites(defaultSites);
          setSelectedSite("SITE002");
          onSiteChange("SITE002");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchSites();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSite = e.target.value;
    setSelectedSite(newSite);
    if (typeof window !== "undefined") {
      localStorage.setItem("selectedSiteId", newSite);
    }
    onSiteChange(newSite);
  };

  return (
    <div className={`relative flex items-center ${className}`}>
      <div className="relative w-full flex items-center">
        <div className="absolute left-3 pointer-events-none text-emerald-600">
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
          ) : (
            <MapPin className="w-4 h-4" />
          )}
        </div>

        <select
          name="site"
          className="w-full appearance-none pl-9 pr-8 py-2 bg-slate-50 border border-slate-200/90 rounded-xl text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors disabled:opacity-60 cursor-pointer"
          value={selectedSite}
          onChange={handleChange}
          disabled={loading || sites.length === 0}
        >
          {sites.length > 0 ? (
            sites.map((site) => (
              <option key={site.site_id} value={site.site_id}>
                {site.site_name}
              </option>
            ))
          ) : (
            <option value="">
              {loading ? "Memuat lahan..." : "BPP Karangtengah"}
            </option>
          )}
        </select>

        <div className="absolute right-2.5 pointer-events-none text-slate-400">
          <ChevronDown className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  );
};

export default DropdownSite;
