"use client";

import React, { useState } from "react";
import {
  Sprout,
  CheckCircle2,
  Thermometer,
  Droplets,
  CloudRain,
  Wind,
  Activity,
  Gauge,
  Sun,
  Layers,
} from "lucide-react";

interface PlantStatus {
  varietas: string;
  fase: string;
  tinggi_tanaman_cm: number;
  indeks_kesehatan: number;
  status_kesehatan: string;
  image_url: string;
}

interface SoilStatus {
  ph: number;
  kelembapan: number;
  suhu: number;
  ec: number;
  tds: number;
  npk: {
    n: number;
    p: number;
    k: number;
  };
}

interface WeatherStatus {
  suhu: number;
  kelembapan: number;
  curah_hujan: number;
  kecepatan_angin: number;
  kondisi: string;
}

interface Props {
  tanaman?: PlantStatus;
  tanah?: SoilStatus;
  cuaca?: WeatherStatus;
}

export default function CropEnvironmentStatus({
  tanaman: propTanaman,
  tanah: propTanah,
  cuaca: propCuaca,
}: Props) {
  const [activeTab, setActiveTab] = useState<"tanaman" | "tanah" | "cuaca">(
    "tanaman"
  );

  const tanaman = propTanaman ?? {
    varietas: "Inpari 32",
    fase: "Vegetatif",
    tinggi_tanaman_cm: 18,
    indeks_kesehatan: 0.92,
    status_kesehatan: "Sangat Baik",
    image_url:
      "https://images.unsplash.com/photo-1536657464919-892534f60d6e?w=500&auto=format&fit=crop&q=80",
  };

  const tanah = propTanah ?? {
    ph: 6.5,
    kelembapan: 78,
    suhu: 26.5,
    ec: 1.2,
    tds: 450,
    npk: { n: 115, p: 42, k: 165 },
  };

  const cuaca = propCuaca ?? {
    suhu: 28,
    kelembapan: 78,
    curah_hujan: 12,
    kecepatan_angin: 5.4,
    kondisi: "Cerah Berawan",
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden flex flex-col h-full">
      {/* Header Bar with Tabs */}
      <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-200/70 flex items-center justify-center text-emerald-600">
            <Sprout className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-slate-800 text-sm tracking-tight">
            Status Tanaman & Lingkungan
          </h3>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center p-1 bg-slate-100/90 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveTab("tanaman")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === "tanaman"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Tanaman
          </button>
          <button
            onClick={() => setActiveTab("tanah")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === "tanah"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Tanah
          </button>
          <button
            onClick={() => setActiveTab("cuaca")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === "cuaca"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Cuaca
          </button>
        </div>
      </div>

      {/* Tab Content Body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        {activeTab === "tanaman" && (
          <div className="space-y-4">
            {/* Top row: Plant Image + Metrics Checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              {/* Plant Photo */}
              <div className="aspect-[4/3] rounded-xl overflow-hidden border border-slate-200 bg-slate-100 relative shadow-2xs group">
                <img
                  src={
                    tanaman.image_url ||
                    "https://images.unsplash.com/photo-1536657464919-892534f60d6e?w=500&auto=format&fit=crop&q=80"
                  }
                  alt="Tanaman Padi"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-xs text-white text-[10px] px-2 py-0.5 rounded-md font-medium">
                  {tanaman.varietas}
                </div>
              </div>

              {/* Plant Metrics */}
              <div className="space-y-2.5 text-xs text-slate-700">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span className="text-slate-500">Fase :</span>
                  <span className="font-bold text-slate-900">{tanaman.fase}</span>
                </div>

                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span className="text-slate-500">Tinggi Tanaman :</span>
                  <span className="font-bold text-slate-900">
                    {tanaman.tinggi_tanaman_cm} cm
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span className="text-slate-500">Indeks Kesehatan :</span>
                    <span className="font-bold text-slate-900">
                      {tanaman.indeks_kesehatan} ({tanaman.status_kesehatan})
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-100 rounded-full h-2 mt-1 overflow-hidden border border-slate-200/80">
                    <div
                      className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${tanaman.indeks_kesehatan * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Row Mini Cards: Suhu, Kelembapan, Curah Hujan */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="bg-slate-50/80 rounded-xl p-2.5 border border-slate-200/80 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-200/70 text-rose-500 flex items-center justify-center flex-shrink-0">
                  <Thermometer className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block leading-tight">
                    Suhu
                  </span>
                  <span className="text-sm font-black text-slate-800">
                    {cuaca.suhu}°C
                  </span>
                </div>
              </div>

              <div className="bg-slate-50/80 rounded-xl p-2.5 border border-slate-200/80 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-sky-50 border border-sky-200/70 text-sky-500 flex items-center justify-center flex-shrink-0">
                  <Droplets className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block leading-tight">
                    Kelembapan
                  </span>
                  <span className="text-sm font-black text-slate-800">
                    {cuaca.kelembapan}%
                  </span>
                </div>
              </div>

              <div className="bg-slate-50/80 rounded-xl p-2.5 border border-slate-200/80 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200/70 text-blue-500 flex items-center justify-center flex-shrink-0">
                  <CloudRain className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block leading-tight">
                    Curah Hujan
                  </span>
                  <span className="text-sm font-black text-slate-800">
                    {cuaca.curah_hujan} mm
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "tanah" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80">
                <span className="text-[11px] text-slate-500 block">pH Tanah</span>
                <span className="text-xl font-bold text-slate-800 mt-1 block">
                  {tanah.ph}
                </span>
                <span className="text-[10px] font-semibold text-emerald-600">
                  Normal (6.0 - 7.0)
                </span>
              </div>

              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80">
                <span className="text-[11px] text-slate-500 block">Kelembapan</span>
                <span className="text-xl font-bold text-slate-800 mt-1 block">
                  {tanah.kelembapan}%
                </span>
                <span className="text-[10px] font-semibold text-emerald-600">
                  Optimal (65 - 85%)
                </span>
              </div>

              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80">
                <span className="text-[11px] text-slate-500 block">Konduktivitas (EC)</span>
                <span className="text-xl font-bold text-slate-800 mt-1 block">
                  {tanah.ec} <span className="text-xs font-normal">mS/cm</span>
                </span>
                <span className="text-[10px] font-semibold text-slate-500">
                  Status Baik
                </span>
              </div>
            </div>

            {/* NPK Breakdown */}
            <div className="bg-emerald-50/50 rounded-xl p-3.5 border border-emerald-100">
              <span className="text-xs font-bold text-emerald-900 block mb-2">
                Unsur Hara Makro (NPK)
              </span>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-white rounded-lg p-2 border border-emerald-200/60">
                  <span className="text-[10px] text-slate-500 block">Nitrogen (N)</span>
                  <span className="text-sm font-black text-slate-800">
                    {tanah.npk.n} <span className="text-[9px]">mg/kg</span>
                  </span>
                </div>
                <div className="bg-white rounded-lg p-2 border border-emerald-200/60">
                  <span className="text-[10px] text-slate-500 block">Fosfor (P)</span>
                  <span className="text-sm font-black text-slate-800">
                    {tanah.npk.p} <span className="text-[9px]">mg/kg</span>
                  </span>
                </div>
                <div className="bg-white rounded-lg p-2 border border-emerald-200/60">
                  <span className="text-[10px] text-slate-500 block">Kalium (K)</span>
                  <span className="text-sm font-black text-slate-800">
                    {tanah.npk.k} <span className="text-[9px]">mg/kg</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "cuaca" && (
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-sky-50 to-blue-50/60 rounded-xl p-4 border border-sky-100 flex items-center justify-between">
              <div>
                <span className="text-xs font-medium text-sky-800 block">
                  Kondisi Cuaca Lahan
                </span>
                <span className="text-xl font-bold text-slate-900 mt-0.5 block">
                  {cuaca.kondisi}
                </span>
                <span className="text-[11px] text-slate-500">
                  Stasiun Cuaca AWS Lahan Sleman
                </span>
              </div>
              <Sun className="w-10 h-10 text-amber-500 animate-spin-slow" />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-200/80">
                <span className="text-[10px] text-slate-400 block">Suhu Udara</span>
                <span className="text-base font-bold text-slate-800 mt-0.5 block">
                  {cuaca.suhu}°C
                </span>
              </div>
              <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-200/80">
                <span className="text-[10px] text-slate-400 block">Kelembapan</span>
                <span className="text-base font-bold text-slate-800 mt-0.5 block">
                  {cuaca.kelembapan}%
                </span>
              </div>
              <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-200/80">
                <span className="text-[10px] text-slate-400 block">Curah Hujan</span>
                <span className="text-base font-bold text-slate-800 mt-0.5 block">
                  {cuaca.curah_hujan} mm
                </span>
              </div>
              <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-200/80">
                <span className="text-[10px] text-slate-400 block">Kec. Angin</span>
                <span className="text-base font-bold text-slate-800 mt-0.5 block">
                  {cuaca.kecepatan_angin} km/h
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

