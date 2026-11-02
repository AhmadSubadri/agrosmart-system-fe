"use client";

import React from "react";
import { BarChart3, Wheat, TrendingUp, CheckCircle2, Info } from "lucide-react";

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
      categories: ["Minggu 1", "Minggu 2", "Minggu 3", "Minggu 4 (Hari Ini)", "Minggu 5"],
      series: [
        { name: "Perkiraan Hasil", data: [5.8, 6.2, 6.5, 6.8, 7.0] },
        { name: "Kondisi Nyata Lapangan", data: [5.2, 5.9, 6.3, 6.7, 6.8] },
      ],
    },
  };

  const categories = [
    "Mg 1 (Awal)",
    "Mg 2",
    "Mg 3",
    "Mg 4 (Sekarang)",
    "Mg 5 (Panen)",
  ];
  const prediksiData = [5.8, 6.2, 6.5, 6.8, 7.0];
  const aktualData = [5.2, 5.9, 6.3, 6.8, null];

  // SVG Chart calculation
  const width = 340;
  const height = 95;
  const minY = 4.5;
  const maxY = 7.5;

  const getPoints = (values: (number | null)[]) => {
    return values
      .map((val, idx) => {
        if (val === null) return null;
        const x = (idx / (values.length - 1)) * (width - 40) + 20;
        const y = height - ((val - minY) / (maxY - minY)) * (height - 24) - 12;
        return `${x},${y}`;
      })
      .filter(Boolean)
      .join(" ");
  };

  const pointsPrediksi = getPoints(prediksiData);
  const pointsAktual = getPoints(aktualData);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200/70 flex items-center justify-center text-emerald-600">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-black text-slate-900 text-sm tracking-tight">
              Prediksi Hasil Panen
            </h3>
            <span className="text-[11px] text-slate-400 block">
              Perkiraan jumlah ton gabah yang akan diperoleh
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-[10px] font-bold text-emerald-700 border border-emerald-200/60">
          <TrendingUp className="w-3 h-3" />
          <span>Tren Naik</span>
        </div>
      </div>

      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        {/* Top 2 Stats Boxes */}
        <div className="grid grid-cols-2 gap-3 items-center">
          {/* Yield Box */}
          <div className="bg-emerald-50/60 rounded-xl p-3 border border-emerald-200/70">
            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
              Hasil Gabah / Hektar
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-2xl font-black text-emerald-950 tracking-tight">
                {yieldInfo.yield_ton_per_ha}
              </span>
              <span className="text-xs font-bold text-emerald-800">
                Ton / Ha
              </span>
            </div>
            <div className="text-[11px] font-bold text-emerald-700 mt-1">
              ≈ {yieldInfo.per_petak_kg} kg tiap petak
            </div>
          </div>

          {/* Grains / Malai Box */}
          <div className="bg-amber-50/60 rounded-xl p-3 border border-amber-200/70 flex items-center justify-between gap-2">
            <div>
              <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">
                Kerapatan Bulir
              </span>
              <span className="text-base font-black text-amber-950 block mt-0.5 leading-tight">
                {yieldInfo.jumlah_bulir}
              </span>
              <span className="text-[10px] font-semibold text-amber-700 block mt-0.5">
                Malai Berisi Penuh
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 bg-amber-100 border border-amber-300/80 flex items-center justify-center text-amber-700 shadow-2xs">
              <Wheat className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </div>

        {/* Tren Grafik Perkembangan Mingguan (MST) */}
        <div className="bg-slate-50/70 rounded-xl p-3 border border-slate-200/80">
          <div className="flex items-center justify-between mb-1.5 flex-wrap gap-1">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-black text-slate-800">
                Grafik Perkembangan Mingguan
              </span>
              <span className="text-[10px] text-slate-400 font-medium">
                (MST: Minggu Setelah Tanam)
              </span>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-2.5 text-[10px]">
              <div className="flex items-center gap-1 text-emerald-700 font-bold">
                <span className="w-2.5 h-1 bg-emerald-600 inline-block rounded-full" />
                <span>Prediksi</span>
              </div>
              <div className="flex items-center gap-1 text-slate-500 font-bold">
                <span className="w-2.5 h-1 bg-slate-400 inline-block border-b border-dashed" />
                <span>Nyata</span>
              </div>
            </div>
          </div>

          {/* SVG Line Chart */}
          <div className="w-full relative h-[80px] mt-2">
            <svg
              viewBox={`0 0 ${width} ${height}`}
              className="w-full h-full overflow-visible"
            >
              {/* Grid Lines */}
              <line
                x1="10"
                y1={height - 12}
                x2={width - 10}
                y2={height - 12}
                stroke="#cbd5e1"
                strokeWidth="1"
              />
              <line
                x1="10"
                y1={height / 2}
                x2={width - 10}
                y2={height / 2}
                stroke="#e2e8f0"
                strokeWidth="1"
                strokeDasharray="3 3"
              />

              {/* Prediksi Line (Emerald Thick Solid) */}
              <polyline
                fill="none"
                stroke="#059669"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={pointsPrediksi}
              />

              {/* Aktual Line (Slate Dashed) */}
              <polyline
                fill="none"
                stroke="#64748b"
                strokeWidth="2.5"
                strokeDasharray="4 4"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={pointsAktual}
              />

              {/* Highlight Pin on Current Week (Mg 4: 6.8 Ton) */}
              <circle
                cx={(3 / 4) * (width - 40) + 20}
                cy={height - ((6.8 - minY) / (maxY - minY)) * (height - 24) - 12}
                r="5"
                className="fill-emerald-600 stroke-white stroke-2 animate-pulse"
              />
            </svg>
          </div>

          {/* X Axis Labels */}
          <div className="flex items-center justify-between text-[10px] text-slate-600 font-bold mt-1 px-1">
            {categories.map((cat, idx) => (
              <span
                key={idx}
                className={idx === 3 ? "text-emerald-700 underline font-black" : ""}
              >
                {cat}
              </span>
            ))}
          </div>
        </div>

        {/* Farmer Plain Explanation */}
        <div className="p-2.5 rounded-xl bg-emerald-50/80 border border-emerald-100 flex items-start gap-2 text-[11px] text-emerald-950 font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
          <span>
            <strong>Kabar Baik Petani:</strong> Tanaman padi tumbuh di atas target normal. Potensi panen mencapai <strong>6,8 Ton/Ha</strong> jika pengairan macak-macak dipertahankan.
          </span>
        </div>
      </div>
    </div>
  );
}
