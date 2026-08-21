"use client";

import React, { useEffect, useState } from "react";
import { MapPin, ChevronDown, Loader2 } from "lucide-react";

interface DropdownSiteProps {
  onSiteChange: (id: string) => void;
  className?: string;
}

interface SiteOption {
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
      const token = localStorage.getItem("token");
      if (!token) return;

      // Check local cache first for instantaneous rendering
      const cached = sessionStorage.getItem("cached_sites_list");
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0 && isMounted) {
            setSites(parsed);
            const savedSite = localStorage.getItem("selectedSiteId");
            const defaultSite = savedSite || parsed[0].site_id;
            setSelectedSite(defaultSite);
            onSiteChange(defaultSite);
            setLoading(false);
            return;
          }
        } catch {}
      }

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/site`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        const result = await res.json();
        if (Array.isArray(result.data) && result.data.length > 0 && isMounted) {
          setSites(result.data);
          sessionStorage.setItem("cached_sites_list", JSON.stringify(result.data));

          const savedSite = localStorage.getItem("selectedSiteId");
          const defaultSite = savedSite || result.data[0].site_id;

          setSelectedSite(defaultSite);
          onSiteChange(defaultSite);
        }
      } catch (err) {
        console.error("Error fetching site list:", err);
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
    localStorage.setItem("selectedSiteId", newSite);
    onSiteChange(newSite);
  };

  return (
    <div className={`relative flex items-center ${className}`}>
      <div className="relative w-full flex items-center">
        <div className="absolute left-3 pointer-events-none text-sage-600">
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin text-sage-500" />
          ) : (
            <MapPin className="w-4 h-4" />
          )}
        </div>

        <select
          name="site"
          className="w-full appearance-none pl-9 pr-8 py-2.5 bg-white border border-bone-300 rounded-xl text-sm font-semibold text-forest-900 shadow-sm hover:border-sage-400 focus:outline-none focus:ring-2 focus:ring-sage-500/20 focus:border-sage-500 transition-colors disabled:opacity-60 cursor-pointer"
          value={selectedSite}
          onChange={handleChange}
          disabled={loading || sites.length === 0}
        >
          {loading ? (
            <option>Memuat lokasi lahan...</option>
          ) : sites.length === 0 ? (
            <option>Tidak ada lokasi lahan</option>
          ) : (
            sites.map((site) => (
              <option key={site.site_id} value={site.site_id}>
                {site.site_name}
              </option>
            ))
          )}
        </select>

        <div className="absolute right-3 pointer-events-none text-forest-600">
          <ChevronDown className="w-4 h-4 opacity-60" />
        </div>
      </div>
    </div>
  );
};

export default DropdownSite;

