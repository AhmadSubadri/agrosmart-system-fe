"use client";

import React from "react";
import { CheckCircle2, Sprout, BarChart3, Calendar, Wheat } from "lucide-react";

interface KpiData {
  kesiapan_tanah?: {
    percentage: number;
    status: string;
    is_optimal: boolean;
  };
  fase_pertumbuhan?: {
    fase: string;
    hst: number;
    label: string;
  };
  estimasi_hasil_panen?: {
    value: number;
    unit: string;
    variance: string;
    per_petak_kg: number;
  };
  perkiraan_panen?: {
    date: string;
    variance: string;
    days_remaining: number;
  };
}

interface Props {
  data?: KpiData;
}

export default function DigitalTwinKpiCards({ data }: Props) {
  const tanah = data?.kesiapan_tanah ?? {
    percentage: 92,
    status: "Siap Tanam",
    is_optimal: true,
  };

  const fase = data?.fase_pertumbuhan ?? {
    fase: "Vegetatif",
    hst: 22,
    label: "Vegetatif (22 HST)",
  };

  const yieldData = data?.estimasi_hasil_panen ?? {
    value: 6.8,
    unit: "ton/ha",
    variance: "± 0,4 ton",
    per_petak_kg: 850,
  };

  const panen = data?.perkiraan_panen ?? {
    date: "15 Mei 2026",
    variance: "± 5 hari",
    days_remaining: 85,
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {/* 1. Kesiapan Tanah */}
      <div className="bg-white rounded-2xl p-4.5 border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="w-13 h-13 rounded-xl overflow-hidden bg-emerald-50 border border-emerald-200/80 flex items-center justify-center relative flex-shrink-0">
            {/* Visual background representation of healthy green field */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/30 via-emerald-700/40 to-emerald-900/50" />
            <img
              src="/assets/img/sawah.jpg"
              alt="Lahan Tanah"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLElement).style.display = "none";
              }}
            />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-500 block">Kesiapan Tanah</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-2xl font-black text-slate-800 tracking-tight">
                {tanah.percentage}%
              </span>
            </div>
            <span className="text-[11px] font-semibold text-emerald-600 block mt-0.5">
              {tanah.status}
            </span>
          </div>
        </div>
        <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 flex-shrink-0">
          <CheckCircle2 className="w-4 h-4" />
        </div>
      </div>

      {/* 2. Fase Pertumbuhan */}
      <div className="bg-white rounded-2xl p-4.5 border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="w-13 h-13 rounded-xl bg-emerald-50 border border-emerald-200/70 flex items-center justify-center text-emerald-600 flex-shrink-0 shadow-2xs">
            <Sprout className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-500 block">Fase Pertumbuhan</span>
            <div className="text-lg font-bold text-slate-800 tracking-tight mt-0.5">
              {fase.fase}
            </div>
            <span className="text-[11px] font-medium text-slate-500 block">
              ({fase.hst} HST)
            </span>
          </div>
        </div>
        <div className="px-2 py-0.5 rounded-full bg-emerald-50 text-[10px] font-bold text-emerald-700 border border-emerald-200/60">
          Aktif
        </div>
      </div>

      {/* 3. Estimasi Hasil Panen */}
      <div className="bg-white rounded-2xl p-4.5 border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="w-13 h-13 rounded-xl bg-amber-50 border border-amber-200/70 flex items-center justify-center text-amber-600 flex-shrink-0 shadow-2xs">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-500 block">Estimasi Hasil Panen</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-2xl font-black text-slate-800 tracking-tight">
                {yieldData.value}
              </span>
              <span className="text-xs font-semibold text-slate-600">
                {yieldData.unit}
              </span>
            </div>
            <span className="text-[11px] font-medium text-slate-500 block">
              ({yieldData.variance})
            </span>
          </div>
        </div>
        <div className="text-amber-500 opacity-80 flex-shrink-0">
          <Wheat className="w-6 h-6" />
        </div>
      </div>

      {/* 4. Perkiraan Panen */}
      <div className="bg-white rounded-2xl p-4.5 border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="w-13 h-13 rounded-xl bg-teal-50 border border-teal-200/70 flex items-center justify-center text-teal-600 flex-shrink-0 shadow-2xs">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-500 block">Perkiraan Panen</span>
            <div className="text-base font-bold text-slate-800 tracking-tight mt-0.5">
              {panen.date}
            </div>
            <span className="text-[11px] font-medium text-slate-500 block">
              ({panen.variance})
            </span>
          </div>
        </div>
        <div className="px-2 py-0.5 rounded-md bg-teal-50 text-[10px] font-bold text-teal-700 border border-teal-200/60">
          {panen.days_remaining} hari lagi
        </div>
      </div>
    </div>
  );
}

