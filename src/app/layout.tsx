import "./globals.css";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "KawalTani - Precision Agriculture System",
  description: "Sistem Pemantauan dan Telemetri Pertanian Cerdas Berbasis Digital Twin",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="font-roboto antialiased text-[#1E2B1F]" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}

