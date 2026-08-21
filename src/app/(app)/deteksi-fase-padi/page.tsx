"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Upload,
  RefreshCw,
  Leaf,
  Sprout,
  Flower2,
  Wheat,
  Thermometer,
  Droplets,
  Shield,
  AlertTriangle,
  CheckCircle,
  Camera,
  Sparkles,
  Info,
} from "lucide-react";

/* ================= TYPES ================= */
type FaseKey = "fase_v1" | "fase_v2" | "fase_g1" | "fase_g2";

type ResultType = {
  fase?: FaseKey;
  error?: string;
};

/* ================= REKOMENDASI ================= */
const rekomendasiPemupukan: Record<FaseKey, string> = {
  fase_v1:
    "Gunakan pupuk NPK seimbang dengan komposisi 15:15:15 untuk mendukung pertumbuhan perakaran primer dan pembentukan anakan awal.",
  fase_v2:
    "Tingkatkan pupuk Nitrogen (Urea) untuk memacu pertumbuhan vegetatif maksimal dan memperbanyak anakan produktif.",
  fase_g1:
    "Fokus pada pupuk Kalium (KCl) dan Fosfor (SP-36) guna memperkokoh malai, memperbanyak bulir, dan ketahanan rebah.",
  fase_g2:
    "Hentikan pemupukan kimia, jaga kecukupan air sawah macak-macak menjelang pengeringan lahan sebelum panen.",
};

const rekomendasiHama: Record<FaseKey, string> = {
  fase_v1:
    "Waspadai keong mas dan wereng coklat pada masa anakan awal. Pasang saringan pada saluran masuk air irigasi.",
  fase_v2:
    "Monitoring rutin serangan penggerek batang (sundep) dan ulat grayak. Lakukan pengendalian hayati atau insektisida selektif.",
  fase_g1:
    "Pengendalian intensif terhadap hama walang sangit saat padi mulai berbunga. Gunakan perangkap aroma / feromon.",
  fase_g2:
    "Lindungi malai dari serangan burung pipit dan hama tikus sawah. Pasang jaring pelindung atau perangkap umpan.",
};

/* ================= DATA FASE ================= */
const faseCards = [
  {
    key: "fase_v1",
    title: "Fase Vegetatif Awal",
    subtitle: "V1 (0–35 HST)",
    desc: "Pertumbuhan perakaran dan daun awal",
    icon: <Sprout className="w-5 h-5" />,
    badgeBg: "bg-sage-100 text-forest-800 border-sage-300",
    img: "/assets/img/deteksi-fase/v1.jpg",
  },
  {
    key: "fase_v2",
    title: "Fase Vegetatif Akhir",
    subtitle: "V2 (35–55 HST)",
    desc: "Pembentukan anakan dan perpanjangan batang",
    icon: <Leaf className="w-5 h-5" />,
    badgeBg: "bg-forest-100 text-forest-900 border-forest-300",
    img: "/assets/img/deteksi-fase/v2.jpg",
  },
  {
    key: "fase_g1",
    title: "Fase Reproduktif",
    subtitle: "G1 (55–85 HST)",
    desc: "Inisiasi malai, bunting, dan berbunga",
    icon: <Flower2 className="w-5 h-5" />,
    badgeBg: "bg-wheat-100 text-wheat-900 border-wheat-300",
    img: "/assets/img/deteksi-fase/g1.jpg",
  },
  {
    key: "fase_g2",
    title: "Fase Pematangan",
    subtitle: "G2 (85+ HST)",
    desc: "Pengisian bulir, menguning, siap panen",
    icon: <Wheat className="w-5 h-5" />,
    badgeBg: "bg-clay-100 text-clay-900 border-clay-300",
    img: "/assets/img/deteksi-fase/g2.jpg",
  },
];

