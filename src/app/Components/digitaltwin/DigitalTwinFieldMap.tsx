"use client";

import React, { useState } from "react";
import {
  MapPin,
  Plus,
  Minus,
  Crosshair,
  Sprout,
  AlertTriangle,
  CheckCircle2,
  Droplets,
  HelpCircle,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";

export interface PlotData {
  id: string;
  code: string;
  grid_row: number;
  grid_col: number;
  fase: string;
  status: "Sehat" | "Perlu Perhatian" | "Berisiko";
  health_index: number;
  moisture: number;
  ph: number;
  chlorophyll_index: number;
  coordinates: {
    lat: number;
    lng: number;
  };
}

interface Props {
  plots?: PlotData[];
  onSelectPlot?: (plot: PlotData) => void;
}

export default function DigitalTwinFieldMap({ plots: propPlots, onSelectPlot }: Props) {
  const defaultPlots: PlotData[] = [
    { id: "petak-a", code: "Petak A", grid_row: 0, grid_col: 0, fase: "Vegetatif (22 HST)", status: "Sehat", health_index: 0.94, moisture: 82, ph: 6.5, chlorophyll_index: 42.1, coordinates: { lat: -6.8061, lng: 107.1588 } },
    { id: "petak-b", code: "Petak B", grid_row: 0, grid_col: 1, fase: "Vegetatif (22 HST)", status: "Sehat", health_index: 0.92, moisture: 80, ph: 6.4, chlorophyll_index: 41.5, coordinates: { lat: -6.8061, lng: 107.1591 } },
    { id: "petak-c", code: "Petak C", grid_row: 0, grid_col: 2, fase: "Vegetatif (22 HST)", status: "Perlu Perhatian", health_index: 0.72, moisture: 64, ph: 5.8, chlorophyll_index: 34.0, coordinates: { lat: -6.8061, lng: 107.1594 } },
    { id: "petak-d", code: "Petak D", grid_row: 0, grid_col: 3, fase: "Vegetatif (22 HST)", status: "Sehat", health_index: 0.91, moisture: 79, ph: 6.6, chlorophyll_index: 40.8, coordinates: { lat: -6.8061, lng: 107.1597 } },
    { id: "petak-e", code: "Petak E", grid_row: 1, grid_col: 0, fase: "Vegetatif (22 HST)", status: "Sehat", health_index: 0.95, moisture: 84, ph: 6.7, chlorophyll_index: 43.0, coordinates: { lat: -6.8064, lng: 107.1588 } },
    { id: "petak-f", code: "Petak F", grid_row: 1, grid_col: 1, fase: "Vegetatif (22 HST)", status: "Sehat", health_index: 0.93, moisture: 81, ph: 6.5, chlorophyll_index: 42.0, coordinates: { lat: -6.8064, lng: 107.1591 } },
    { id: "petak-g", code: "Petak G", grid_row: 1, grid_col: 2, fase: "Vegetatif (22 HST)", status: "Perlu Perhatian", health_index: 0.75, moisture: 68, ph: 5.9, chlorophyll_index: 35.2, coordinates: { lat: -6.8064, lng: 107.1594 } },
    { id: "petak-h", code: "Petak H", grid_row: 1, grid_col: 3, fase: "Vegetatif (22 HST)", status: "Sehat", health_index: 0.89, moisture: 78, ph: 6.4, chlorophyll_index: 39.5, coordinates: { lat: -6.8064, lng: 107.1597 } },
    { id: "petak-i", code: "Petak I", grid_row: 2, grid_col: 0, fase: "Vegetatif (22 HST)", status: "Sehat", health_index: 0.90, moisture: 79, ph: 6.5, chlorophyll_index: 40.2, coordinates: { lat: -6.8067, lng: 107.1588 } },
    { id: "petak-j", code: "Petak J", grid_row: 2, grid_col: 1, fase: "Vegetatif (22 HST)", status: "Sehat", health_index: 0.93, moisture: 82, ph: 6.6, chlorophyll_index: 42.5, coordinates: { lat: -6.8067, lng: 107.1591 } },
    { id: "petak-k", code: "Petak K", grid_row: 2, grid_col: 2, fase: "Vegetatif (22 HST)", status: "Berisiko", health_index: 0.58, moisture: 52, ph: 5.2, chlorophyll_index: 26.5, coordinates: { lat: -6.8067, lng: 107.1594 } },
    { id: "petak-l", code: "Petak L", grid_row: 2, grid_col: 3, fase: "Vegetatif (22 HST)", status: "Sehat", health_index: 0.88, moisture: 77, ph: 6.3, chlorophyll_index: 38.9, coordinates: { lat: -6.8067, lng: 107.1597 } },
  ];

  const plots = propPlots && propPlots.length > 0 ? propPlots : defaultPlots;
  const [selectedPlot, setSelectedPlot] = useState<PlotData>(plots[1]); // Default Petak B
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  const handlePlotClick = (plot: PlotData) => {
    setSelectedPlot(plot);
    if (onSelectPlot) onSelectPlot(plot);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Sehat":
        return "bg-emerald-500/85 border-emerald-300 hover:bg-emerald-400/95";
      case "Perlu Perhatian":
        return "bg-amber-400/85 border-amber-200 hover:bg-amber-300/95";
      case "Berisiko":
        return "bg-rose-500/85 border-rose-300 hover:bg-rose-400/95";
      default:
        return "bg-emerald-500/85 border-emerald-300";
    }
  };

  // Panduan tindakan praktis untuk petani
  const getActionAdvice = (plot: PlotData) => {
    if (plot.status === "Berisiko") {
      return {
        badge: "Tindakan Mendesak",
        badgeColor: "bg-rose-100 text-rose-800 border-rose-300",
        kondisi: `Tanah kering (Lembap ${plot.moisture}%) & Masam (pH ${plot.ph})`,
        tindakan: "Segera buka pintu saluran air ke petak ini selama 1-2 jam dan tabur kapur dolomit 15 kg untuk netralkan keasaman.",
        manfaat: "Mencegah padi kerdil dan gagal membentuk anakan.",
      };
    }
    if (plot.status === "Perlu Perhatian") {
      return {
        badge: "Perlu Tindakan",
        badgeColor: "bg-amber-100 text-amber-800 border-amber-300",
        kondisi: `Kadar air mulai berkurang (Lembap ${plot.moisture}%)`,
        tindakan: "Alirkan air secukupnya setinggi 3-5 cm (macak-macak) dan siapkan pemupukan susulan Urea 10 kg khusus petak ini.",
        manfaat: "Petani hemat pupuk karena tidak perlu memupuk petak lain yang sudah subur.",
      };
    }
    return {
      badge: "Kondisi Sangat Bagus",
      badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-300",
      kondisi: `Kondisi air (${plot.moisture}%) & tanah (pH ${plot.ph}) sangat optimal`,
      tindakan: "Pertahankan ketinggian air macak-macak. Tidak perlu tambahan pupuk atau perlakuan khusus hari ini.",
      manfaat: "Petani tidak membuang biaya pupuk dan tenaga secara sia-sia.",
    };
  };

  const advice = getActionAdvice(selectedPlot);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden flex flex-col h-full">
      {/* Header Bar */}
      <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200/70 flex items-center justify-center text-emerald-600">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-black text-slate-900 text-sm tracking-tight flex items-center gap-1.5">
              Digital Twin Lahan Sawah
            </h3>
            <span className="text-[11px] text-slate-400 block">
              Pantau kondisi setiap petak tanpa harus turun ke lumpur
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs font-semibold text-slate-600">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
            <span>Sehat (8)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
            <span>Perlu Air/Pupuk (3)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
            <span>Kritis (1)</span>
          </div>
        </div>
      </div>

      {/* Main Map Canvas Area */}
      <div className="relative min-h-[300px] sm:min-h-[350px] bg-slate-900 overflow-hidden flex items-center justify-center select-none group">
        {/* Background Texture */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-300"
          style={{
            backgroundImage: `url('/assets/img/sawah.jpg')`,
            transform: `scale(${zoomLevel})`,
          }}
        >
          <div className="absolute inset-0 bg-slate-950/40" />
        </div>

        {/* 3D Perspective Isometric Plots Container */}
        <div
          className="relative z-10 transition-transform duration-300"
          style={{
            transform: `perspective(900px) rotateX(46deg) rotateZ(-22deg) scale(${zoomLevel * 0.95})`,
            transformStyle: "preserve-3d",
          }}
        >
          {/* Outer Boundary glow */}
          <div className="p-2.5 rounded-2xl bg-white/20 backdrop-blur-xs border-2 border-white/80 shadow-2xl">
            {/* Grid of 12 Sub-plots */}
            <div className="grid grid-cols-4 gap-2 w-[340px] sm:w-[440px] md:w-[500px]">
              {plots.map((plot) => {
                const isSelected = selectedPlot?.id === plot.id;
                return (
                  <button
                    key={plot.id}
                    onClick={() => handlePlotClick(plot)}
                    className={`
                      relative aspect-[1.35] rounded-lg border transition-all duration-200 cursor-pointer flex flex-col justify-between p-2 text-left
                      ${getStatusColor(plot.status)}
                      ${
                        isSelected
                          ? "ring-4 ring-white ring-offset-2 ring-offset-emerald-900 shadow-2xl scale-[1.04] z-20"
                          : "opacity-90 hover:opacity-100 hover:scale-[1.01]"
                      }
                    `}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-[11px] font-black tracking-wider text-white drop-shadow-sm uppercase">
                        {plot.code}
                      </span>
                      <span
                        className={`w-2 h-2 rounded-full ${
                          plot.status === "Berisiko"
                            ? "bg-rose-300"
                            : plot.status === "Perlu Perhatian"
                            ? "bg-amber-200"
                            : "bg-emerald-200"
                        } border border-white`}
                      />
                    </div>

                    <div className="text-[9px] font-bold text-white/95 drop-shadow-xs">
                      {plot.status === "Sehat"
                        ? "Subur"
                        : plot.status === "Berisiko"
                        ? "Kritis"
                        : "Perlu Cek"}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Floating Marker Tooltip on Selected Plot */}
          {selectedPlot && (
            <div
              className="absolute z-30 pointer-events-none transition-all duration-300"
              style={{
                top: `${((selectedPlot.grid_row + 0.5) / 3) * 100}%`,
                left: `${((selectedPlot.grid_col + 0.5) / 4) * 100}%`,
                transform: "translate(-50%, -100%)",
              }}
            >
              <div
                className="bg-white/95 backdrop-blur-md rounded-xl p-2.5 shadow-2xl border border-slate-200 min-w-[170px] text-slate-800"
                style={{
                  transform: "rotateZ(22deg) rotateX(-46deg) translateY(-25px)",
                  transformStyle: "preserve-3d",
                }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
                    <Sprout className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-xs font-black text-slate-900 leading-tight">
                      {selectedPlot.code}
                    </div>
                    <div className="text-[10px] font-semibold text-slate-500">
                      {selectedPlot.status}
                    </div>
                  </div>
                </div>
              </div>

              {/* Pin Pointer */}
              <div
                className="w-4 h-4 text-emerald-600 drop-shadow-md mx-auto -mt-1"
                style={{
                  transform: "rotateZ(22deg) rotateX(-46deg)",
                }}
              >
                <MapPin className="w-5 h-5 fill-emerald-600 text-white" />
              </div>
            </div>
          )}
        </div>

        {/* Map Controls */}
        <div className="absolute left-4 bottom-4 z-20 flex flex-col gap-1.5 bg-white/95 backdrop-blur-md rounded-xl p-1 shadow-lg border border-slate-200">
          <button
            onClick={() => setZoomLevel((prev) => Math.min(prev + 0.15, 1.6))}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-700 hover:bg-slate-100 transition-colors"
            title="Perbesar Peta"
          >
            <Plus className="w-4 h-4" />
          </button>
          <div className="w-full h-px bg-slate-200" />
          <button
            onClick={() => setZoomLevel((prev) => Math.max(prev - 0.15, 0.8))}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-700 hover:bg-slate-100 transition-colors"
            title="Perkecil Peta"
          >
            <Minus className="w-4 h-4" />
          </button>
          <div className="w-full h-px bg-slate-200" />
          <button
            onClick={() => setZoomLevel(1)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-700 hover:bg-slate-100 transition-colors"
            title="Reset Peta"
          >
            <Crosshair className="w-4 h-4" />
          </button>
        </div>

        {/* Quick hint bottom right */}
        <div className="absolute right-4 bottom-4 z-20 bg-black/60 backdrop-blur-md text-white px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5">
          <span>Sentuh petak sawah untuk instruksi petani</span>
        </div>
      </div>

      {/* FOOTER ACTION PANEL: Apa Yang Harus Dilakukan Petani di Petak Terpilih */}
      <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-white font-black text-sm ${
              selectedPlot.status === "Berisiko"
                ? "bg-rose-500 shadow-sm"
                : selectedPlot.status === "Perlu Perhatian"
                ? "bg-amber-500 shadow-sm"
                : "bg-emerald-600 shadow-sm"
            }`}
          >
            {selectedPlot.code.replace("Petak ", "")}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-black text-slate-900">
                Instruksi Petani untuk {selectedPlot.code}
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${advice.badgeColor}`}
              >
                {advice.badge}
              </span>
            </div>
            <p className="text-xs font-semibold text-slate-700 mt-1 leading-relaxed">
              👉 {advice.tindakan}
            </p>
            <span className="text-[11px] text-emerald-700 font-medium block mt-0.5">
              💡 {advice.manfaat}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
