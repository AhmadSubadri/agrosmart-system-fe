'use client'
import { useState } from 'react'

// Tipe hasil deteksi dari API
type FaseKey = 'fase_v1' | 'fase_v2' | 'fase_g1' | 'fase_g2'

type ResultType = {
    fase?: FaseKey
    error?: string
}

// Mapping rekomendasi berdasarkan fase
const rekomendasiPemupukan: Record<FaseKey, string> = {
    fase_v1: 'Gunakan pupuk NPK seimbang.',
    fase_v2: 'Tambah pupuk nitrogen.',
    fase_g1: 'Gunakan pupuk kalium.',
    fase_g2: 'Kurangi pupuk, fokus pada air.',
}

const rekomendasiHama: Record<FaseKey, string> = {
    fase_v1: 'Pantau wereng dan penggerek batang.',
    fase_v2: 'Waspada ulat dan hama daun.',
    fase_g1: 'Walang sangit saat malai terbentuk.',
    fase_g2: 'Cegah serangan tikus dan burung.',
}

export default function Page() {
    const [image, setImage] = useState<File | null>(null)
    const [preview, setPreview] = useState<string | null>(null)
    const [result, setResult] = useState<ResultType | null>(null)
    const [loading, setLoading] = useState(false)

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        setImage(file)
        setPreview(URL.createObjectURL(file))
        setResult(null)
    }

    const handleUpload = async () => {
        if (!image) return
        setLoading(true)
        const formData = new FormData()
        formData.append('file', image)

        try {
            const res = await fetch('http://127.0.0.1:8080/deteksi-fase/', {
            method: 'POST',
            body: formData,
            })
            const data = await res.json()
            setResult(data)
        } catch (err) {
            setResult({ error: 'Gagal menghubungi server' })
        } finally {
            setLoading(false)
        }
    }

    const handleReset = () => {
        setImage(null)
        setPreview(null)
        setResult(null)
    }

    const getFaseLabel = (faseKey: FaseKey | undefined) => {
        switch (faseKey) {
            case 'fase_v1': return 'Fase Vegetatif Awal (V1)'
            case 'fase_v2': return 'Fase Vegetatif Akhir (V2)'
            case 'fase_g1': return 'Fase Reproduktif (G1)'
            case 'fase_g2': return 'Fase Pematangan (G2)'
            default: return '-'
    }
    }

    return (
  <div className="px-4 py-8 md:px-6 md:py-10 overflow-x-hidden">
    <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-4 min-h-screen">
      
      {/* Fase Pertumbuhan */}
      <div className="bg-abu p-4 md:p-6 rounded-xl overflow-y-scroll max-h-[90vh]">
        <h3 className="font-bold text-xl md:text-2xl text-black text-center mb-6">Fase Pertumbuhan</h3>
        
        {/* Card Fase */}
        {[1, 2, 3, 4].map((fase, i) => {
          const faseData = [
            {
              src: "v1.jpg",
              title: "Fase Vegetatif Awal (V1)",
              desc: "Tanaman mulai tumbuh daun dan akar dengan pesat (0-35 hari)"
            },
            {
              src: "v2.jpg",
              title: "Fase Vegetatif Akhir (V2)",
              desc: "Tunas baru dan daun bertambah (35-55 hari)"
            },
            {
              src: "g1.jpg",
              title: "Fase Reproduktif (G1)",
              desc: "Malai mulai terbentuk, penting menuju pembungaan (55-58 hari)"
            },
            {
              src: "g2.jpg",
              title: "Fase Pematangan (G2)",
              desc: "Gabah menguning, persiapan panen (85+ hari)"
            }
          ][i];

          return (
            <div key={i} className="bg-white rounded-md overflow-hidden mb-4 shadow-sm">
              <div className="overflow-hidden w-full mb-4">
                <img
                  src={`assets/img/deteksi-fase/${faseData.src}`}
                  alt={faseData.title}
                  className="object-cover object-center w-full h-40"
                />
              </div>
              <div className="text-center px-4 pb-4">
                <h3 className="font-bold text-base mb-2">{faseData.title}</h3>
                <span className="text-sm">{faseData.desc}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Form Upload */}
      <div className="bg-abu p-4 md:p-6 rounded-xl col-span-1 md:col-span-2 flex flex-col items-center">
        <h3 className="font-bold text-xl md:text-2xl text-black text-center mb-6">🌾 Unggah Gambar 🌾</h3>

        <div className="bg-white w-full border-2 border-dashed border-gray-400 rounded-lg p-6 flex flex-col items-center justify-center text-center h-72 md:h-80">
          {preview ? (
            <img src={preview} className="max-h-full object-cover rounded-lg" />
          ) : (
            <>
              <label htmlFor="upload" className="cursor-pointer">
                <div className="bg-primary text-white px-4 py-2 rounded-md shadow-md font-semibold flex items-center gap-2 hover:bg-secondary transition">
                  <span>📷</span> Pilih Gambar
                </div>
                <input id="upload" type="file" onChange={handleImageChange} className="hidden" />
              </label>
              <p className="mt-4 text-gray-500 text-sm w-4/5 md:w-3/4">
                Unggah gambar sawah untuk dideteksi fase pertumbuhannya 🌱
              </p>
            </>
          )}
        </div>

        <div className="flex flex-col md:flex-row justify-center gap-3 mt-6 w-full md:w-auto">
          <button
            onClick={handleUpload}
            disabled={!image || loading || result !== null}
            className={`px-6 py-2 rounded-md text-white font-semibold text-sm ${
              !image || loading || result !== null
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-primary hover:bg-secondary'
            }`}
          >
            {loading ? 'Mengirim...' : 'Kirim'}
          </button>

          {preview && (
            <button
              onClick={handleReset}
              className="px-6 py-2 rounded-md bg-red-500 text-white hover:bg-red-600 text-sm"
            >
              Ganti
            </button>
          )}
        </div>
      </div>

      {/* Hasil Deteksi */}
      <div className="bg-abu p-4 md:p-6 rounded-xl flex flex-col gap-4">
        <h3 className="font-bold text-xl md:text-2xl text-black text-center">Hasil Deteksi</h3>
        <div className="p-4 rounded-md text-center bg-primary text-white font-bold text-lg md:text-xl">
          {result?.fase ? getFaseLabel(result.fase) : '-'}
        </div>

        <h3 className="font-bold text-xl md:text-2xl text-black text-center mt-2">Rekomendasi</h3>

        <div className="bg-white rounded-md p-4 text-center text-sm md:text-base">
          <h3 className="font-bold mb-1">Pemupukan:</h3>
          <span>{result?.fase ? rekomendasiPemupukan[result.fase] : '-'}</span>
        </div>

        <div className="bg-white rounded-md p-4 text-center text-sm md:text-base">
          <h3 className="font-bold mb-1">Penanganan Hama:</h3>
          <span>{result?.fase ? rekomendasiHama[result.fase] : '-'}</span>
        </div>

        {result?.error && (
          <p className="text-red-500 text-center text-sm mt-2">{result.error}</p>
        )}
      </div>
    </div>
  </div>
);
}
