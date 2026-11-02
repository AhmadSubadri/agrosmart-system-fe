"use client";

import React from "react";
import { BarChart3, Wheat, TrendingUp } from "lucide-react";

interface YieldData {
  yield_ton_per_ha: number;
  variance: string;
  per_petak_kg: number;
  jumlah_bulir: string;
  tren_mingguan?: {
    categories: string[];
    series: {
      name: string;
      data: number[];
    }[];
  };
}

interface Props {
  data?: YieldData;
}

export default function YieldPredictionCard({ data }: Props) {
  const yieldInfo = data ?? {
    yield_ton_per_ha: 6.8,
    variance: "± 0,4 ton",
    per_petak_kg: 850,
    jumlah_bulir: "≈ 120 bulir/malai",
    tren_mingguan: {
      categories: ["MST 1", "MST 2", "MST 3", "MST 4", "MST 5"],
      series: [
        { name: "Prediksi", data: [5.8, 6.2, 6.5, 6.8, 7.0] },
        { name: "Aktual", data: [5.2, 5.9, 6.3, 6.7, 6.8] },
      ],
    },
  };

  const categories = yieldInfo.tren_mingguan?.categories ?? [
    "MST 1",
    "MST 2",
    "MST 3",
    "MST 4",
    "MST 5",
  ];
  const prediksiData =
    yieldInfo.tren_mingguan?.series?.find((s) => s.name === "Prediksi")?.data ??
    [5.8, 6.2, 6.5, 6.8, 7.0];
  const aktualData =
    yieldInfo.tren_mingguan?.series?.find((s) => s.name === "Aktual")?.data ??
    [5.2, 5.9, 6.3, 6.7, 6.8];

  // SVG Chart calculation
  const width = 280;
  const height = 90;
  const minY = 4;
  const maxY = 8;

  const getPoints = (values: number[]) => {
    return values
      .map((val, idx) => {
        const x = (idx / (values.length - 1)) * (width - 24) + 12;
        const y = height - ((val - minY) / (maxY - minY)) * (height - 20) - 10;
        return `${x},${y}`;
      })
      .join(" ");
  };

  const pointsPrediksi = getPoints(prediksiData);
  const pointsAktual = getPoints(aktualData);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-200/70 flex items-center justify-center text-emerald-600">
            <BarChart3 className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-slate-800 text-sm tracking-tight">
            Prediksi Produktivitas
          </h3>
        </div>
      </div>

      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        {/* Top 2 Stats Boxes */}
        <div className="grid grid-cols-2 gap-3 items-center">
          {/* Yield Box */}
          <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-100">
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-black text-slate-800 tracking-tight">
                {yieldInfo.yield_ton_per_ha}
              </span>
              <span className="text-xs font-semibold text-slate-600">
                ton/ha
              </span>
            </div>
            <div className="text-[10px] text-slate-500 font-medium">
              ({yieldInfo.variance})
            </div>
            <div className="text-[11px] font-semibold text-emerald-700 mt-1">
              ≈ {yieldInfo.per_petak_kg} kg/petak
            </div>
          </div>

          {/* Grains / Malai Box with visual */}
          <div className="bg-amber-50/60 rounded-xl p-3 border border-amber-100 flex items-center justify-between gap-2">
            <div>
              <span className="text-[10px] text-amber-800 font-medium block">
                Jumlah Bulir
              </span>
              <span className="text-xs font-black text-amber-950 block mt-0.5">
                {yieldInfo.jumlah_bulir}
              </span>
            </div>
            <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-amber-100/80 border border-amber-200/60 flex items-center justify-center text-amber-700">
              <Wheat className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </div>

        {/* Tren Prediksi Hasil Panen Mini Chart */}
        <div className="bg-slate-50/60 rounded-xl p-3 border border-slate-100">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold text-slate-700">
              Tren Prediksi Hasil Panen
            </span>

            {/* Legend */}
            <div className="flex items-center gap-3 text-[10px]">
              <div className="flex items-center gap-1 text-emerald-700 font-medium">
                <span className="w-2 h-0.5 bg-emerald-600 inline-block rounded-full" />
                <span>Prediksi</span>
              </div>
              <div className="flex items-center gap-1 text-slate-500 font-medium">
                <span className="w-2 h-0.5 bg-slate-400 inline-block border-b border-dashed" />
                <span>Aktual</span>
              </div>
            </div>
          </div>

          {/* SVG Line Chart */}
          <div className="w-full relative h-[75px] mt-1">
            <svg
              viewBox={`0 0 ${width} ${height}`}
              className="w-full h-full overflow-visible"
            >
              {/* Grid Lines */}
              <line
                x1="0"
                y1={height - 10}
                x2={width}
                y2={height - 10}
                stroke="#e2e8f0"
                strokeWidth="1"
              />
              <line
                x1="0"
                y1={height / 2}
                x2={width}
                y2={height / 2}
                stroke="#e2e8f0"
                strokeWidth="1"
                strokeDasharray="2 2"
              />

              {/* Prediksi Line (Emerald Solid) */}
              <polyline
                fill="none"
                stroke="#059669"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={pointsPrediksi}
              />

              {/* Aktual Line (Slate Dashed) */}
              <polyline
                fill="none"
                stroke="#64748b"
                strokeWidth="2"
                strokeDasharray="3 3"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={pointsAktual}
              />

              {/* Data Dots for Prediksi */}
              {prediksiData.map((val, idx) => {
                const x = (idx / (prediksiData.length - 1)) * (width - 24) + 12;
                const y =
                  height - ((val - minY) / (maxY - minY)) * (height - 20) - 10;
                return (
                  <circle
                    key={idx}
                    cx={x}
                    cy={y}
                    r="3"
                    className="fill-emerald-600 stroke-white stroke-2"
                  />
                );
              })}
            </svg>
          </div>

          {/* X Axis Labels */}
          <div className="flex items-center justify-between text-[9px] text-slate-400 font-medium mt-1 px-1">
            {categories.map((cat, idx) => (
              <span key={idx}>{cat}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

