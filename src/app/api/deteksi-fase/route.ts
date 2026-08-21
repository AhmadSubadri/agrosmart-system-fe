import { NextRequest, NextResponse } from "next/server";

function normalizeFase(
  faseStr: string
): "fase_v1" | "fase_v2" | "fase_g1" | "fase_g2" | null {
  const f = (faseStr || "").toLowerCase().trim();
  if (f.includes("v1") || f.includes("vegetatif awal")) return "fase_v1";
  if (f.includes("v2") || f.includes("vegetatif akhir")) return "fase_v2";
  if (
    f.includes("g1") ||
    f.includes("reproduktif") ||
    f.includes("bunting") ||
    f.includes("berbunga")
  )
    return "fase_g1";
  if (
    f.includes("g2") ||
    f.includes("pematangan") ||
    f.includes("panen") ||
    f.includes("matang") ||
    f.includes("menguning")
  )
    return "fase_g2";
  return null;
}

const defaultCiriVisual: Record<"fase_v1" | "fase_v2" | "fase_g1" | "fase_g2", string> = {
  fase_v1:
    "Tanaman padi muda dengan daun hijau cerah, anakan awal mulai tumbuh, kanopi belum menutupi seluruh permukaan lahan sawah.",
  fase_v2:
    "Rumpun tanaman padi tumbuh lebat dengan anakan produktif maksimum, daun hijau segar dan kanopi menutup rapat.",
  fase_g1:
    "Batang padi tampak menggembung (bunting), inisiasi malai mulai muncul, bulir muda hijau keputihan dan mulai berbunga.",
  fase_g2:
    "Malai padi merunduk dengan bulir matang menguning keemasan, daun bendera mulai mengering menjelang masa panen.",
};

