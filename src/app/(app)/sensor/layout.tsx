import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Sensor | Kawal Tani Agro Smart System",
  description: "Agro Smart System Sensor",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
