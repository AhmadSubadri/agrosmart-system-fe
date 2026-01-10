import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Deteksi Fase Padi | Kawal Tani Agro Smart System",
  description: "Agro Smart System Dashboard",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
