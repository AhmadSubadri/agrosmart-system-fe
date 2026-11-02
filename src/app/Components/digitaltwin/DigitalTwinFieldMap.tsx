"use client";

import React, { useState } from "react";
import {
  MapPin,
  Plus,
  Minus,
  Crosshair,
  Sprout,
  Activity,
  Layers,
  Info,
  Maximize2,
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
  // Default 12 petak (3 rows x 4 cols) jika data props belum termuat
  const defaultPlots: PlotData[] = [
    { id: "petak-a", code: "Petak A", grid_row: 0, grid_col: 0, fase: "Vegetatif (22 HST)", status: "Sehat", health_index: 0.94, moisture: 82, ph: 6.5, chlorophyll_index: 42.1, coordinates: { lat: -7.747, lng: 110.355 } },
    { id: "petak-b", code: "Petak B", grid_row: 0, grid_col: 1, fase: "Vegetatif (22 HST)", status: "Sehat", health_index: 0.92, moisture: 80, ph: 6.4, chlorophyll_index: 41.5, coordinates: { lat: -7.747, lng: 110.3553 } },
    { id: "petak-c", code: "Petak C", grid_row: 0, grid_col: 2, fase: "Vegetatif (22 HST)", status: "Perlu Perhatian", health_index: 0.72, moisture: 64, ph: 5.8, chlorophyll_index: 34.0, coordinates: { lat: -7.747, lng: 110.3556 } },
    { id: "petak-d", code: "Petak D", grid_row: 0, grid_col: 3, fase: "Vegetatif (22 HST)", status: "Sehat", health_index: 0.91, moisture: 79, ph: 6.6, chlorophyll_index: 40.8, coordinates: { lat: -7.747, lng: 110.3559 } },
    { id: "petak-e", code: "Petak E", grid_row: 1, grid_col: 0, fase: "Vegetatif (22 HST)", status: "Sehat", health_index: 0.95, moisture: 84, ph: 6.7, chlorophyll_index: 43.0, coordinates: { lat: -7.7473, lng: 110.355 } },
    { id: "petak-f", code: "Petak F", grid_row: 1, grid_col: 1, fase: "Vegetatif (22 HST)", status: "Sehat", health_index: 0.93, moisture: 81, ph: 6.5, chlorophyll_index: 42.0, coordinates: { lat: -7.7473, lng: 110.3553 } },
    { id: "petak-g", code: "Petak G", grid_row: 1, grid_col: 2, fase: "Vegetatif (22 HST)", status: "Perlu Perhatian", health_index: 0.75, moisture: 68, ph: 5.9, chlorophyll_index: 35.2, coordinates: { lat: -7.7473, lng: 110.3556 } },
    { id: "petak-h", code: "Petak H", grid_row: 1, grid_col: 3, fase: "Vegetatif (22 HST)", status: "Sehat", health_index: 0.89, moisture: 78, ph: 6.4, chlorophyll_index: 39.5, coordinates: { lat: -7.7473, lng: 110.3559 } },
    { id: "petak-i", code: "Petak I", grid_row: 2, grid_col: 0, fase: "Vegetatif (22 HST)", status: "Sehat", health_index: 0.90, moisture: 79, ph: 6.5, chlorophyll_index: 40.2, coordinates: { lat: -7.7476, lng: 110.355 } },
    { id: "petak-j", code: "Petak J", grid_row: 2, grid_col: 1, fase: "Vegetatif (22 HST)", status: "Sehat", health_index: 0.93, moisture: 82, ph: 6.6, chlorophyll_index: 42.5, coordinates: { lat: -7.7476, lng: 110.3553 } },
    { id: "petak-k", code: "Petak K", grid_row: 2, grid_col: 2, fase: "Vegetatif (22 HST)", status: "Berisiko", health_index: 0.58, moisture: 52, ph: 5.2, chlorophyll_index: 26.5, coordinates: { lat: -7.7476, lng: 110.3556 } },
    { id: "petak-l", code: "Petak L", grid_row: 2, grid_col: 3, fase: "Vegetatif (22 HST)", status: "Sehat", health_index: 0.88, moisture: 77, ph: 6.3, chlorophyll_index: 38.9, coordinates: { lat: -7.7476, lng: 110.3559 } },
  ];

  const plots = propPlots && propPlots.length > 0 ? propPlots : defaultPlots;

  // Selected plot (default Petak A like in design)
  const [selectedPlot, setSelectedPlot] = useState<PlotData>(plots[0]);
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  const handlePlotClick = (plot: PlotData) => {
    setSelectedPlot(plot);
    if (onSelectPlot) {
      onSelectPlot(plot);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Sehat":
        return "bg-emerald-500/80 border-emerald-300 hover:bg-emerald-400/90";
      case "Perlu Perhatian":
        return "bg-amber-400/80 border-amber-200 hover:bg-amber-300/90";
      case "Berisiko":
        return "bg-rose-500/85 border-rose-300 hover:bg-rose-400/90";
      default:
        return "bg-emerald-500/80 border-emerald-300";
    }
  };

  const getStatusDot = (status: string) => {
    switch (status) {
      case "Sehat":
        return "bg-emerald-500";
      case "Perlu Perhatian":
        return "bg-amber-400";
      case "Berisiko":
        return "bg-rose-500";
      default:
        return "bg-emerald-500";
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden flex flex-col h-full">
      {/* Header Bar */}
      <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-200/70 flex items-center justify-center text-emerald-600">
            <MapPin className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-slate-800 text-sm tracking-tight">
            Digital Twin Lahan
          </h3>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-[11px] font-medium text-slate-600">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block shadow-2xs" />
            <span>Sehat</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block shadow-2xs" />
            <span>Perlu Perhatian</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block shadow-2xs" />
            <span>Berisiko</span>
          </div>
        </div>
      </div>

      {/* Main Map Canvas Area */}
      <div className="relative flex-1 min-h-[360px] sm:min-h-[420px] bg-slate-900 overflow-hidden flex items-center justify-center select-none group">
        {/* Background Aerial / Satellite imagery of actual lush rice fields */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-300"
          style={{
            backgroundImage: `url('/assets/img/sawah.jpg')`,
            transform: `scale(${zoomLevel})`,
          }}
        >
          {/* Subtle vignette/contrast overlay */}
          <div className="absolute inset-0 bg-slate-900/40" />
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
          <div className="p-2 rounded-2xl bg-white/20 backdrop-blur-xs border-2 border-white/80 shadow-2xl">
            {/* Grid of 12 Sub-plots */}
            <div className="grid grid-cols-4 gap-1.5 w-[360px] sm:w-[460px] md:w-[520px]">
              {plots.map((plot) => {
                const isSelected = selectedPlot?.id === plot.id;
                return (
                  <button
                    key={plot.id}
                    onClick={() => handlePlotClick(plot)}
                    className={`
                      relative aspect-[1.4] rounded-lg border transition-all duration-200 cursor-pointer flex flex-col justify-between p-1.5 text-left
                      ${getStatusColor(plot.status)}
                      ${
                        isSelected
                          ? "ring-4 ring-white ring-offset-2 ring-offset-emerald-900 shadow-xl scale-[1.03] z-20"
                          : "opacity-90 hover:opacity-100 hover:scale-[1.01]"
                      }
                    `}
                  >
                    {/* Petak Code */}
                    <div className="flex items-center justify-between w-full">
                      <span className="text-[10px] font-black tracking-wider text-white drop-shadow-sm uppercase">
                        {plot.code}
                      </span>
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${getStatusDot(
                          plot.status
                        )} border border-white/80`}
                      />
                    </div>

                    {/* Miniature health percentage */}
                    <div className="text-[9px] font-bold text-white/90 drop-shadow-xs">
                      {Math.round(plot.health_index * 100)}%
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
              {/* Tooltip Card */}
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
                    <div className="text-[10px] font-medium text-slate-500">
                      {selectedPlot.fase}
                    </div>
                  </div>
                </div>

                <div className="mt-2 pt-2 border-t border-slate-100 grid grid-cols-2 gap-1.5 text-[10px]">
                  <div>
                    <span className="text-slate-400 block text-[9px]">Status</span>
                    <span className="font-bold text-slate-700">{selectedPlot.status}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9px]">Klorofil</span>
                    <span className="font-bold text-slate-700">{selectedPlot.chlorophyll_index} SPAD</span>
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

        {/* Map Controls (Bottom Left: Zoom in, Zoom out, Recenter) */}
        <div className="absolute left-4 bottom-4 z-20 flex flex-col gap-1.5 bg-white/95 backdrop-blur-md rounded-xl p-1 shadow-lg border border-slate-200">
          <button
            onClick={() => setZoomLevel((prev) => Math.min(prev + 0.15, 1.6))}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-700 hover:bg-slate-100 transition-colors"
            title="Perbesar"
          >
            <Plus className="w-4 h-4" />
          </button>
          <div className="w-full h-px bg-slate-200" />
          <button
            onClick={() => setZoomLevel((prev) => Math.max(prev - 0.15, 0.8))}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-700 hover:bg-slate-100 transition-colors"
            title="Perkecil"
          >
            <Minus className="w-4 h-4" />
          </button>
          <div className="w-full h-px bg-slate-200" />
          <button
            onClick={() => setZoomLevel(1)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-700 hover:bg-slate-100 transition-colors"
            title="Reset Posisi"
          >
            <Crosshair className="w-4 h-4" />
          </button>
        </div>

        {/* Selected plot quick label bottom right */}
        {selectedPlot && (
          <div className="absolute right-4 bottom-4 z-20 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200 text-xs shadow-md">
            <span className="font-bold text-slate-800">{selectedPlot.code}</span>
            <span className="text-slate-400 mx-1.5">?</span>
            <span className="text-emerald-700 font-semibold">{selectedPlot.status}</span>
          </div>
        )}
      </div>
    </div>
  );
}

