import { Metadata } from "next";
import RootLayout from "../RootLayout";
export const metadata: Metadata = {
  title: "Profile | Kawal Tani Agro Smart System",
  description: "Agro Smart System Plants",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <RootLayout>{children}</RootLayout>;
}
