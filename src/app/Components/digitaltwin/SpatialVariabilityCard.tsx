"use client";

import React, { useState } from "react";
import { Layers, ChevronDown, Plus, Minus, Info } from "lucide-react";

interface Props {
  activeMetric?: string;
  metrics?: string[];
}

export default function SpatialVariabilityCard({
  activeMetric: initialMetric,
  metrics: propMetrics,
}: Props) {
  const metrics = propMetrics ?? [
    "Indeks Kesehatan Tanaman",
    "Kelembapan Tanah",
    "Kandungan Nitrogen",
    "Derajat Keasaman (pH)",
  ];

  const [selectedMetric, setSelectedMetric] = useState(
    initialMetric ?? metrics[0]
  );
  const [zoomLevel, setZoomLevel] = useState(1);

  // Palet dinamis sesuai metrik yang dipilih
  const getMetricTheme = () => {
    switch (selectedMetric) {
      case "Kelembapan Tanah":
        return {
          legend: [
            { label: "Basah Optimal (>75%)", color: "bg-blue-600" },
            { label: "Cukup (65-75%)", color: "bg-sky-400" },
            { label: "Mulai Kering (<60%)", color: "bg-amber-500" },
          ],
          // Grid 12 petak (3x4) simulasi kelembapan
          gridColors: [
            "bg-blue-600/90", "bg-blue-600/90", "bg-amber-500/90", "bg-sky-400/90",
            "bg-blue-600/90", "bg-sky-400/90", "bg-amber-500/90", "bg-blue-600/90",
            "bg-sky-400/90", "bg-blue-600/90", "bg-amber-600/95", "bg-sky-400/90",
          ],
          note: "Petak kuning/oranye menandakan tanah mulai kering dan butuh aliran air.",
        };

      case "Kandungan Nitrogen":
        return {
          legend: [
            { label: "Tinggi (Subur)", color: "bg-emerald-700" },
            { label: "Sedang", color: "bg-lime-500" },
            { label: "Kurang Urea", color: "bg-amber-400" },
          ],
          // Grid 12 petak (3x4) simulasi NPK
          gridColors: [
            "bg-emerald-700/90", "bg-emerald-700/90", "bg-amber-400/90", "bg-lime-500/90",
            "bg-emerald-700/90", "bg-lime-500/90", "bg-amber-400/90", "bg-emerald-700/90",
            "bg-lime-500/90", "bg-emerald-700/90", "bg-amber-500/90", "bg-lime-500/90",
          ],
          note: "Petak kuning menandakan daun padi kekurangan pupuk nitrogen (Urea).",
        };

      case "Derajat Keasaman (pH)":
        return {
          legend: [
            { label: "Netral (6.0 - 7.0)", color: "bg-emerald-600" },
            { label: "Agak Masam (5.5 - 6.0)", color: "bg-amber-400" },
            { label: "Masam (< 5.5)", color: "bg-rose-500" },
          ],
          gridColors: [
            "bg-emerald-600/90", "bg-emerald-600/90", "bg-amber-400/90", "bg-emerald-600/90",
            "bg-emerald-600/90", "bg-emerald-600/90", "bg-amber-400/90", "bg-emerald-600/90",
            "bg-emerald-600/90", "bg-emerald-600/90", "bg-rose-500/90", "bg-emerald-600/90",
          ],
          note: "Petak merah menandakan tanah masam yang perlu diberi kapur dolomit.",
        };

      case "Indeks Kesehatan Tanaman":
      default:
        return {
          legend: [
            { label: "Baik (Subur)", color: "bg-emerald-500" },
            { label: "Sedang", color: "bg-amber-400" },
            { label: "Perlu Perhatian", color: "bg-rose-500" },
          ],
          gridColors: [
            "bg-emerald-500/90", "bg-emerald-400/90", "bg-amber-400/90", "bg-emerald-500/90",
            "bg-emerald-500/90", "bg-emerald-400/90", "bg-amber-500/90", "bg-emerald-400/90",
            "bg-emerald-400/90", "bg-emerald-500/90", "bg-rose-500/90", "bg-emerald-400/90",
          ],
          note: "Warna menunjukkan kehijauan dan kerapatan kanopi daun padi.",
        };
    }
  };

  const theme = getMetricTheme();

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden flex flex-col h-full">
      {/* Header with Metric Dropdown */}
      <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-teal-50 border border-teal-200/70 flex items-center justify-center text-teal-600">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-black text-slate-900 text-sm tracking-tight">
              Peta Variabilitas Sawah
            </h3>
            <span className="text-[11px] text-slate-400 block">
              Pilih lapisan data untuk cek sebaran kesuburan
            </span>
          </div>
        </div>

        {/* Metric Selector */}
        <div className="relative">
          <select
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value)}
            className="appearance-none bg-slate-50 border border-slate-200 rounded-xl pl-3 pr-8 py-1.5 text-xs font-bold text-slate-800 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer shadow-2xs"
          >
            {metrics.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Heatmap Field Representation */}
      <div className="relative flex-1 min-h-[175px] bg-slate-900 overflow-hidden flex items-center justify-center select-none group">
        {/* Background Satellite View */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-300 opacity-60"
          style={{
            backgroundImage: `url('/assets/img/sawah.jpg')`,
            transform: `scale(${zoomLevel})`,
          }}
        />

        {/* Heatmap Gradients Overlay */}
        <div
          className="relative z-10 p-1.5 rounded-xl border border-white/60 bg-white/10 backdrop-blur-xs transition-transform duration-300"
          style={{
            transform: `perspective(600px) rotateX(40deg) rotateZ(-20deg) scale(${
              zoomLevel * 0.95
            })`,
            transformStyle: "preserve-3d",
          }}
        >
          {/* Dynamic Heatmap Grid based on selected filter */}
          <div className="w-[260px] h-[130px] rounded-lg overflow-hidden grid grid-cols-4 grid-rows-3 gap-0.5 p-0.5 bg-slate-950/60 shadow-xl border border-white/40">
            {theme.gridColors.map((colorClass, idx) => (
              <div key={idx} className={`${colorClass} rounded-xs transition-colors duration-300`} />
            ))}
          </div>
        </div>

        {/* Zoom Controls */}
        <div className="absolute left-3 bottom-3 z-20 flex flex-col gap-1 bg-white/90 backdrop-blur-md rounded-lg p-0.5 shadow-md border border-slate-200">
          <button
            onClick={() => setZoomLevel((p) => Math.min(p + 0.15, 1.5))}
            className="w-6 h-6 flex items-center justify-center text-slate-700 hover:bg-slate-100 rounded-md"
            title="Perbesar"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoomLevel((p) => Math.max(p - 0.15, 0.85))}
            className="w-6 h-6 flex items-center justify-center text-slate-700 hover:bg-slate-100 rounded-md"
            title="Perkecil"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Dynamic Legend on Right side */}
        <div className="absolute right-3 top-3 bottom-3 z-20 flex flex-col justify-center gap-1.5 bg-white/95 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-slate-200 text-[10px] shadow-sm">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
            Tingkat
          </span>
          {theme.legend.map((item, idx) => (
            <div key={idx} className="flex items-center gap-1.5 font-bold text-slate-800">
              <span className={`w-2.5 h-2.5 rounded-xs ${item.color} inline-block`} />
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Helper text for farmer */}
      <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 flex items-center gap-2 text-[11px] text-slate-600 font-medium">
        <Info className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />
        <span>{theme.note}</span>
      </div>
    </div>
  );
}