/* ================= COMPONENT ================= */
export default function DeteksiFasePage() {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<ResultType | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeFase, setActiveFase] = useState<FaseKey | null>(null);
  const API_DETEKSI_FASE =
    process.env.NEXT_PUBLIC_API_BE_DETEKSI_FASE ||
    process.env.API_BE_DETEKSI_FASE ||
    "http://127.0.0.1:8080";


  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
    setResult(null);
  };

  const handleUpload = async () => {
    if (!image) return;
    setLoading(true);

    const formData = new FormData();
    formData.append("file", image);

    try {
      const res = await fetch(`${API_DETEKSI_FASE}/deteksi-fase/`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setResult(data);
      if (data.fase) setActiveFase(data.fase);
    } catch {
      setResult({
        error: "Gagal terhubung ke layanan AI deteksi fase. Pastikan backend deteksi fase aktif.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setImage(null);
    setPreview(null);
    setResult(null);
    setActiveFase(null);
  };

  const getFaseLabel = (fase?: FaseKey) =>
    faseCards.find((f) => f.key === fase)?.title || "-";

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-bone-300/80 rounded-2xl p-4 sm:p-6 shadow-soft flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-extrabold text-forest-900 tracking-tight">
              Deteksi Fase Pertumbuhan Padi
            </h2>
          </div>
          <p className="text-sm text-sage-700 mt-0.5">
            Analisis citra agronomik berbasis Computer Vision untuk rekomendasi perawatan presisi
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-sage-100 border border-sage-200 text-xs font-semibold text-forest-800">
          <Sparkles className="w-3.5 h-3.5 text-sage-600" />
          <span>Vision AI Aktif</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ================= FASE REFERENCE LIST ================= */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-bone-300 rounded-2xl shadow-soft p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-bone-200">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-sage-50 border border-sage-100 flex items-center justify-center text-sage-600">
                  <Leaf className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-forest-900 text-base">Katalog Fase Pertumbuhan</h3>
                  <p className="text-xs text-sage-700">4 tahapan utama siklus hidup tanaman padi</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {faseCards.map((fase) => {
                const isSelected = activeFase === fase.key;
                return (
                  <div
                    key={fase.key}
                    onClick={() => setActiveFase(fase.key as FaseKey)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer relative overflow-hidden ${
                      isSelected
                        ? "bg-forest-900 text-bone-50 border-forest-800 shadow-md"
                        : "bg-bone-50/70 border-bone-200 hover:border-sage-400 hover:bg-white text-forest-900"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`p-2 rounded-lg flex-shrink-0 ${
                          isSelected
                            ? "bg-sage-600/30 text-wheat-300 border border-sage-500/30"
                            : "bg-white text-forest-700 border border-bone-300"
                        }`}
                      >
                        {fase.icon}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className={`font-bold text-sm truncate ${isSelected ? "text-white" : "text-forest-900"}`}>
                            {fase.title}
                          </h4>
                          <span
                            className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                              isSelected
                                ? "bg-forest-800 text-wheat-300 border-forest-700"
                                : fase.badgeBg
                            }`}
                          >
                            {fase.subtitle}
                          </span>
                        </div>
                        <p className={`text-xs mt-1 leading-relaxed ${isSelected ? "text-sage-300" : "text-sage-700"}`}>
                          {fase.desc}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Guideline Card */}
          <div className="bg-bone-50 border border-bone-300/80 rounded-2xl p-4 sm:p-5 shadow-soft">
            <div className="flex items-center gap-2 mb-3">
              <Info className="w-4 h-4 text-forest-700" />
              <h4 className="font-bold text-xs sm:text-sm text-forest-900 uppercase tracking-wide">
                Pedoman Pengambilan Gambar
              </h4>
            </div>
            <ul className="space-y-2 text-xs text-sage-800 font-medium">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-sage-600 mt-0.5 flex-shrink-0" />
                <span>Ambil foto tegak lurus dari atas kanopi tanaman padi.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-sage-600 mt-0.5 flex-shrink-0" />
                <span>Gunakan pencahayaan alami cukup (pukul 08.00 - 15.00).</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-sage-600 mt-0.5 flex-shrink-0" />
                <span>Pastikan gambar tajam dan tidak kabur (*blurry*).</span>
              </li>
            </ul>
          </div>
        </div>

        {/* ================= UPLOAD & PREVIEW & RESULTS ================= */}
        <div className="lg:col-span-7 space-y-6">
          {/* Upload Card */}
          <div className="bg-white border border-bone-300 rounded-2xl shadow-soft p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-bone-200">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-forest-800" />
                <h3 className="font-bold text-forest-900 text-base">Unggah Citra Tanaman</h3>
              </div>
              <span className="text-xs text-sage-700 font-medium">Format: JPG, PNG</span>
            </div>

            {/* Image Preview Box */}
            <div
              className={`relative w-full h-72 sm:h-80 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-all overflow-hidden ${
                preview
                  ? "border-bone-300 bg-bone-50"
                  : "border-bone-300 hover:border-sage-500 hover:bg-bone-50/50"
              }`}
            >
              {preview ? (
                <div className="relative w-full h-full p-2">
                  <img
                    src={preview}
                    alt="Preview Lahan"
                    className="w-full h-full object-contain rounded-xl"
                  />
                  <div className="absolute top-4 right-4">
                    <span className="px-3 py-1 bg-forest-900/90 backdrop-blur-sm text-wheat-300 text-xs font-semibold rounded-full shadow-sm">
                      Citra Siap Dianalisis
                    </span>
                  </div>
                </div>
              ) : (
                <label className="cursor-pointer flex flex-col items-center justify-center p-6 text-center w-full h-full">
                  <div className="w-14 h-14 bg-bone-100 rounded-2xl border border-bone-200 flex items-center justify-center mb-3 text-forest-800">
                    <Upload className="w-7 h-7" />
                  </div>
                  <span className="text-sm font-bold text-forest-900 mb-1">
                    Pilih File Foto Tanaman
                  </span>
                  <p className="text-xs text-sage-700 max-w-xs mb-4">
                    Tarik file ke sini atau klik untuk membuka galeri foto lahan
                  </p>
                  <div className="px-4 py-2 bg-forest-900 hover:bg-forest-800 text-wheat-300 text-xs font-bold rounded-xl shadow-sm transition-colors">
                    Jelajahi File
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mt-4">
              <button
                onClick={handleUpload}
                disabled={!image || loading || !!result?.fase}
                className={`py-3 px-5 font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2 flex-1 shadow-sm ${
                  !image || loading || result?.fase
                    ? "bg-bone-200 text-bone-400 cursor-not-allowed"
                    : "bg-forest-900 hover:bg-forest-800 text-wheat-300 active:scale-[0.99]"
                }`}
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-wheat-300" />
                    <span>Sedang Menganalisis Citra...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>Jalankan Analisis AI</span>
                  </>
                )}
              </button>

              {preview && (
                <button
                  onClick={handleReset}
                  className="py-3 px-4 bg-white border border-bone-300 text-forest-800 text-sm font-semibold rounded-xl hover:bg-bone-50 transition-all flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4 text-sage-600" />
                  <span>Ganti Foto</span>
                </button>
              )}
            </div>

            {/* Error Message */}
            {result?.error && (
              <div className="mt-4 p-4 bg-clay-50 border border-clay-200 text-clay-900 rounded-xl text-xs font-semibold flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-clay-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h5 className="font-bold">Gagal Menganalisis</h5>
                  <p className="mt-0.5 font-normal">{result.error}</p>
                </div>
              </div>
            )}
          </div>

          {/* ================= RESULTS SECTION ================= */}
          {result?.fase && (
            <div className="bg-white border border-bone-300 rounded-2xl shadow-soft p-4 sm:p-6 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-bone-200">
                <div>
                  <h3 className="font-bold text-forest-900 text-base">Hasil Diagnosis AI</h3>
                  <p className="text-xs text-sage-700">Fase pertumbuhan tanaman teridentifikasi</p>
                </div>
                <span className="px-3.5 py-1.5 bg-forest-900 text-wheat-300 font-extrabold text-sm rounded-full border border-forest-800">
                  {getFaseLabel(result.fase)}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Fertilizer Recommendation */}
                <div className="bg-bone-50 border border-bone-300/80 rounded-xl p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2 text-forest-900">
                      <Sprout className="w-4 h-4 text-sage-600" />
                      <h4 className="font-bold text-xs uppercase tracking-wide">
                        Preskripsi Pemupukan
                      </h4>
                    </div>
                    <p className="text-xs text-forest-800 leading-relaxed font-medium">
                      {rekomendasiPemupukan[result.fase]}
                    </p>
                  </div>
                  <div className="mt-3 pt-2.5 border-t border-bone-200 text-[11px] text-sage-700 flex items-center gap-1">
                    <Thermometer className="w-3.5 h-3.5 text-sage-500" />
                    <span>Dosis disesuaikan dengan kondisi tanah</span>
                  </div>
                </div>

                {/* Pest Control Recommendation */}
                <div className="bg-bone-50 border border-bone-300/80 rounded-xl p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2 text-forest-900">
                      <Shield className="w-4 h-4 text-clay-600" />
                      <h4 className="font-bold text-xs uppercase tracking-wide">
                        Proteksi & Hama Kunci
                      </h4>
                    </div>
                    <p className="text-xs text-forest-800 leading-relaxed font-medium">
                      {rekomendasiHama[result.fase]}
                    </p>
                  </div>
                  <div className="mt-3 pt-2.5 border-t border-bone-200 text-[11px] text-sage-700 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-wheat-600" />
                    <span>Pantau berkala setiap 3 hari</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

