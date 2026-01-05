import { Metadata } from "next";
import RootLayout from "../RootLayout";
import Header from "../Components/header";

export const metadata: Metadata = {
  title: "Realtime | Kawal Tani Agro Smart System",
  description: "Agro Smart System Realtime",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <RootLayout>{children}</RootLayout>;
}
