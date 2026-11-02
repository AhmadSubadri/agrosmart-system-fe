"use client";

import React, { useState } from "react";
import { Layers, ChevronDown, Plus, Minus } from "lucide-react";

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

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden flex flex-col h-full">
      {/* Header with Metric Dropdown */}
      <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-teal-50 border border-teal-200/70 flex items-center justify-center text-teal-600">
            <Layers className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-slate-800 text-sm tracking-tight">
            Peta Spasial & Variabilitas Lahan
          </h3>
        </div>

        {/* Metric Selector */}
        <div className="relative">
          <select
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value)}
            className="appearance-none bg-slate-50 border border-slate-200 rounded-lg pl-2.5 pr-7 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
          >
            {metrics.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
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

        {/* Heatmap Gradients Overlay representing variability across the field */}
        <div
          className="relative z-10 p-1.5 rounded-xl border border-white/60 bg-white/10 backdrop-blur-xs transition-transform duration-300"
          style={{
            transform: `perspective(600px) rotateX(40deg) rotateZ(-20deg) scale(${
              zoomLevel * 0.95
            })`,
            transformStyle: "preserve-3d",
          }}
        >
          {/* NDVI Heatmap Grid */}
          <div className="w-[260px] h-[130px] rounded-lg overflow-hidden grid grid-cols-4 grid-rows-3 gap-0.5 p-0.5 bg-slate-950/60 shadow-xl border border-white/40">
            {/* Row 1 */}
            <div className="bg-emerald-500/90 rounded-xs" />
            <div className="bg-emerald-400/90 rounded-xs" />
            <div className="bg-amber-400/90 rounded-xs" />
            <div className="bg-emerald-500/90 rounded-xs" />
            {/* Row 2 */}
            <div className="bg-emerald-500/90 rounded-xs" />
            <div className="bg-emerald-400/90 rounded-xs" />
            <div className="bg-amber-500/90 rounded-xs" />
            <div className="bg-emerald-400/90 rounded-xs" />
            {/* Row 3 */}
            <div className="bg-emerald-400/90 rounded-xs" />
            <div className="bg-emerald-500/90 rounded-xs" />
            <div className="bg-rose-500/90 rounded-xs" />
            <div className="bg-emerald-400/90 rounded-xs" />
          </div>
        </div>

        {/* Zoom Controls */}
        <div className="absolute left-3 bottom-3 z-20 flex flex-col gap-1 bg-white/90 backdrop-blur-md rounded-lg p-0.5 shadow-md border border-slate-200">
          <button
            onClick={() => setZoomLevel((p) => Math.min(p + 0.15, 1.5))}
            className="w-6 h-6 flex items-center justify-center text-slate-700 hover:bg-slate-100 rounded-md"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoomLevel((p) => Math.max(p - 0.15, 0.85))}
            className="w-6 h-6 flex items-center justify-center text-slate-700 hover:bg-slate-100 rounded-md"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Legend on Right side */}
        <div className="absolute right-3 top-3 bottom-3 z-20 flex flex-col justify-center gap-1.5 bg-white/90 backdrop-blur-md px-2 py-1.5 rounded-lg border border-slate-200 text-[10px] shadow-sm">
          <div className="flex items-center gap-1.5 font-medium text-slate-700">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block" />
            <span>Baik</span>
          </div>
          <div className="flex items-center gap-1.5 font-medium text-slate-700">
            <span className="w-2.5 h-2.5 rounded-sm bg-amber-400 inline-block" />
            <span>Sedang</span>
          </div>
          <div className="flex items-center gap-1.5 font-medium text-slate-700">
            <span className="w-2.5 h-2.5 rounded-sm bg-rose-500 inline-block" />
            <span>Perlu Perhatian</span>
          </div>
        </div>
      </div>
    </div>
  );
}

