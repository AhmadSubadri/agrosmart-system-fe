import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chatbot | Kawal Tani Agro Smart System",
  description: "Agro Smart System Chatbot",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
