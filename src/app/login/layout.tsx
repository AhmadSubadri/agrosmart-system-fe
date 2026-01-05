import { Metadata } from "next";
import RootLayout from "../RootLayout";

export const metadata: Metadata = {
  title: "Login",
  description: "AgroSmartSystem Login",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <RootLayout>{children}</RootLayout>;
}
