"use client";
import { useState, useRef, useEffect } from "react";
import Bot from "../assets/profil-chatbot.svg";
import User from "../assets/photo-user.svg";
import RiwayatChat from "./riwayat-chat/riwayatChat";
import { useRouter } from "next/navigation";
import {
  Send,
  Bot as BotIcon,
  User as UserIcon,
  Sparkles,
  Brain,
  MessageSquare,
  PlusCircle,
  Zap,
  AlertCircle,
} from "lucide-react";

type Message = { role: "user" | "bot"; text: string };

export default function ChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [selectedChatTitle, setSelectedChatTitle] = useState<string | null>(
    null
  );
  const [shouldRefreshHistory, setShouldRefreshHistory] = useState(false);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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

    setIsLoading(true);
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
      } finally {
        setIsLoading(false);
      }
    })();
  }, [selectedChatTitle, isUserLoggedIn, router, API_URL]);

  /* ================== SEND MESSAGE ================== */
  const handleSend = async () => {
    if (!input.trim() || !isUserLoggedIn) return;

    const currentInput = input;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: currentInput }]);
    setIsLoading(true);

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
    } finally {
      setIsLoading(false);
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Chatbot AI</h1>
        <p className="text-gray-600 mt-1">
          Asisten cerdas untuk konsultasi pertanian
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-12rem)]">
        {/* ===== SIDEBAR - Chat History ===== */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col">
          <div className="p-5 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-600" />
                Riwayat Chat
              </h2>
              <button
                onClick={() => {
                  setMessages([]);
                  setSelectedChatTitle(null);
                  setShouldRefreshHistory(true);
                }}
                className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all"
              >
                <PlusCircle className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-gray-500">
              Pilih percakapan sebelumnya atau mulai yang baru
            </p>
          </div>

          <div className="flex-1 overflow-y-auto">
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

          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>AI membantu analisis data pertanian Anda</span>
            </div>
          </div>
        </div>

        {/* ===== CHAT AREA ===== */}
        <div className="lg:col-span-3 bg-white rounded-2xl shadow-xl flex flex-col overflow-hidden">
          {/* Chat Header */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl">
                  <BotIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    Agro Smart Assistant
                  </h2>
                  <p className="text-sm text-gray-600">
                    {selectedChatTitle || "Percakapan Baru"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  <span>AI Active</span>
                </div>
              </div>
            </div>
          </div>

          {/* Messages Container */}
          <div
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto p-6 space-y-6 bg-gradient-to-b from-gray-50/50 to-gray-100/50"
          >
            {messages.length === 0 && !isLoading ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mb-6">
                  <Brain className="w-10 h-10 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Mulai Percakapan Baru
                </h3>
                <p className="text-gray-600 max-w-md mx-auto mb-6">
                  Tanyakan tentang pertanian, tanaman, sensor, atau masalah
                  teknis lainnya. AI akan membantu Anda dengan solusi yang
                  tepat.
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  <span className="px-3 py-1.5 bg-blue-100 text-blue-700 text-sm rounded-full">
                    Kondisi tanah
                  </span>
                  <span className="px-3 py-1.5 bg-green-100 text-green-700 text-sm rounded-full">
                    Nutrisi tanaman
                  </span>
                  <span className="px-3 py-1.5 bg-amber-100 text-amber-700 text-sm rounded-full">
                    Penanganan hama
                  </span>
                  <span className="px-3 py-1.5 bg-purple-100 text-purple-700 text-sm rounded-full">
                    Irigasi optimal
                  </span>
                </div>
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  } animate-fadeIn`}
                >
                  <div
                    className={`flex gap-3 max-w-[85%] ${
                      msg.role === "user" ? "flex-row-reverse" : ""
                    }`}
                  >
                    {/* Avatar */}
                    <div
                      className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        msg.role === "bot"
                          ? "bg-gradient-to-r from-blue-500 to-indigo-600"
                          : "bg-gradient-to-r from-emerald-500 to-green-600"
                      }`}
                    >
                      {msg.role === "bot" ? (
                        <BotIcon className="w-4 h-4 text-white" />
                      ) : (
                        <UserIcon className="w-4 h-4 text-white" />
                      )}
                    </div>

                    {/* Message Bubble */}
                    <div
                      className={`px-4 py-3 rounded-2xl shadow-sm ${
                        msg.role === "user"
                          ? "bg-gradient-to-r from-emerald-500 to-green-600 text-white"
                          : "bg-white border border-gray-200"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold opacity-75">
                          {msg.role === "bot" ? "Agro AI Assistant" : "Anda"}
                        </span>
                        {msg.role === "bot" && (
                          <Sparkles className="w-3 h-3 text-blue-500" />
                        )}
                      </div>
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">
                        {msg.text}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex gap-3 max-w-[85%]">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
                    <BotIcon className="w-4 h-4 text-white" />
                  </div>
                  <div className="px-4 py-3 rounded-2xl bg-white border border-gray-200">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600">
                        Agro AI sedang mengetik...
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-gray-200 bg-white">
            <div className="flex items-center gap-2 border border-gray-300 rounded-2xl px-4 py-3 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200 transition-all">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && !isLoading && handleSend()
                }
                placeholder="Tulis pertanyaan tentang pertanian..."
                className="flex-1 bg-transparent outline-none text-sm placeholder-gray-400"
                disabled={isLoading}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="p-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-lg hover:shadow-xl"
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">Kirim</span>
              </button>
            </div>

            <div className="flex items-center justify-between mt-3 px-1">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <AlertCircle className="w-3 h-3" />
                <span>
                  AI mungkin membuat kesalahan. Periksa informasi penting.
                </span>
              </div>
              <div className="text-xs text-gray-500">
                {messages.length} pesan
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-xl border border-blue-100">
          <div className="flex items-center gap-3 mb-3">
            <Brain className="w-5 h-5 text-blue-600" />
            <h4 className="font-semibold text-gray-900">AI Cerdas</h4>
          </div>
          <p className="text-sm text-gray-600">
            Didukung oleh teknologi AI untuk analisis data pertanian yang akurat
          </p>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-100">
          <div className="flex items-center gap-3 mb-3">
            <MessageSquare className="w-5 h-5 text-green-600" />
            <h4 className="font-semibold text-gray-900">
              Konsultasi Real-time
            </h4>
          </div>
          <p className="text-sm text-gray-600">
            Dapatkan solusi instan untuk masalah pertanian Anda
          </p>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-4 rounded-xl border border-purple-100">
          <div className="flex items-center gap-3 mb-3">
            <Zap className="w-5 h-5 text-purple-600" />
            <h4 className="font-semibold text-gray-900">Riwayat Cerdas</h4>
          </div>
          <p className="text-sm text-gray-600">
            Akses percakapan sebelumnya untuk referensi dan kelanjutan
          </p>
        </div>
      </div>
    </div>
  );
}
