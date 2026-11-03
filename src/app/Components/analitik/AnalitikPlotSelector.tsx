"use client";

import React from "react";
import { Grid, Layers, MapPin, CheckCircle2, AlertTriangle, AlertCircle } from "lucide-react";

export interface PlotInfo {
  id: string; // e.g. "A", "B", ...
  name: string; // "Petak A"
  areaIndex: number; // 0, 1, 2
  status: "Sehat" | "Perlu Perhatian" | "Berisiko";
  healthScore: number;
  nitrogen: number;
  fosfor: number;
  kalium: number;
  ph: number;
  temp: number;
  hum: number;
  ec: number;
  tds: number;
}

interface AnalitikPlotSelectorProps {
  plots: PlotInfo[];
  selectedPlotIndex: number; // -1 for All, 0..11 for specific plot
  onSelectPlot: (index: number) => void;
}

export default function AnalitikPlotSelector({
  plots,
  selectedPlotIndex,
  onSelectPlot,
}: AnalitikPlotSelectorProps) {
  const activePlot = selectedPlotIndex >= 0 ? plots[selectedPlotIndex] : null;

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3.5 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200/70 flex items-center justify-center text-emerald-600">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
              Pilih Zona Petak Sawah (Digital Twin)
            </h3>
            <p className="text-xs text-slate-500">
              Klik petak untuk melihat rincian sensor kimia & fisik spesifik di zona tersebut
            </p>
          </div>
        </div>

        {/* Legend status petak */}
        <div className="flex items-center gap-3 text-xs font-semibold text-slate-600">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-[11px]">Sehat / Normal</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span className="text-[11px]">Perlu Perhatian</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span className="text-[11px]">Berisiko</span>
          </div>
        </div>
      </div>

      {/* Button pills grid for 12 plots + All Plots */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => onSelectPlot(-1)}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-2xs ${
            selectedPlotIndex === -1
              ? "bg-slate-900 text-white shadow-sm ring-2 ring-slate-900/10"
              : "bg-slate-100 hover:bg-slate-200/80 text-slate-700 border border-slate-200/60"
          }`}
        >
          <Grid className="w-3.5 h-3.5" />
          <span>Semua Petak (Rata-rata Lahan)</span>
        </button>

        {plots.map((plot, idx) => {
          const isSelected = selectedPlotIndex === idx;
          const statusDot =
            plot.status === "Berisiko"
              ? "bg-rose-500 ring-2 ring-rose-200"
              : plot.status === "Perlu Perhatian"
              ? "bg-amber-400 ring-2 ring-amber-200"
              : "bg-emerald-500 ring-2 ring-emerald-200";

          return (
            <button
              key={plot.id}
              onClick={() => onSelectPlot(idx)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-2xs ${
                isSelected
                  ? "bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-600/20"
                  : "bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/70"
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${statusDot}`} />
              <span>{plot.name}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                isSelected ? "bg-emerald-700 text-white" : "bg-slate-200/60 text-slate-600"
              }`}>
                {plot.healthScore}%
              </span>
            </button>
          );
        })}
      </div>

      {/* Quick context banner of the active petak */}
      <div className="mt-3.5 pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 text-slate-600">
          <MapPin className="w-3.5 h-3.5 text-emerald-600" />
          <span>
            {activePlot ? (
              <>
                Menampilkan data untuk <strong className="text-slate-900">{activePlot.name}</strong> • Node Sensor Area {activePlot.areaIndex + 1} • Luas ± 850 m²
              </>
            ) : (
              <>
                Menampilkan <strong className="text-slate-900">Agregat Rata-rata 12 Petak</strong> • 3 Stasiun Sensor IoT Aktif
              </>
            )}
          </span>
        </div>

        {activePlot && (
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Status Kesehatan:</span>
            <span className={`font-bold px-2 py-0.5 rounded-full text-[11px] ${
              activePlot.status === "Berisiko"
                ? "bg-rose-50 text-rose-700 border border-rose-200"
                : activePlot.status === "Perlu Perhatian"
                ? "bg-amber-50 text-amber-700 border border-amber-200"
                : "bg-emerald-50 text-emerald-700 border border-emerald-200"
            }`}>
              {activePlot.status} ({activePlot.healthScore}%)
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

