import { Metadata } from "next";
import RootLayout from "../RootLayout";
export const metadata: Metadata = {
  title: "Lahan | Kawal Tani Agro Smart System",
  description: "Agro Smart System Sites",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <RootLayout>{children}</RootLayout>;
}
