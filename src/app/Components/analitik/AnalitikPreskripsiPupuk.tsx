"use client";

import React from "react";
import { Sparkles, CheckCircle2, AlertTriangle, ArrowRight, Sprout, ShieldAlert } from "lucide-react";

interface PreskripsiProps {
  plotName: string;
  nitrogen: number;
  fosfor: number;
  kalium: number;
  ph: number;
}

export default function AnalitikPreskripsiPupuk({
  plotName,
  nitrogen,
  fosfor,
  kalium,
  ph,
}: PreskripsiProps) {
  // Preskripsi Berdasarkan Kebutuhan Riil Padi Sawah
  const prescriptions = [
    {
      name: "Pupuk Urea (Sumber N)",
      target: "Pertumbuhan Daun & Anakan Baru",
      condition:
        nitrogen < 90
          ? "Defisit Nitrogen"
          : nitrogen > 190
          ? "Kelebihan Nitrogen"
          : "Kadar Cukup / Optimal",
      dosagePerHa:
        nitrogen < 90
          ? "75 - 100 kg / ha"
          : nitrogen > 190
          ? "0 kg (Tunda Urea)"
          : "40 - 50 kg / ha (Susulan)",
      dosagePerPlot:
        nitrogen < 90
          ? "± 6 - 8 kg / petak"
          : nitrogen > 190
          ? "Tidak Perlu Pupuk"
          : "± 3 - 4 kg / petak",
      status:
        nitrogen < 90
          ? "Aplikasi Segera"
          : nitrogen > 190
          ? "Tunda Aplikasi"
          : "Dosis Standar",
      statusType: nitrogen < 90 ? "warning" : nitrogen > 190 ? "alert" : "ok",
      instruction:
        nitrogen < 90
          ? "Segera pupuk susulan agar anakan padi tidak kerdil. Tabur merata saat tanah macak-macak."
          : nitrogen > 190
          ? "Stop pupuk Urea dahulu. Kelebihan N membuat batang lemah dan mudah diserang sundep/wereng."
          : "Pertahankan dosis seimbang pada pemupukan susulan I (14 HST) dan susulan II (28 HST).",
    },
    {
      name: "Pupuk SP-36 / TSP (Sumber P)",
      target: "Penguatan Akar & Batang Kokoh",
      condition: fosfor < 100 ? "Defisit Fosfor" : "Kandungan P Tinggi",
      dosagePerHa: fosfor < 100 ? "50 - 75 kg / ha" : "0 - 25 kg / ha",
      dosagePerPlot: fosfor < 100 ? "± 4 - 6 kg / petak" : "Tidak Perlu Tambahan",
      status: fosfor < 100 ? "Aplikasi Susulan" : "Hemat Pupuk",
      statusType: fosfor < 100 ? "warning" : "ok",
      instruction:
        fosfor < 100
          ? "Aplikasi bersama pupuk dasar agar perakaran mencengkeram tanah lebih dalam."
          : "Cadangan fosfor dalam tanah sudah sangat kaya. Petani bisa menghemat pengeluaran pupuk SP-36 musim ini.",
    },
    {
      name: "Pupuk KCl (Sumber K)",
      target: "Ketahanan Hama & Pengisian Bulir Bernas",
      condition: kalium < 120 ? "Defisit Kalium" : "Kalium Cukup",
      dosagePerHa: kalium < 120 ? "50 - 75 kg / ha" : "30 - 40 kg / ha",
      dosagePerPlot: kalium < 120 ? "± 4 - 6 kg / petak" : "± 2 - 3 kg / petak",
      status: kalium < 120 ? "Perlu Ditambah" : "Dosis Pemeliharaan",
      statusType: kalium < 120 ? "warning" : "ok",
      instruction:
        kalium < 120
          ? "Aplikasi pupuk KCl sangat penting sebelum bunting/fase primordia agar gabah tidak kopong."
          : "Kadar Kalium bagus. Bulir padi akan terisi padat dan bobot panen gabah meningkat.",
    },
    {
      name: "Kapur Pertanian / Dolomit",
      target: "Penetral Masam Tanah & Kalsium/Magnesium",
      condition: ph < 5.5 ? "Tanah Sangat Masam" : ph < 6.0 ? "Agak Masam" : "pH Netral Sehat",
      dosagePerHa: ph < 5.5 ? "200 - 300 kg / ha" : ph < 6.0 ? "100 kg / ha" : "0 kg (Tidak Perlu)",
      dosagePerPlot: ph < 5.5 ? "± 15 - 25 kg / petak" : ph < 6.0 ? "± 8 kg / petak" : "0 kg / petak",
      status: ph < 6.0 ? "Perlu Pengapuran" : "Kondisi Netral",
      statusType: ph < 5.5 ? "alert" : ph < 6.0 ? "warning" : "ok",
      instruction:
        ph < 6.0
          ? "Kapur dolomit menetralkan asam sehingga pupuk kimia tidak terbuang sia-sia diserap tanah masam."
          : "Kondisi keasaman tanah sangat netral dan ramah akar. Tidak perlu membeli kapur dolomit.",
    },
  ];

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-4 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200/70 flex items-center justify-center text-emerald-600">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
              Preskripsi Cerdas Pemupukan Petani ({plotName})
            </h3>
            <p className="text-xs text-slate-500">
              Panduan dosis riil pupuk komersil per petak (850 m²) dan per hektar sesuai angka sensor tanah
            </p>
          </div>
        </div>

        <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 self-start sm:self-auto">
          Rekomendasi Hemat Biaya
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {prescriptions.map((item, idx) => {
          const badgeClass =
            item.statusType === "alert"
              ? "bg-rose-50 text-rose-700 border-rose-200"
              : item.statusType === "warning"
              ? "bg-amber-50 text-amber-700 border-amber-200"
              : "bg-emerald-50 text-emerald-700 border-emerald-200";

          return (
            <div
              key={idx}
              className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:border-emerald-300 hover:shadow-xs transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h4 className="text-xs sm:text-sm font-black text-slate-900">
                      {item.name}
                    </h4>
                    <p className="text-[11px] text-slate-500">{item.target}</p>
                  </div>
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${badgeClass}`}>
                    {item.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 my-2.5 py-2 px-2.5 rounded-lg bg-white border border-slate-200/60">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">
                      Dosis Petak (850 m²)
                    </span>
                    <span className="text-xs font-black text-emerald-700">
                      {item.dosagePerPlot}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">
                      Dosis per Hektar
                    </span>
                    <span className="text-xs font-black text-slate-800">
                      {item.dosagePerHa}
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-slate-600 mt-1 font-medium leading-relaxed">
                👉 {item.instruction}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

