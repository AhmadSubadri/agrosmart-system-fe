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
  Zap,
  Camera,
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
    "Gunakan pupuk NPK seimbang dengan komposisi 15:15:15 untuk mendukung pertumbuhan akar dan daun awal.",
  fase_v2:
    "Tingkatkan pupuk nitrogen untuk mendukung pertumbuhan vegetatif maksimal dan pembentukan anakan.",
  fase_g1:
    "Fokus pada pupuk kalium dan fosfor untuk memperkuat malai dan meningkatkan ketahanan tanaman.",
  fase_g2:
    "Kurangi pemupukan, fokus pada pengelolaan air dan pengendalian hama menjelang panen.",
};

const rekomendasiHama: Record<FaseKey, string> = {
  fase_v1:
    "Pantau serangan wereng, penggerek batang, dan keong mas. Gunakan pestisida selektif jika diperlukan.",
  fase_v2:
    "Waspada ulat grayak, belalang, dan hama daun. Lakukan monitoring rutin setiap 3 hari.",
  fase_g1:
    "Perhatikan walang sangit saat malai terbentuk. Gunakan perangkap feromon untuk pengendalian.",
  fase_g2:
    "Cegah serangan tikus, burung, dan penggerek batang padi. Pasang perangkap dan jaring pelindung.",
};

