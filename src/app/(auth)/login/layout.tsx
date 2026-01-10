import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login | kawaltani",
  description:
    "kawaltani Login - Monitor and manage your agricultural data efficiently.",
  keywords: ["kawaltani", "Dashboard", "Agriculture", "Smart Farming"],
  icons: {
    icon: "/basic_logo1.png",
    shortcut: "/basic_logo1.png",
    apple: "/basic_logo1.png",
  },
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
