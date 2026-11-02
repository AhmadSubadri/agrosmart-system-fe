"use client";

import React from "react";
import {
  Sparkles,
  Droplets,
  Sprout,
  ShieldAlert,
  ChevronRight,
  MessageSquare,
  CheckCircle2,
  Calendar,
} from "lucide-react";
import Link from "next/link";

interface Props {
  recommendations?: any[];
  realtimeSensors?: {
    suhu?: number;
    kelembapan?: number;
    curah_hujan?: number;
    ph?: number;
    hst?: number;
  };
}

export default function ActionableRecommendations({
  realtimeSensors,
}: Props) {
  const suhu = realtimeSensors?.suhu ?? 26.9;
  const kelembapan = realtimeSensors?.kelembapan ?? 76.5;
  const hujan = realtimeSensors?.curah_hujan ?? 12;
  const hst = realtimeSensors?.hst ?? 22;

  // Analisis dinamis berbasis data sensor realtime
  const getAirAdvice = () => {
    if (kelembapan < 60) {
      return {
        title: "Kebutuhan Air: Segera Airi Sawah",
        status: "Perlu Pengairan",
        statusColor: "bg-amber-100 text-amber-800",
        desc: `Kelembapan tanah rendah (${kelembapan}%). Buka pintu irigasi setinggi 5 cm agar tanah tidak retak.`,
      };
    }
    return {
      title: "Kebutuhan Air: Tanah Sudah Cukup Basah",
      status: "Aman",
      statusColor: "bg-emerald-100 text-emerald-800",
      desc: `Kelembapan tanah ${kelembapan}% & ada hujan ${hujan} mm. Pintu air tetap ditutup, air sudah macak-macak optimal.`,
    };
  };

  const getPupukAdvice = () => {
    if (hst <= 30) {
      return {
        title: `Pemupukan Susulan I (Padi Umur ${hst} HST)`,
        status: "Wajib Hari Ini",
        statusColor: "bg-emerald-100 text-emerald-800",
        desc: "Padi sedang giat membentuk anakan. Taburkan Urea 50 kg/ha dan Ponska 70 kg/ha agar malai banyak.",
      };
    }
    return {
      title: `Pemupukan Susulan II (Padi Umur ${hst} HST)`,
      status: "Terjadwal",
      statusColor: "bg-sky-100 text-sky-800",
      desc: "Berikan pupuk KCL untuk memperkokoh batang tanaman dan pengisian bulir padi.",
    };
  };

  const getHamaAdvice = () => {
    if (kelembapan > 70) {
      return {
        title: "Peringatan Hama & Jamur (Cuaca Lembap)",
        status: "Waspada",
        statusColor: "bg-amber-100 text-amber-800",
        desc: `Suhu ${suhu}°C dengan udara lembap memicu jamur blas atau wereng. Cek pangkal rumpun padi pagi ini.`,
      };
    }
    return {
      title: "Kondisi Lingkungan Stabil",
      status: "Kondusif",
      statusColor: "bg-emerald-100 text-emerald-800",
      desc: "Sirkulasi udara dan intensitas cahaya matahari cukup baik untuk pertumbuhan fotosintesis.",
    };
  };

  const air = getAirAdvice();
  const pupuk = getPupukAdvice();
  const hama = getHamaAdvice();

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200/70 flex items-center justify-center text-emerald-600">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-black text-slate-900 text-sm tracking-tight flex items-center gap-1.5">
              Rekomendasi AI Real-time
            </h3>
            <span className="text-[11px] text-slate-400 block">
              Instruksi praktis otomatis dari data sensor lahan hari ini
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-[10px] font-black text-emerald-700 border border-emerald-200/60">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Realtime AI</span>
        </div>
      </div>

      {/* Cards List */}
      <div className="p-4 flex-1 flex flex-col justify-between gap-3">
        {/* 1. Pengaturan Air */}
        <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-white hover:border-slate-300 transition-all flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-sky-50 border border-sky-200 text-sky-600 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Droplets className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-black text-slate-900 leading-tight">
                {air.title}
              </span>
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${air.statusColor}`}>
                {air.status}
              </span>
            </div>
            <p className="text-[11px] text-slate-600 mt-1 leading-snug">
              👉 {air.desc}
            </p>
          </div>
        </div>

        {/* 2. Pemupukan */}
        <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-white hover:border-slate-300 transition-all flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Sprout className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-black text-slate-900 leading-tight">
                {pupuk.title}
              </span>
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${pupuk.statusColor}`}>
                {pupuk.status}
              </span>
            </div>
            <p className="text-[11px] text-slate-600 mt-1 leading-snug">
              👉 {pupuk.desc}
            </p>
          </div>
        </div>

        {/* 3. Perlindungan Tanaman / Cuaca */}
        <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-white hover:border-slate-300 transition-all flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center flex-shrink-0 mt-0.5">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-black text-slate-900 leading-tight">
                {hama.title}
              </span>
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${hama.statusColor}`}>
                {hama.status}
              </span>
            </div>
            <p className="text-[11px] text-slate-600 mt-1 leading-snug">
              👉 {hama.desc}
            </p>
          </div>
        </div>

        {/* Bottom CTA to Chatbot */}
        <Link
          href="/chatbot"
          className="mt-1 flex items-center justify-between p-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
        >
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            <span>Butuh bantuan lebih detail? Tanya Asisten AI</span>
          </div>
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