/* ================= DATA FASE ================= */
const faseCards = [
  {
    key: "fase_v1",
    title: "Fase Vegetatif Awal",
    subtitle: "V1 (0–35 HST)",
    desc: "Pertumbuhan daun dan akar cepat",
    icon: <Sprout className="w-6 h-6" />,
    color: "from-green-500 to-emerald-600",
    img: "/assets/img/deteksi-fase/v1.jpg",
  },
  {
    key: "fase_v2",
    title: "Fase Vegetatif Akhir",
    subtitle: "V2 (35–55 HST)",
    desc: "Tunas dan daun bertambah optimal",
    icon: <Leaf className="w-6 h-6" />,
    color: "from-emerald-500 to-green-600",
    img: "/assets/img/deteksi-fase/v2.jpg",
  },
  {
    key: "fase_g1",
    title: "Fase Reproduktif",
    subtitle: "G1 (55–85 HST)",
    desc: "Malai mulai terbentuk dan berkembang",
    icon: <Flower2 className="w-6 h-6" />,
    color: "from-amber-500 to-yellow-600",
    img: "/assets/img/deteksi-fase/g1.jpg",
  },
  {
    key: "fase_g2",
    title: "Fase Pematangan",
    subtitle: "G2 (85+ HST)",
    desc: "Gabah menguning dan siap panen",
    icon: <Wheat className="w-6 h-6" />,
    color: "from-orange-500 to-amber-600",
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
  const API_DETEKSI_FASE = process.env.API_BE_DETEKSI_FASE;

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
        error: "Gagal menghubungi server. Pastikan server deteksi berjalan.",
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Deteksi Fase Padi</h1>
        <p className="text-gray-600 mt-1">
          Analisis otomatis fase pertumbuhan padi menggunakan teknologi computer
          vision
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ================= FASE LIST ================= */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Leaf className="w-5 h-5 text-green-600" />
              Fase Pertumbuhan Padi
            </h2>

            <div className="space-y-4">
              {faseCards.map((fase) => (
                <div
                  key={fase.key}
                  className={`p-4 rounded-xl border transition-all cursor-pointer group ${
                    activeFase === fase.key
                      ? `border-transparent bg-gradient-to-r ${fase.color} text-white shadow-lg`
                      : "border-gray-200 hover:border-gray-300 hover:shadow-md"
                  }`}
                  onClick={() => setActiveFase(fase.key as FaseKey)}
                >
                  <div className="flex items-start gap-3">
                    {/* Icon Container */}
                    <div
                      className={`p-2 rounded-lg flex-shrink-0 ${
                        activeFase === fase.key ? "bg-white/20" : "bg-gray-100"
                      }`}
                    >
                      {fase.icon}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3
                          className={`font-semibold ${
                            activeFase === fase.key
                              ? "text-white"
                              : "text-gray-900"
                          }`}
                        >
                          {fase.title}
                        </h3>
                        <span
                          className={`text-sm ${
                            activeFase === fase.key
                              ? "text-white/90"
                              : "text-gray-500"
                          }`}
                        >
                          {fase.subtitle}
                        </span>
                      </div>
                      <p
                        className={`text-sm mt-1 ${
                          activeFase === fase.key
                            ? "text-white/80"
                            : "text-gray-600"
                        }`}
                      >
                        {fase.desc}
                      </p>

                      {/* Image Preview - Hover Effect */}
                      <div className="mt-3 relative">
                        <div
                          className={`overflow-hidden rounded-lg transition-all duration-300 ${
                            activeFase === fase.key
                              ? "max-h-32 opacity-100"
                              : "max-h-0 opacity-0 group-hover:max-h-32 group-hover:opacity-100"
                          }`}
                        >
                          <div className="relative h-32 w-full">
                            <Image
                              src={fase.img}
                              alt={fase.title}
                              fill
                              className="object-cover rounded-lg"
                              sizes="(max-width: 768px) 100vw, 50vw"
                            />
                            {/* Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-lg"></div>

                            {/* Image Info */}
                            <div className="absolute bottom-2 left-2 right-2">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-medium text-white bg-black/40 backdrop-blur-sm px-2 py-1 rounded-full">
                                  Contoh Fase
                                </span>
                                <span className="text-xs text-white/80 bg-black/30 px-2 py-1 rounded-full">
                                  Klik untuk detail
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Preview Indicator */}
                          <div className="absolute -top-2 right-2">
                            <div className="px-2 py-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-xs font-medium rounded-full shadow-lg">
                              Preview
                            </div>
                          </div>
                        </div>

                        {/* Hover Instruction */}
                        {activeFase !== fase.key && (
                          <div className="mt-2 flex items-center gap-2 text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Camera className="w-3 h-3" />
                            <span>
                              Hover untuk preview gambar • Klik untuk pilih fase
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Active State Indicator */}
                    {activeFase === fase.key && (
                      <div className="absolute -top-2 -right-2">
                        <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
                          <CheckCircle className="w-3 h-3 text-white" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Info Card */}
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-100">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Zap className="w-5 h-5 text-blue-600" />
              Tips Pengambilan Gambar
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Ambil foto dari atas dengan pencahayaan cukup</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Pastikan fokus pada tanaman padi secara jelas</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Hindari gambar blur atau terlalu gelap</span>
              </li>
            </ul>
          </div>
        </div>

        {/* ================= UPLOAD & PREVIEW ================= */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upload Card */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Camera className="w-5 h-5 text-blue-600" />
                Analisis Gambar Sawah
              </h2>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Upload className="w-4 h-4" />
                <span>Unggah gambar JPG/PNG</span>
              </div>
            </div>

            {/* Image Preview Area */}
            <div
              className={`relative w-full h-96 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-all ${
                preview
                  ? "border-gray-300 bg-gray-50"
                  : "border-gray-300 hover:border-blue-400 hover:bg-blue-50/30"
              }`}
            >
              {preview ? (
                <div className="relative w-full h-full p-4">
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full h-full object-contain rounded-xl"
                  />
                  <div className="absolute top-4 right-4">
                    <span className="px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded-full">
                      Gambar Terpilih
                    </span>
                  </div>
                </div>
              ) : (
                <label className="cursor-pointer flex flex-col items-center justify-center p-8 text-center">
                  <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mb-4">
                    <Upload className="w-10 h-10 text-blue-600" />
                  </div>
                  <span className="text-lg font-medium text-gray-700 mb-2">
                    Pilih Gambar Lahan
                  </span>
                  <p className="text-gray-500 text-sm mb-4 max-w-sm">
                    Unggah foto lahan padi untuk analisis fase pertumbuhan
                    otomatis
                  </p>
                  <div className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all">
                    Pilih File
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
            <div className="flex flex-col sm:flex-row gap-4 mt-6">
              <button
                onClick={handleUpload}
                disabled={!image || loading || !!result?.fase}
                className={`px-6 py-3.5 font-medium rounded-xl transition-all flex items-center justify-center gap-2 flex-1 ${
                  !image || loading || result?.fase
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl"
                }`}
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Menganalisis...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    <span>Analisis Gambar</span>
                  </>
                )}
              </button>

              {preview && (
                <button
                  onClick={handleReset}
                  className="px-6 py-3.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-5 h-5" />
                  <span>Ganti Gambar</span>
                </button>
              )}
            </div>

            {result?.error && (
              <div className="mt-4 p-4 bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-red-800">Error Deteksi</h4>
                    <p className="text-red-700 text-sm mt-1">{result.error}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ================= RESULTS ================= */}
          {result?.fase && (
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  Hasil Deteksi
                </h2>
                <div className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium rounded-full">
                  {getFaseLabel(result.fase)}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Pemupukan Card */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-5 rounded-xl border border-green-100">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Sprout className="w-5 h-5 text-green-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900">
                      Rekomendasi Pemupukan
                    </h3>
                  </div>
                  <p className="text-gray-700 leading-relaxed">
                    {rekomendasiPemupukan[result.fase]}
                  </p>
                  <div className="mt-4 pt-4 border-t border-green-200">
                    <div className="flex items-center gap-2 text-sm text-green-700">
                      <Thermometer className="w-4 h-4" />
                      <span>Optimalkan sesuai fase pertumbuhan</span>
                    </div>
                  </div>
                </div>

                {/* Hama Card */}
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-5 rounded-xl border border-amber-100">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-amber-100 rounded-lg">
                      <Shield className="w-5 h-5 text-amber-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900">
                      Penanganan Hama
                    </h3>
                  </div>
                  <p className="text-gray-700 leading-relaxed">
                    {rekomendasiHama[result.fase]}
                  </p>
                  <div className="mt-4 pt-4 border-t border-amber-200">
                    <div className="flex items-center gap-2 text-sm text-amber-700">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Lakukan monitoring rutin</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="font-medium text-gray-900 mb-3">
                  Tindakan Tambahan
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <Droplets className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-gray-700">
                      Kelola irigasi sesuai fase
                    </span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                    <Leaf className="w-4 h-4 text-purple-600" />
                    <span className="text-sm text-gray-700">
                      Pantau kondisi daun secara rutin
                    </span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-cyan-50 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-cyan-600" />
                    <span className="text-sm text-gray-700">
                      Catat perkembangan harian
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Empty Result State */}
          {!result?.fase && (
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Camera className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Belum Ada Hasil Analisis
              </h3>
              <p className="text-gray-600 max-w-md mx-auto">
                Upload gambar lahan padi untuk mendapatkan analisis fase
                pertumbuhan dan rekomendasi perawatan
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-xl border border-blue-100">
          <div className="flex items-center gap-3 mb-3">
            <Zap className="w-5 h-5 text-blue-600" />
            <h4 className="font-semibold text-gray-900">AI Powered</h4>
          </div>
          <p className="text-sm text-gray-600">
            Menggunakan teknologi computer vision untuk deteksi akurat fase
            pertumbuhan
          </p>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-100">
          <div className="flex items-center gap-3 mb-3">
            <Leaf className="w-5 h-5 text-green-600" />
            <h4 className="font-semibold text-gray-900">Rekomendasi Tepat</h4>
          </div>
          <p className="text-sm text-gray-600">
            Dapatkan panduan pemupukan dan penanganan hama yang sesuai dengan
            fase tanaman
          </p>
        </div>

        <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-xl border border-amber-100">
          <div className="flex items-center gap-3 mb-3">
            <CheckCircle className="w-5 h-5 text-amber-600" />
            <h4 className="font-semibold text-gray-900">Real-time Analysis</h4>
          </div>
          <p className="text-sm text-gray-600">
            Hasil deteksi langsung dengan rekomendasi yang dapat segera
            diterapkan
          </p>
        </div>
      </div>
    </div>
  );
}
