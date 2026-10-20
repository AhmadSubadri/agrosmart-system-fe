"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Sparkles,
  Camera,
  MessageSquare,
  ArrowRight,
  Leaf,
  CheckCircle2,
  Calendar,
  Sprout,
  Bot,
} from "lucide-react";

interface AiAgronomyWidgetProps {
  currentPhase?: string;
  plantAge?: number;
  plantCommodity?: string;
  soilPh?: number;
  temperature?: number;
  humidity?: number;
}

export default function AiAgronomyWidget({
  currentPhase = "Fase Vegetatif (V2)",
  plantAge = 42,
  plantCommodity = "Padi Sawah",
  soilPh = 6.4,
  temperature = 28.5,
  humidity = 76,
}: AiAgronomyWidgetProps) {
  const [latestFase, setLatestFase] = useState<{
    fase: string;
    confidence: number;
    estimasi_hst: string;
    ciri_visual: string;
    img?: string;
  } | null>(null);

  // Check if there is saved recent vision diagnosis in localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("last_fase_detection");
      if (saved) {
        setLatestFase(JSON.parse(saved));
      }
    } catch {
      // ignore
    }
  }, []);

  const defaultFaseImg = "/assets/img/deteksi-fase/v2.jpg";

  // Dynamic AI advice based on current telemetry
  const getAiAdvice = () => {
    if (soilPh < 6.0) {
      return `pH tanah Anda ${soilPh.toFixed(1)} (asam). Rekomendasi AI: Berikan kapur pertanian/dolomit 150-200 kg/ha sebelum pemupukan susulan agar penyerapan NPK optimal.`;
    }
    if (humidity > 78 && temperature > 28) {
      return `Kombinasi kelembapan (${humidity}%) & suhu (${temperature}°C) saat ini memicu risiko jamur daun/blas. AI menyarankan pantau daun bendera dan lakukan penyemprotan preventif pagi hari.`;
    }
    return `Kondisi mikroklimat lahan terpantau sangat ideal (Suhu ${temperature}°C, pH ${soilPh.toFixed(1)}). Tanaman padi berada pada ${currentPhase} (${plantAge} HST). Jaga pasokan air macak-macak untuk stimulasi anakan produktif.`;
  };

  const consultationPrompt = `Halo KawalTani AI, tanaman saya saat ini ${plantCommodity} umur ${plantAge} HST (${currentPhase}). pH tanah tercatat ${soilPh.toFixed(1)}, suhu ${temperature}°C, kelembapan ${humidity}%. Apa saran perawatan dan pemupukan paling tepat untuk hari ini?`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* 1. Computer Vision Rice Growth Phase Summary */}
      <div className="lg:col-span-6 bg-white border border-bone-300 rounded-2xl shadow-soft p-5 flex flex-col justify-between relative overflow-hidden">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-bone-200">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-forest-900 text-wheat-300 flex items-center justify-center">
                <Camera className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-extrabold text-forest-900 text-base">
                  Diagnosis Citra Fase Padi
                </h3>
                <p className="text-xs text-sage-700">Analisis agronomik berbasis Computer Vision</p>
              </div>
            </div>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-forest-50 border border-forest-200 text-forest-900 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-wheat-600" />
              AI Vision Qwen 3.8
            </span>
          </div>

          {/* Visual Showcase Card */}
          <div className="flex flex-col sm:flex-row items-center gap-4 bg-bone-50/80 border border-bone-200 p-3.5 rounded-xl mb-4">
            <div className="w-full sm:w-28 h-28 rounded-lg overflow-hidden relative bg-bone-200 flex-shrink-0 border border-bone-300 shadow-2xs">
              <Image
                src={latestFase?.img || defaultFaseImg}
                alt="Deteksi Fase Padi"
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, 120px"
              />
              <div className="absolute top-1 right-1 bg-forest-900/90 text-wheat-300 text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm">
                {latestFase?.confidence ? `${latestFase.confidence}%` : "95% Akurasi"}
              </div>
            </div>

            <div className="flex-1 min-w-0 space-y-1.5 w-full">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-sage-700 uppercase tracking-wide">
                  Fase Pertumbuhan
                </span>
              </div>
              <h4 className="font-extrabold text-forest-900 text-base truncate">
                {latestFase?.fase ? latestFase.fase.replace("fase_", "Fase ").toUpperCase() : currentPhase}
              </h4>
              <p className="text-xs text-sage-700 leading-snug line-clamp-2">
                {latestFase?.ciri_visual ||
                  "Kanopi daun hijau lebat menutup rapat dengan anakan produktif maksimal, belum tampak bulir malai."}
              </p>
              <div className="flex items-center gap-3 pt-1 text-[11px] font-semibold text-forest-800">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-sage-600" />
                  {latestFase?.estimasi_hst || `${plantAge} HST`}
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-sage-600" />
                  Sehat / Normal
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Action */}
        <div className="pt-3 border-t border-bone-200 flex items-center justify-between gap-3">
          <span className="text-xs text-sage-600 font-medium">
            Unggah foto tanaman terbaru untuk update rekomendasi
          </span>
          <Link
            href="/deteksi-fase-padi"
            className="px-3.5 py-2 bg-forest-900 hover:bg-forest-800 text-wheat-300 text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5 whitespace-nowrap active:scale-[0.98]"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Deteksi Baru</span>
            <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
          </Link>
        </div>
      </div>

      {/* 2. KawalTani AI Daily Agronomist Advisory */}
      <div className="lg:col-span-6 bg-gradient-to-br from-forest-900 via-forest-900 to-forest-800 text-bone-100 border border-forest-700/80 rounded-2xl shadow-soft p-5 flex flex-col justify-between relative overflow-hidden">
        {/* Glow ambient background */}
        <div className="absolute top-0 right-0 -mr-10 -mt-10 w-44 h-44 bg-wheat-400/15 rounded-full blur-3xl pointer-events-none" />

        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-forest-700/60">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-wheat-400/20 border border-wheat-400/30 flex items-center justify-center text-wheat-300">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-extrabold text-white text-base">
                  Rekomendasi Agronomis KawalTani AI
                </h3>
                <p className="text-xs text-sage-300">Asisten cerdas pendamping budidaya presisi</p>
              </div>
            </div>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-forest-950/80 text-wheat-300 border border-forest-700">
              Live Advisory
            </span>
          </div>

          {/* Advice Body */}
          <div className="p-4 rounded-xl bg-forest-950/50 border border-forest-700/50 mb-4">
            <div className="flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-wheat-400 mt-0.5 flex-shrink-0 animate-pulse" />
              <div>
                <span className="text-[11px] font-bold text-wheat-400 uppercase tracking-wider block mb-1">
                  Analisis Kondisi Hari Ini:
                </span>
                <p className="text-xs text-bone-100 leading-relaxed font-normal">
                  {getAiAdvice()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Action */}
        <div className="pt-3 border-t border-forest-700/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-xs text-sage-300">
            <Leaf className="w-3.5 h-3.5 text-wheat-400" />
            <span>KawalTani AI terhubung ke data IoT lahan</span>
          </div>
          <Link
            href={`/chatbot?prompt=${encodeURIComponent(consultationPrompt)}`}
            className="w-full sm:w-auto px-4 py-2 bg-wheat-400 hover:bg-wheat-300 text-forest-950 text-xs font-extrabold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 whitespace-nowrap active:scale-[0.98]"
          >
            <MessageSquare className="w-3.5 h-3.5 text-forest-950" />
            <span>Konsultasi ke Chatbot</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
