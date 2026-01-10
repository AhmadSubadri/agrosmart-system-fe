import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Profile | Kawal Tani Agro Smart System",
  description: "Agro Smart System Plants",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
