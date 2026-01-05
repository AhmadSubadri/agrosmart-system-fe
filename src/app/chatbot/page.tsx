"use client";
import { useState, useRef, useEffect } from "react";
import Bot from "../assets/profil-chatbot.svg";
import User from "../assets/photo-user.svg";
import { BsSend } from "react-icons/bs";
import RiwayatChat from "./riwayat-chat/riwayatChat";
import { useRouter } from "next/navigation";

type Message = { role: "user" | "bot"; text: string };

export default function ChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [selectedChatTitle, setSelectedChatTitle] = useState<string | null>(
    null
  );
  const [shouldRefreshHistory, setShouldRefreshHistory] = useState(false);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  /* ================== AUTH CHECK ================== */
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) router.push("/login");
    else setIsUserLoggedIn(true);
  }, [router]);

  /* ================== LOAD CHAT HISTORY ================== */
  useEffect(() => {
    if (!selectedChatTitle || !isUserLoggedIn) return;

    (async () => {
      try {
        const token = localStorage.getItem("token");
        const headers: HeadersInit = { "Content-Type": "application/json" };
        if (token) headers.Authorization = `Bearer ${token}`;

        const res = await fetch(
          `${API_URL}/api/chat/history/${encodeURIComponent(
            selectedChatTitle
          )}`,
          { headers }
        );

        if (res.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          router.push("/login");
          return;
        }

        const data = await res.json();
        const hydrated: Message[] = data.flatMap((item: any) => [
          { role: "user", text: item.message },
          { role: "bot", text: item.response },
        ]);

        setMessages(hydrated);
      } catch {
        setMessages([{ role: "bot", text: "Gagal memuat riwayat chat." }]);
      }
    })();
  }, [selectedChatTitle, isUserLoggedIn, router, API_URL]);

  /* ================== SEND MESSAGE ================== */
  const handleSend = async () => {
    if (!input.trim() || !isUserLoggedIn) return;

    const currentInput = input;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: currentInput }]);

    try {
      const token = localStorage.getItem("token");
      const headers: HeadersInit = { "Content-Type": "application/json" };
      if (token) headers.Authorization = `Bearer ${token}`;

      const endpoint = selectedChatTitle
        ? `${API_URL}/api/chat/send`
        : `${API_URL}/api/chat/new`;

      const res = await fetch(endpoint, {
        method: "POST",
        headers,
        body: JSON.stringify({
          message: currentInput,
          name_chat: selectedChatTitle,
        }),
      });

      if (res.status === 401) {
        localStorage.removeItem("token");
        router.push("/login");
        return;
      }

      const data = await res.json();

      if (!selectedChatTitle && data.name_chat) {
        setSelectedChatTitle(data.name_chat);
        setShouldRefreshHistory(true);
      }

      setMessages((prev) => [...prev, { role: "bot", text: data.response }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "Terjadi kesalahan saat memproses pesan." },
      ]);
    }
  };

  /* ================== AUTO SCROLL ================== */
  useEffect(() => {
    chatContainerRef.current?.scrollTo({
      top: chatContainerRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  /* ================== UI ================== */
  return (
    <div className="px-4 py-6 md:px-6 md:py-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-[calc(100vh-6rem)]">
        {/* ===== SIDEBAR ===== */}
        <div className="hidden md:block bg-white rounded-xl shadow border overflow-hidden">
          <RiwayatChat
            onSelectChat={setSelectedChatTitle}
            onAddNewChat={() => {
              setMessages([]);
              setSelectedChatTitle(null);
              setShouldRefreshHistory(true);
            }}
            selectedChatTitle={selectedChatTitle}
            shouldRefresh={shouldRefreshHistory}
            onRefreshDone={() => setShouldRefreshHistory(false)}
            isUserLoggedIn={isUserLoggedIn}
          />
        </div>

        {/* ===== CHAT AREA ===== */}
        <div className="col-span-1 md:col-span-3 bg-white rounded-xl shadow border flex flex-col overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b bg-gray-50">
            <h2 className="text-lg font-bold text-gray-800">
              🤖 Agro Smart Assistant Kawal Tani
            </h2>
            <p className="text-sm text-gray-500">
              Konsultasi pertanian berbasis AI
            </p>
          </div>

          {/* Messages */}
          <div
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto px-4 py-6 space-y-4 bg-gray-50"
          >
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div className="flex gap-2 max-w-[85%]">
                  {msg.role === "bot" && <Bot />}
                  <div
                    className={`px-4 py-3 rounded-xl text-sm shadow ${
                      msg.role === "user"
                        ? "bg-primary text-white"
                        : "bg-white border"
                    }`}
                  >
                    {msg.text}
                  </div>
                  {msg.role === "user" && <User />}
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="p-4 border-t bg-white">
            <div className="flex items-center gap-2 border rounded-xl px-3 py-2 focus-within:border-primary">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Tulis pesan…"
                className="flex-1 bg-transparent outline-none text-sm"
              />
              <button
                onClick={handleSend}
                className="bg-primary hover:bg-secondary text-white p-2 rounded-lg"
              >
                <BsSend />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