function parseVisionOutput(raw: string): any {
  // 1. Strip reasoning / thinking tags completely
  let text = raw;
  if (text.includes("</think>")) {
    text = text.substring(text.indexOf("</think>") + 8).trim();
  } else if (text.startsWith("<think>")) {
    const firstBrace = text.indexOf("{");
    if (firstBrace !== -1) {
      text = text.substring(firstBrace);
    } else {
      text = "";
    }
  }

  text = text.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
  text = text.replace(/```json/gi, "").replace(/```/gi, "").trim();

  // 2. Try JSON extraction
  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    try {
      const jsonStr = text.substring(firstBrace, lastBrace + 1);
      const parsed = JSON.parse(jsonStr);
      return parsed;
    } catch {
      // continue to fallback
    }
  }

  // 3. Fallback interpretation
  const lower = text.toLowerCase();
  if (
    lower.includes("bukan") ||
    lower.includes("tidak teridentifikasi") ||
    lower.includes("not rice") ||
    lower.includes("bukan padi")
  ) {
    return {
      is_padi: false,
      error:
        "Gambar tidak teridentifikasi sebagai tanaman padi atau sawah. Mohon unggah foto tanaman padi asli di sawah yang jelas.",
    };
  }

  const detectedFase = normalizeFase(text);
  if (detectedFase) {
    return {
      is_padi: true,
      fase: detectedFase,
      confidence: 93.5,
      estimasi_hst:
        detectedFase === "fase_v1"
          ? "0–35 HST"
          : detectedFase === "fase_v2"
          ? "35–55 HST"
          : detectedFase === "fase_g1"
          ? "55–85 HST"
          : "85+ HST",
      ciri_visual: defaultCiriVisual[detectedFase],
      kondisi_tanaman: "Sehat / Normal",
    };
  }

  throw new Error("Gagal mengurai diagnosis visual.");
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "Tidak ada file gambar yang diunggah." },
        { status: 400 }
      );
    }

    // Read image buffer and convert to base64 data URL
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Image = buffer.toString("base64");
    const mimeType = file.type || "image/jpeg";
    const dataUrl = `data:${mimeType};base64,${base64Image}`;

    const apiKey =
      process.env.OPENAI_API_KEY || process.env.GROQ_API_KEY || "";
    const baseUrl =
      process.env.OPENAI_BASE_URL || "https://api.groq.com/openai/v1";

    let aiResult: any = null;

    // Call Groq Vision Model (Qwen 3.6 27B Vision with Multimodal Capability)
    try {
      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "qwen/qwen3.6-27b",
          messages: [
            {
              role: "system",
              content: `Kamu adalah pakar Vision AI Agronomi Padi (Oryza sativa) untuk petani Indonesia.
Jawab SELALU dan WAJIB dalam BAHASA INDONESIA.

PANDUAN VERIFIKASI CITRA SAWAH & TANAMAN PADI:
1. Periksa apakah terdapat TANAMAN PADI, RUMPUN PADI, KANOPI DAUN PADI, BULIR PADI, atau LAHAN SAWAH.
2. PENTING - KONTEKS PETANI DI LAPANGAN:
   - Jika terdapat orang/petani di sawah, tangan petani memegang tanaman/malai, caping, pematang sawah, atau alat tani, foto ini TETAP VALID dan HARUS DIANALISIS.
   - Fokuslah mendeteksi kondisi dan fase tanaman padi yang terlihat pada foto.
3. HANYA TOLAK jika gambar SAMA SEKALI BUKAN tanaman/pertanian (misalnya: foto selfie di dalam kamar/kantor, mobil di garasi, hewan peliharaan dalam rumah, kartun/meme, tangkapan layar chat/teks).
   Format jika ditolak:
   {
     "is_padi": false,
     "error": "Gambar yang diunggah tidak menunjukkan tanaman padi atau sawah. Mohon unggah foto tanaman padi di lahan sawah."
   }

4. JIKA TERDAPAT TANAMAN PADI, tentukan 1 dari 4 fase:
   - "fase_v1": Fase Vegetatif Awal (0–35 HST). Ciri: bibit muda, daun hijau muda, anakan awal.
   - "fase_v2": Fase Vegetatif Akhir (35–55 HST). Ciri: anakan maksimum lebat, rumpun tebal rimbun, belum keluar malai bulir.
   - "fase_g1": Fase Reproduktif/Bunting (55–85 HST). Ciri: batang bunting menggembung, inisiasi malai keluar, bulir muda hijau, berbunga.
   - "fase_g2": Fase Pematangan (85+ HST). Ciri: malai merunduk, bulir padi menguning keemasan, siap panen.

Kembalikan format JSON murni:
{
  "is_padi": true,
  "fase": "fase_v1" | "fase_v2" | "fase_g1" | "fase_g2",
  "confidence": 95,
  "estimasi_hst": "0–35 HST",
  "ciri_visual": "Deskripsi singkat ciri morfologi tanaman padi dalam BAHASA INDONESIA",
  "kondisi_tanaman": "Sehat / Normal"
}

PENTING: Seluruh teks dalam JSON HARUS BAHASA INDONESIA, tanpa markdown backticks.`,
            },
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: "Analisis citra ini dalam bahasa Indonesia. Tentukan apakah ini tanaman padi dan apa fasenya.",
                },
                {
                  type: "image_url",
                  image_url: {
                    url: dataUrl,
                  },
                },
              ],
            },
          ],
          temperature: 0.1,
          max_tokens: 2048,
        }),
      });

      if (response.ok) {
        const json = await response.json();
        const rawContent = json.choices?.[0]?.message?.content || "";
        aiResult = parseVisionOutput(rawContent);
      } else {
        const errJson = await response.json();
        console.error("Groq Vision API Error:", errJson);
      }
    } catch (visionErr) {
      console.error("Groq vision call failed:", visionErr);
    }

    // Process and validate result
    if (aiResult) {
      if (aiResult.is_padi === false || aiResult.error) {
        return NextResponse.json(
          {
            error:
              aiResult.error ||
              "Gambar tidak teridentifikasi sebagai tanaman padi atau sawah. Mohon unggah foto tanaman padi yang jelas.",
          },
          { status: 400 }
        );
      }

      const normalized = normalizeFase(aiResult.fase);
      if (normalized) {
        // Ensure Indonesian visual description
        let ciri = aiResult.ciri_visual;
        if (!ciri || ciri.includes("<think>") || ciri.includes("The user wants") || ciri.length < 10) {
          ciri = defaultCiriVisual[normalized];
        }

        return NextResponse.json({
          fase: normalized,
          confidence: aiResult.confidence || 94.5,
          estimasi_hst: aiResult.estimasi_hst || "-",
          ciri_visual: ciri,
          kondisi_tanaman: aiResult.kondisi_tanaman || "Sehat / Normal",
        });
      }
    }

    return NextResponse.json(
      {
        error:
          "AI Vision tidak dapat memverifikasi tanaman pada foto ini. Pastikan Anda mengunggah foto tanaman padi atau lahan sawah yang jelas.",
      },
      { status: 422 }
    );
  } catch (error: any) {
    console.error("Deteksi Fase Server Error:", error);
    return NextResponse.json(
      {
        error:
          "Terjadi kesalahan saat memproses citra: " +
          (error?.message || "Internal error"),
      },
      { status: 500 }
    );
  }
}
