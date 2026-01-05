import { Metadata } from "next";
import RootLayout from "../RootLayout";

export const metadata: Metadata = {
  title: "Riwayat | Kawal Tani Agro Smart System",
  description: "Agro Smart System Riwayat",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <RootLayout>{children}</RootLayout>;
}
