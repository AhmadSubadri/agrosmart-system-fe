import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Tanaman | Kawal Tani Agro Smart System",
  description: "Agro Smart System Plants",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
