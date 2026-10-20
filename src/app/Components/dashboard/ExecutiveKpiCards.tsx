"use client";

import React, { useMemo } from "react";
import {
  Sparkles,
  Droplets,
  ShieldAlert,
  Radio,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Info,
} from "lucide-react";

interface ExecutiveKpiCardsProps {
  ph?: number;
  nitrogen?: number;
  fosfor?: number;
  kalium?: number;
  humidity?: number;
  temperature?: number;
  rain?: number;
  activeNodes?: number;
  totalNodes?: number;
}

export default function ExecutiveKpiCards({
  ph = 6.4,
  nitrogen = 45,
  fosfor = 38,
  kalium = 52,
  humidity = 76,
  temperature = 28.5,
  rain = 0,
  activeNodes = 4,
  totalNodes = 4,
}: ExecutiveKpiCardsProps) {
  // 1. Soil Health / Fertility Calculation
  const soilHealth = useMemo(() => {
    let score = 70;
    // pH factor (6.0 - 7.0 ideal)
    if (ph >= 6.0 && ph <= 7.0) score += 15;
    else if (ph >= 5.5 && ph <= 7.5) score += 5;
    else score -= 10;

    // NPK balance
    if (nitrogen >= 30 && nitrogen <= 60) score += 5;
    if (fosfor >= 25 && fosfor <= 50) score += 5;
    if (kalium >= 30 && kalium <= 60) score += 5;

    score = Math.min(Math.max(score, 45), 98);

    let label = "Sangat Subur";
    let color = "text-sage-700 bg-sage-50 border-sage-200";
    if (score < 65) {
      label = "Perlu Perbaikan";
      color = "text-clay-700 bg-clay-50 border-clay-200";
    } else if (score < 80) {
      label = "Cukup Subur";
      color = "text-wheat-800 bg-wheat-50 border-wheat-200";
    }

    return { score, label, color };
  }, [ph, nitrogen, fosfor, kalium]);

  // 2. Hydration Status
  const hydration = useMemo(() => {
    if (rain > 10) {
      return {
        status: "Lahan Tergenang",
        desc: "Curah hujan tinggi terdeteksi",
        badge: "Cek Saluran Pembuangan",
        badgeColor: "bg-wheat-100 text-wheat-900 border-wheat-200",
      };
    }
    if (humidity >= 70 && humidity <= 85) {
      return {
        status: "Optimal (Macak-macak)",
        desc: "Ketinggian air sawah ideal",
        badge: "Kondisi Stabil",
        badgeColor: "bg-sage-100 text-forest-800 border-sage-200",
      };
    }
    if (humidity < 60) {
      return {
        status: "Perlu Pengairan",
        desc: "Kelembapan tanah rendah",
        badge: "Rekomendasi Pompa",
        badgeColor: "bg-clay-100 text-clay-800 border-clay-200",
      };
    }
    return {
      status: "Kelembapan Cukup",
      desc: "Ketersediaan air normal",
      badge: "Normal",
      badgeColor: "bg-sage-100 text-forest-800 border-sage-200",
    };
  }, [humidity, rain]);

  // 3. Pest & Disease Risk
  const pestRisk = useMemo(() => {
    // High temp + very high humidity creates fungus/blast risk
    if (temperature > 27 && humidity > 75) {
      return {
        level: "Waspada",
        threat: "Potensi Jamur & Blas",
        color: "text-clay-800 bg-clay-50 border-clay-200",
        indicator: "bg-clay-500",
        advice: "Semprot fungisida preventif",
      };
    }
    if (temperature > 31) {
      return {
        level: "Sedang",
        threat: "Stres Panas / Penguapan",
        color: "text-wheat-800 bg-wheat-50 border-wheat-200",
        indicator: "bg-wheat-500",
        advice: "Pertahankan genangan air",
      };
    }
    return {
      level: "Rendah",
      threat: "Kondisi Tanaman Prima",
      color: "text-forest-800 bg-sage-50 border-sage-200",
      indicator: "bg-sage-500",
      advice: "Pertahankan monitoring rutin",
    };
  }, [temperature, humidity]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {/* 1. Skor Kesehatan Lahan */}
      <div className="bg-white border border-bone-300 rounded-xl p-3 sm:p-3.5 shadow-2xs hover:shadow-soft transition-all flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-sage-700">
              Kesuburan Tanah
            </span>
            <div className="w-7 h-7 rounded-lg bg-forest-50 border border-forest-100 flex items-center justify-center text-forest-800">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5 mb-0.5">
            <span className="text-2xl font-black text-forest-900 tracking-tight">
              {soilHealth.score}
            </span>
            <span className="text-[11px] font-semibold text-sage-600">/100</span>
          </div>
          <p className="text-[11px] text-sage-700 truncate">
            pH {ph ? Number(ph).toFixed(1) : "6.5"} • NPK Terkalibrasi
          </p>
        </div>
        <div className="mt-2.5 pt-2 border-t border-bone-200 flex items-center justify-between">
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${soilHealth.color}`}
          >
            {soilHealth.label}
          </span>
          <span className="text-[10px] text-sage-500 font-medium">Digital Twin</span>
        </div>
      </div>

      {/* 2. Status Irigasi & Ketersediaan Air */}
      <div className="bg-white border border-bone-300 rounded-xl p-3 sm:p-3.5 shadow-2xs hover:shadow-soft transition-all flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-sage-700">
              Ketersediaan Air
            </span>
            <div className="w-7 h-7 rounded-lg bg-wheat-50 border border-wheat-200 flex items-center justify-center text-wheat-800">
              <Droplets className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mb-0.5">
            <span className="text-base sm:text-lg font-black text-forest-900 leading-tight block truncate">
              {hydration.status}
            </span>
          </div>
          <p className="text-[11px] text-sage-700 truncate">{hydration.desc}</p>
        </div>
        <div className="mt-2.5 pt-2 border-t border-bone-200 flex items-center justify-between">
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${hydration.badgeColor}`}
          >
            {hydration.badge}
          </span>
          <span className="text-[10px] text-sage-500 font-medium">RH {humidity}%</span>
        </div>
      </div>

      {/* 3. Risiko Hama & Penyakit */}
      <div className="bg-white border border-bone-300 rounded-xl p-3 sm:p-3.5 shadow-2xs hover:shadow-soft transition-all flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-sage-700">
              Risiko Hama & Blas
            </span>
            <div className="w-7 h-7 rounded-lg bg-clay-50 border border-clay-100 flex items-center justify-center text-clay-700">
              <ShieldAlert className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className={`w-2 h-2 rounded-full ${pestRisk.indicator}`} />
            <span className="text-base sm:text-lg font-black text-forest-900 leading-tight truncate">
              {pestRisk.level}
            </span>
          </div>
          <p className="text-[11px] text-sage-700 truncate">{pestRisk.threat}</p>
        </div>
        <div className="mt-2.5 pt-2 border-t border-bone-200 flex items-center justify-between">
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-md border truncate max-w-[170px] ${pestRisk.color}`}
          >
            {pestRisk.advice}
          </span>
        </div>
      </div>

      {/* 4. Telemetri & Status Node IoT */}
      <div className="bg-white border border-bone-300 rounded-xl p-3 sm:p-3.5 shadow-2xs hover:shadow-soft transition-all flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-sage-700">
              Jaringan IoT
            </span>
            <div className="w-7 h-7 rounded-lg bg-forest-900 text-wheat-300 flex items-center justify-center">
              <Radio className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5 mb-0.5">
            <span className="text-2xl font-black text-forest-900 tracking-tight">
              {activeNodes}
            </span>
            <span className="text-[11px] font-semibold text-sage-600">/ {totalNodes} Node Online</span>
          </div>
          <p className="text-[11px] text-sage-700 truncate">
            Solar Power & LoRa Realtime
          </p>
        </div>
        <div className="mt-2.5 pt-2 border-t border-bone-200 flex items-center justify-between">
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-forest-50 border border-forest-200 text-forest-900 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-sage-500 animate-pulse" />
            Sinkron
          </span>
          <span className="text-[10px] text-sage-500 font-medium">99.8% Uptime</span>
        </div>
      </div>
    </div>
  );
}
