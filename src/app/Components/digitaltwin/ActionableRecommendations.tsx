"use client";

import React from "react";
import {
  Lightbulb,
  CheckCircle2,
  ChevronRight,
  Sprout,
  Droplets,
  Tractor,
} from "lucide-react";

export interface RecommendationItem {
  type: string;
  title: string;
  description: string;
  tag?: string;
  priority?: "high" | "normal" | "low";
  icon?: string;
}

interface Props {
  recommendations?: RecommendationItem[];
}

export default function ActionableRecommendations({
  recommendations: propRecs,
}: Props) {
  const defaultRecs: RecommendationItem[] = [
    {
      type: "pemupukan",
      title: "Pemupukan Susulan",
      description: "Berikan pupuk Urea 50 kg/ha pada usia 25–30 HST.",
      tag: "Nutrisi",
      priority: "high",
      icon: "sprout",
    },
    {
      type: "pengaturan_air",
      title: "Pengaturan Air",
      description: "Pertahankan tinggi air 5–7 cm.",
      tag: "Irigasi",
      priority: "normal",
      icon: "droplets",
    },
    {
      type: "mekanisasi",
      title: "Persiapan Mekanisasi",
      description: "Siapkan alat panen sesuai prediksi.",
      tag: "Mekanisasi",
      priority: "normal",
      icon: "tractor",
    },
  ];

  const recommendations =
    propRecs && propRecs.length > 0 ? propRecs : defaultRecs;

  const renderIcon = (type: string) => {
    switch (type) {
      case "pemupukan":
        return (
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <Sprout className="w-5 h-5" />
          </div>
        );
      case "pengaturan_air":
        return (
          <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-200/80 text-sky-600 flex items-center justify-center flex-shrink-0">
            <Droplets className="w-5 h-5" />
          </div>
        );
      case "mekanisasi":
      default:
        return (
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-700 flex items-center justify-center flex-shrink-0">
            <Tractor className="w-5 h-5" />
          </div>
        );
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-200/70 flex items-center justify-center text-amber-600">
            <Lightbulb className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-slate-800 text-sm tracking-tight">
            Analisis & Rekomendasi
          </h3>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-[11px] font-bold text-emerald-700 border border-emerald-200/60">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Rekomendasi Hari Ini</span>
        </div>
      </div>

      {/* Action Items List */}
      <div className="p-4 flex-1 flex flex-col justify-between gap-2.5">
        {recommendations.map((item, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-slate-300 hover:bg-slate-50/70 transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              {renderIcon(item.type)}
              <div className="min-w-0">
                <span className="font-bold text-slate-900 text-xs block leading-tight group-hover:text-emerald-700 transition-colors">
                  {item.title}
                </span>
                <span className="text-[11px] text-slate-500 line-clamp-2 mt-0.5 leading-snug">
                  {item.description}
                </span>
              </div>
            </div>

            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-800 group-hover:translate-x-0.5 transition-all flex-shrink-0 ml-2" />
          </div>
        ))}
      </div>
    </div>
  );
}

