import "./globals.css";
import { Metadata, Viewport } from "next";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#1B261C",
};

export const metadata: Metadata = {
  title: {
    default: "KawalTani - Sistem Presisi Monitoring Pertanian Cerdas",
    template: "%s | KawalTani Smart Farming",
  },
  description:
    "Platform monitoring agronomik presisi berbasis IoT, Digital Twin, dan Computer Vision AI untuk optimasi pemupukan dan kesehatan tanaman padi.",
  keywords: [
    "KawalTani",
    "Smart Farming",
    "Pertanian Presisi",
    "IoT Pertanian",
    "Digital Twin Sawah",
    "Sensor NPK",
    "Deteksi Fase Padi",
    "Kawal Tani ID",
  ],
  authors: [{ name: "Tim Penelitian KawalTani" }],
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico" },
      { url: "/icon.png", type: "image/png" },
    ],
    apple: [{ url: "/icon.png" }],
    shortcut: ["/favicon.ico"],
  },
  openGraph: {
    title: "KawalTani - Sistem Presisi Monitoring Pertanian Cerdas",
    description:
      "Monitoring telemetri hara tanah, cuaca mikro, dan deteksi fase pertumbuhan tanaman secara cerdas.",
    type: "website",
    locale: "id_ID",
    siteName: "KawalTani",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <head>
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="alternate icon" href="/favicon.ico" />
      </head>
      <body className="font-roboto antialiased text-[#1E2B1F] bg-[#FAF9F6]" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
