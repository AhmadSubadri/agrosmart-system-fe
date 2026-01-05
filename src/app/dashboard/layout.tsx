// src/app/layout.tsx
import { Metadata } from "next";
import RootLayout from "../RootLayout";

export const metadata: Metadata = {
  title: "Dashboard | AgroSmartSystem",
  description:
    "AgroSmartSystem Dashboard - Monitor and manage your agricultural data efficiently.",
  keywords: ["AgroSmartSystem", "Dashboard", "Agriculture", "Smart Farming"],
  icons: {
    icon: "/favicon.ico",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <RootLayout>{children}</RootLayout>;
}
