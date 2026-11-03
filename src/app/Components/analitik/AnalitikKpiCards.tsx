"use client";

import React from "react";
import { Sprout, Droplets, Zap, ShieldCheck, Thermometer } from "lucide-react";

interface AnalitikKpiCardsProps {
  fertilityScore?: number;
  avgPh?: number;
  avgHum?: number;
  avgTemp?: number;
  totalPlots?: number;
}

export default function AnalitikKpiCards({
  fertilityScore = 94,
  avgPh = 6.4,
  avgHum = 76,
  avgTemp = 27.8,
  totalPlots = 12,
}: AnalitikKpiCardsProps) {
  // Agronomic interpretation for farmers
  const getPhStatus = (ph: number) => {
    if (ph < 5.5) return { label: "Sangat Masam", note: "Perlu kapur dolomit", color: "text-rose-600 bg-rose-50 border-rose-200" };
    if (ph < 6.0) return { label: "Agak Masam", note: "Dolomit dosis ringan", color: "text-amber-600 bg-amber-50 border-amber-200" };
    if (ph <= 7.2) return { label: "Netral / Ideal", note: "Akar mudah serap pupuk", color: "text-emerald-700 bg-emerald-50 border-emerald-200" };
    return { label: "Basa / Alkali", note: "Bahan organik perlu ditambah", color: "text-amber-600 bg-amber-50 border-amber-200" };
  };

  const getHumStatus = (hum: number) => {
    if (hum < 50) return { label: "Tanah Kering", note: "Segera lakukan pengairan", color: "text-rose-600 bg-rose-50 border-rose-200" };
    if (hum <= 80) return { label: "Macak-macak (Ideal)", note: "Ketinggian air optimal", color: "text-emerald-700 bg-emerald-50 border-emerald-200" };
    return { label: "Tergenang Penuh", note: "Atur drainase keluar", color: "text-sky-600 bg-sky-50 border-sky-200" };
  };

  const phStatus = getPhStatus(avgPh);
  const humStatus = getHumStatus(avgHum);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Skor Kesuburan Tanah */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs flex items-center justify-between transition-all hover:shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200/70 flex items-center justify-center text-emerald-600 shadow-2xs shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Skor Kesuburan Tanah
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-2xl font-black text-slate-900 tracking-tight">
                {fertilityScore}%
              </span>
              <span className="text-[11px] font-bold text-emerald-600">Sangat Subur</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5 leading-tight">
              Kondisi tanah siap untuk anakan padi
            </p>
          </div>
        </div>
      </div>

      {/* 2. Rata-rata pH Tanah */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs flex items-center justify-between transition-all hover:shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200/70 flex items-center justify-center text-emerald-600 shadow-2xs shrink-0">
            <Sprout className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Keasaman Tanah (pH)
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-2xl font-black text-slate-900 tracking-tight">
                {avgPh.toFixed(1)}
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${phStatus.color}`}>
                {phStatus.label}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5 leading-tight">
              {phStatus.note}
            </p>
          </div>
        </div>
      </div>

      {/* 3. Kelembapan Tanah */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs flex items-center justify-between transition-all hover:shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-sky-50 border border-sky-200/70 flex items-center justify-center text-sky-600 shadow-2xs shrink-0">
            <Droplets className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Kelembapan Tanah
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-2xl font-black text-slate-900 tracking-tight">
                {avgHum.toFixed(0)}%
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${humStatus.color}`}>
                {humStatus.label}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5 leading-tight">
              {humStatus.note}
            </p>
          </div>
        </div>
      </div>

      {/* 4. Suhu Lahan */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs flex items-center justify-between transition-all hover:shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200/70 flex items-center justify-center text-amber-600 shadow-2xs shrink-0">
            <Thermometer className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Suhu Perakaran Tanah
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-2xl font-black text-slate-900 tracking-tight">
                {avgTemp.toFixed(1)}°C
              </span>
              <span className="text-[11px] font-bold text-emerald-600">Suhu Hangat Pas</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5 leading-tight">
              Mikroba penyubur tanah aktif
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

