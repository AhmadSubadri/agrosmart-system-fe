import { Metadata } from "next";
import RootLayout from "../RootLayout";
export const metadata: Metadata = {
  title: "Deteksi Fase Padi | Kawal Tani Agro Smart System",
  description: "Agro Smart System Dashboard",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <RootLayout>{children}</RootLayout>;
}
