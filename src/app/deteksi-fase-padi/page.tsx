"use client";

import { useState } from "react";
import Image from "next/image";

/* ================= TYPES ================= */
type FaseKey = "fase_v1" | "fase_v2" | "fase_g1" | "fase_g2";

type ResultType = {
  fase?: FaseKey;
  error?: string;
};

/* ================= REKOMENDASI ================= */
const rekomendasiPemupukan: Record<FaseKey, string> = {
  fase_v1: "Gunakan pupuk NPK seimbang.",
  fase_v2: "Tambah pupuk nitrogen.",
  fase_g1: "Gunakan pupuk kalium.",
  fase_g2: "Kurangi pupuk, fokus pada air.",
};

const rekomendasiHama: Record<FaseKey, string> = {
  fase_v1: "Pantau wereng dan penggerek batang.",
  fase_v2: "Waspada ulat dan hama daun.",
  fase_g1: "Walang sangit saat malai terbentuk.",
  fase_g2: "Cegah serangan tikus dan burung.",
};

/* ================= DATA FASE ================= */
const faseCards = [
  {
    key: "fase_v1",
    title: "Fase Vegetatif Awal (V1)",
    desc: "Pertumbuhan daun dan akar cepat (0–35 HST)",
    img: "/assets/img/deteksi-fase/v1.jpg",
  },
  {
    key: "fase_v2",
    title: "Fase Vegetatif Akhir (V2)",
    desc: "Tunas dan daun bertambah (35–55 HST)",
    img: "/assets/img/deteksi-fase/v2.jpg",
  },
  {
    key: "fase_g1",
    title: "Fase Reproduktif (G1)",
    desc: "Malai mulai terbentuk (55–85 HST)",
    img: "/assets/img/deteksi-fase/g1.jpg",
  },
  {
    key: "fase_g2",
    title: "Fase Pematangan (G2)",
    desc: "Gabah menguning, siap panen (85+ HST)",
    img: "/assets/img/deteksi-fase/g2.jpg",
  },
];

/* ================= COMPONENT ================= */
export default function DeteksiFasePage() {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<ResultType | null>(null);
  const [loading, setLoading] = useState(false);

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
      const res = await fetch("http://127.0.0.1:8080/deteksi-fase/", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setResult(data);
    } catch {
      setResult({ error: "Gagal menghubungi server" });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setImage(null);
    setPreview(null);
    setResult(null);
  };

  const getFaseLabel = (fase?: FaseKey) =>
    faseCards.find((f) => f.key === fase)?.title || "-";

  /* ================= UI ================= */
  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* ================= FASE LIST ================= */}
        <div className="bg-white rounded-xl shadow-lg p-4 space-y-4 max-h-[85vh] overflow-y-auto">
          <h3 className="text-xl font-bold text-center">Fase Pertumbuhan</h3>

          {faseCards.map((fase) => (
            <div key={fase.key} className="rounded-lg overflow-hidden border">
              <div className="relative h-36">
                <Image
                  src={fase.img}
                  alt={fase.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-3 text-center">
                <h4 className="font-semibold text-sm">{fase.title}</h4>
                <p className="text-xs text-gray-600 mt-1">{fase.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ================= UPLOAD ================= */}
        <div className="bg-white rounded-xl shadow-lg p-6 xl:col-span-2 flex flex-col items-center">
          <h3 className="text-xl font-bold mb-4">Unggah Gambar Sawah</h3>

          <div className="w-full h-72 border-2 border-dashed rounded-lg flex items-center justify-center bg-gray-50">
            {preview ? (
              <img
                src={preview}
                className="max-h-full rounded-md object-contain"
              />
            ) : (
              <label className="cursor-pointer text-center">
                <div className="px-4 py-2 bg-primary text-white rounded-md font-semibold">
                  Pilih Gambar
                </div>
                <input
                  type="file"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <p className="text-sm text-gray-500 mt-2">
                  Upload gambar lahan padi
                </p>
              </label>
            )}
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={handleUpload}
              disabled={!image || loading || !!result}
              className={`px-6 py-2 rounded-md text-sm font-semibold ${
                !image || loading || result
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-primary text-white hover:bg-secondary"
              }`}
            >
              {loading ? "Memproses..." : "Kirim"}
            </button>

            {preview && (
              <button
                onClick={handleReset}
                className="px-6 py-2 rounded-md bg-red-500 text-white hover:bg-red-600 text-sm"
              >
                Ubah Gambar
              </button>
            )}
          </div>
        </div>

        {/* ================= RESULT ================= */}
        <div className="bg-white rounded-xl shadow-lg p-4 space-y-4">
          <h3 className="text-xl font-bold text-center">Hasil Deteksi</h3>

          <div className="bg-primary text-white text-center py-3 rounded-md font-bold">
            {result?.fase ? getFaseLabel(result.fase) : "-"}
          </div>

          <div className="border rounded-md p-3 text-sm">
            <h4 className="font-semibold mb-1">Rekomendasi Pemupukan</h4>
            {result?.fase ? rekomendasiPemupukan[result.fase] : "-"}
          </div>

          <div className="border rounded-md p-3 text-sm">
            <h4 className="font-semibold mb-1">Penanganan Hama</h4>
            {result?.fase ? rekomendasiHama[result.fase] : "-"}
          </div>

          {result?.error && (
            <p className="text-red-500 text-sm text-center">{result.error}</p>
          )}
        </div>
      </div>
    </div>
  );
}
