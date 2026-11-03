"use client";

import React from "react";
import {
  Sprout,
  Droplets,
  Thermometer,
  Zap,
  Activity,
  Layers,
  FlaskConical,
  Scale,
  Sparkles,
} from "lucide-react";

interface ParameterData {
  ph: number;
  nitrogen: number;
  fosfor: number;
  kalium: number;
  temp: number;
  hum: number;
  ec: number;
  tds: number;
  plotName?: string;
}

export default function AnalitikParameterCards({
  ph,
  nitrogen,
  fosfor,
  kalium,
  temp,
  hum,
  ec,
  tds,
  plotName = "Petak Terpilih",
}: ParameterData) {
  // Evaluasi Status Parameter untuk Petani
  const parameters = [
    {
      id: "ph",
      title: "Keasaman Tanah (pH)",
      subtitle: "Keseimbangan Kimia Tanah",
      value: ph.toFixed(1),
      unit: "pH",
      ideal: "6.0 - 7.0",
      icon: <Sprout className="w-5 h-5" />,
      colorTheme: "emerald",
      status: ph >= 6.0 && ph <= 7.2 ? "Optimal" : ph < 6.0 ? "Masam" : "Basa",
      statusType: ph >= 6.0 && ph <= 7.2 ? "ok" : ph < 5.5 ? "danger" : "warning",
      percent: Math.min(100, Math.max(0, ((ph - 4) / 4) * 100)),
      farmerAdvice:
        ph < 5.5
          ? "Tanah masam menghambat serapan pupuk. Taburkan kapur dolomit 150-200 kg/ha."
          : ph > 7.5
          ? "Tanah agak basa. Tambahkan bahan organik atau kompos matang."
          : "pH netral sempurna! Perakaran tanaman padi mampu menyerap pupuk secara maksimal.",
    },
    {
      id: "nitrogen",
      title: "Nitrogen (N)",
      subtitle: "Unsur Utama Daun & Anakan (Urea)",
      value: Math.round(nitrogen),
      unit: "mg/kg",
      ideal: "90 - 180 mg/kg",
      icon: <FlaskConical className="w-5 h-5" />,
      colorTheme: "green",
      status: nitrogen >= 90 && nitrogen <= 180 ? "Optimal" : nitrogen < 90 ? "Kurang N" : "Berlebih",
      statusType: nitrogen >= 90 && nitrogen <= 180 ? "ok" : nitrogen < 70 ? "danger" : "warning",
      percent: Math.min(100, Math.max(0, (nitrogen / 220) * 100)),
      farmerAdvice:
        nitrogen < 90
          ? "Daun berpotensi menguning. Berikan pupuk Urea atau ZA susulan 50 kg/ha."
          : nitrogen > 200
          ? "Kadar N terlalu tinggi membuat batang lunak dan rentan roboh/hama wereng. Kurangi Urea."
          : "Kadar Nitrogen ideal! Pertumbuhan daun hijau segar dan anakan produktif lancar.",
    },
    {
      id: "fosfor",
      title: "Fosfor (P)",
      subtitle: "Penguat Akar & Batang (SP-36)",
      value: Math.round(fosfor),
      unit: "mg/kg",
      ideal: "100 - 400 mg/kg",
      icon: <Layers className="w-5 h-5" />,
      colorTheme: "blue",
      status: fosfor >= 100 ? "Subur / Kaya" : "Kurang P",
      statusType: fosfor >= 100 ? "ok" : "warning",
      percent: Math.min(100, Math.max(0, (fosfor / 450) * 100)),
      farmerAdvice:
        fosfor < 100
          ? "Akar tanaman pendek dan anakan sedikit. Tambahkan pupuk SP-36 atau TSP."
          : "Kandungan Fosfor melimpah. Sistem perakaran kokoh dan tahan rebah, hemat pupuk P musim ini.",
    },
    {
      id: "kalium",
      title: "Kalium (K)",
      subtitle: "Ketahanan Hama & Pengisian Bulir (KCl)",
      value: Math.round(kalium),
      unit: "mg/kg",
      ideal: "120 - 400 mg/kg",
      icon: <Scale className="w-5 h-5" />,
      colorTheme: "amber",
      status: kalium >= 120 ? "Optimal" : "Kurang K",
      statusType: kalium >= 120 ? "ok" : "warning",
      percent: Math.min(100, Math.max(0, (kalium / 450) * 100)),
      farmerAdvice:
        kalium < 120
          ? "Bulir padi berisiko hampa. Tambahkan pupuk KCl saat fase pembentukan malai (primordia)."
          : "Kalium sangat prima! Gabah akan terisi padat, bernas, dan tahan terhadap serangan penyakit jamur.",
    },
    {
      id: "temp",
      title: "Suhu Tanah",
      subtitle: "Termal Zona Perakaran Padi",
      value: temp.toFixed(1),
      unit: "°C",
      ideal: "24.0 - 30.0 °C",
      icon: <Thermometer className="w-5 h-5" />,
      colorTheme: "orange",
      status: temp >= 24 && temp <= 31 ? "Hangat Normal" : temp > 31 ? "Terlalu Panas" : "Dingin",
      statusType: temp >= 24 && temp <= 31 ? "ok" : "warning",
      percent: Math.min(100, Math.max(0, ((temp - 15) / 25) * 100)),
      farmerAdvice:
        temp > 31
          ? "Suhu tanah agak panas. Alirkan air segar secara perlahan untuk mendinginkan zona perakaran."
          : "Suhu perakaran ideal untuk metabolisme hara dan aktivitas cacing/mikroba penyubur.",
    },
    {
      id: "hum",
      title: "Kelembapan Tanah",
      subtitle: "Ketersediaan Air di Lapisan Olah",
      value: Math.round(hum),
      unit: "%",
      ideal: "65% - 85%",
      icon: <Droplets className="w-5 h-5" />,
      colorTheme: "sky",
      status: hum >= 65 && hum <= 85 ? "Macak-macak" : hum < 65 ? "Kering" : "Tergenang",
      statusType: hum >= 65 && hum <= 85 ? "ok" : hum < 50 ? "danger" : "warning",
      percent: Math.min(100, Math.max(0, hum)),
      farmerAdvice:
        hum < 65
          ? "Tanah mulai mengering dan merekah. Buka saluran irigasi agar tanaman tidak stres."
          : hum > 90
          ? "Air terlalu tinggi. Buka saluran pembuangan untuk mengeringkan sebentar (intermittent)."
          : "Kondisi air macak-macak sangat sempurna! Merangsang anakan padi bertunas lebih banyak.",
    },
    {
      id: "ec",
      title: "Kelarutan Pupuk (EC)",
      subtitle: "Daya Hantar Nutrisi Terlarut",
      value: Math.round(ec),
      unit: "µS/cm",
      ideal: "400 - 1200 µS/cm",
      icon: <Zap className="w-5 h-5" />,
      colorTheme: "indigo",
      status: ec >= 400 && ec <= 1400 ? "Seimbang" : ec < 400 ? "Nutrisi Rendah" : "Pekat",
      statusType: ec >= 400 && ec <= 1400 ? "ok" : "warning",
      percent: Math.min(100, Math.max(0, (ec / 1600) * 100)),
      farmerAdvice:
        ec < 400
          ? "Kelarutan nutrisi tanah tipis. Diperlukan penambahan pupuk dasar/organik."
          : "Kelarutan nutrisi dan pupuk dalam kondisi seimbang, mudah disedot oleh bulu akar padi.",
    },
    {
      id: "tds",
      title: "Kepekatan Mineral (TDS)",
      subtitle: "Total Partikel Terlarut",
      value: Math.round(tds),
      unit: "ppm",
      ideal: "200 - 800 ppm",
      icon: <Activity className="w-5 h-5" />,
      colorTheme: "teal",
      status: tds <= 1000 ? "Aman" : "Garam Tinggi",
      statusType: tds <= 1000 ? "ok" : "warning",
      percent: Math.min(100, Math.max(0, (tds / 1200) * 100)),
      farmerAdvice:
        tds > 1000
          ? "Kadar garam terlarut tinggi. Lakukan pencucian (flushing) dengan air irigasi mengalir."
          : "Tidak ada ancaman salinitas/keracunan garam tanah. Lingkungan aman untuk bibit padi.",
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
            Detail 8 Parameter Sensor Tanah ({plotName})
          </h3>
          <p className="text-xs text-slate-500">
            Nilai telemetri sensor real-time dilengkapi ambang batas ideal dan petunjuk tindakan petani
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {parameters.map((param) => {
          const badgeColor =
            param.statusType === "danger"
              ? "bg-rose-50 text-rose-700 border-rose-200"
              : param.statusType === "warning"
              ? "bg-amber-50 text-amber-700 border-amber-200"
              : "bg-emerald-50 text-emerald-700 border-emerald-200";

          const dotColor =
            param.statusType === "danger"
              ? "bg-rose-500"
              : param.statusType === "warning"
              ? "bg-amber-500"
              : "bg-emerald-500";

          const barColor =
            param.statusType === "danger"
              ? "bg-rose-500"
              : param.statusType === "warning"
              ? "bg-amber-500"
              : "bg-emerald-500";

          return (
            <div
              key={param.id}
              className="bg-white rounded-2xl p-4 sm:p-4.5 border border-slate-200/90 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header Card */}
                <div className="flex items-start justify-between gap-2 mb-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
                      {param.icon}
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 leading-tight">
                        {param.title}
                      </h4>
                      <p className="text-[10px] text-slate-500">{param.subtitle}</p>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border flex items-center gap-1 shrink-0 ${badgeColor}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
                    {param.status}
                  </span>
                </div>

                {/* Big Number & Ideal Range */}
                <div className="my-2.5 flex items-baseline justify-between">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                      {param.value}
                    </span>
                    <span className="text-xs font-bold text-slate-500">{param.unit}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-slate-500 block uppercase">
                      Batas Ideal
                    </span>
                    <span className="text-xs font-extrabold text-slate-700">
                      {param.ideal}
                    </span>
                  </div>
                </div>

                {/* Progress Mini Bar */}
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden my-2">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                    style={{ width: `${param.percent}%` }}
                  />
                </div>
              </div>

              {/* Farmer Advice Box */}
              <div className="mt-3 pt-2.5 border-t border-slate-100 bg-slate-50/70 -mx-4 -mb-4 p-3 rounded-b-2xl">
                <div className="flex items-start gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                    <strong className="text-slate-800">Panduan Petani:</strong> {param.farmerAdvice}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

