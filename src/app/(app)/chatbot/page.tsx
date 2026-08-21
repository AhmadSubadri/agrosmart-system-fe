"use client";

import { useState, useRef, useEffect } from "react";
import RiwayatChat from "./riwayat-chat/riwayatChat";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Send,
  User as UserIcon,
  Sparkles,
  Sprout,
  MessageSquare,
  PlusCircle,
  AlertCircle,
  HelpCircle,
  Copy,
  Check,
  PanelLeft,
  X,
  RefreshCw,
} from "lucide-react";

type Message = { role: "user" | "bot"; text: string; time?: string };

export default function ChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [selectedChatTitle, setSelectedChatTitle] = useState<string | null>(
    null
  );
  const [shouldRefreshHistory, setShouldRefreshHistory] = useState(false);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [mobileHistoryOpen, setMobileHistoryOpen] = useState(false);

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
        const headers: HeadersInit = {
          "Content-Type": "application/json",
          "Accept": "application/json",
        };
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
  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || !isUserLoggedIn) return;

    const now = new Date().toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });

    setInput("");
    setMessages((prev) => [
      ...prev,
      { role: "user", text: textToSend, time: now },
    ]);
    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");
      const headers: HeadersInit = {
        "Content-Type": "application/json",
        "Accept": "application/json",
      };
      if (token) headers.Authorization = `Bearer ${token}`;

      const endpoint = selectedChatTitle
        ? `${API_URL}/api/chat/send`
        : `${API_URL}/api/chat/new`;

      const res = await fetch(endpoint, {
        method: "POST",
        headers,
        body: JSON.stringify({
          message: textToSend,
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

      const botTime = new Date().toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      });

      setMessages((prev) => [
        ...prev,
        { role: "bot", text: data.response, time: botTime },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: "Terjadi kendala saat memproses konsultasi Anda.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  /* ================== COPY TO CLIPBOARD ================== */
  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  /* ================== AUTO SCROLL ================== */
  useEffect(() => {
    chatContainerRef.current?.scrollTo({
      top: chatContainerRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, isLoading]);

  const quickPrompts = [
    "Bagaimana cara mengatasi tanah dengan pH rendah?",
    "Kapan waktu pemupukan NPK optimal untuk fase vegetatif?",
    "Gejala dan penanganan hama penggerek batang padi",
    "Berapa kelembapan tanah ideal saat fase bunting?",
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-bone-300/80 rounded-2xl p-4 sm:p-6 shadow-soft flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl sm:text-2xl font-extrabold text-forest-900 tracking-tight">
              Asisten Cerdas Pertanian
            </h2>
            <span className="px-2 py-0.5 rounded-md bg-wheat-200/80 border border-wheat-300 text-[10px] font-bold text-forest-900 uppercase tracking-wider">
              Groq Powered
            </span>
          </div>
          <p className="text-xs sm:text-sm text-sage-700 mt-1">
            Konsultasi agronomik berbasis AI untuk diagnosa tanah, hama, dan preskripsi pemupukan
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-sage-100 border border-sage-200 text-xs font-semibold text-forest-800">
            <Sparkles className="w-3.5 h-3.5 text-sage-600 animate-pulse" />
            <span>AI Online &amp; Siap Konsultasi</span>
          </div>

          {/* Mobile History Drawer Toggle */}
          <button
            onClick={() => setMobileHistoryOpen(true)}
            className="lg:hidden p-2 rounded-xl bg-forest-900 text-wheat-300 hover:bg-forest-800 transition-colors flex items-center gap-1.5 text-xs font-semibold"
          >
            <PanelLeft className="w-4 h-4" />
            <span>Riwayat</span>
          </button>
        </div>
      </div>

      {/* Main Chat Layout Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-14rem)] min-h-[580px] max-h-[850px]">
        {/* ===== DESKTOP SIDEBAR - Chat History ===== */}
        <div className="hidden lg:flex lg:col-span-4 bg-white border border-bone-300 rounded-2xl shadow-soft flex-col overflow-hidden">
          <div className="p-4 border-b border-bone-200 bg-bone-50/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-forest-800" />
              <h3 className="font-bold text-forest-900 text-sm">Riwayat Konsultasi</h3>
            </div>
            <button
              onClick={() => {
                setMessages([]);
                setSelectedChatTitle(null);
                setShouldRefreshHistory(true);
              }}
              className="px-2.5 py-1.5 bg-forest-900 hover:bg-forest-800 text-wheat-300 rounded-xl transition-colors shadow-2xs flex items-center gap-1.5 text-xs font-semibold"
              title="Mulai Sesi Baru"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Sesi Baru</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
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
        </div>

        {/* ===== MOBILE DRAWER - Chat History ===== */}
        {mobileHistoryOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-forest-950/60 backdrop-blur-xs transition-opacity"
              onClick={() => setMobileHistoryOpen(false)}
            />

            <div className="relative w-4/5 max-w-xs bg-white border-r border-bone-300 h-full flex flex-col shadow-2xl z-10 animate-in slide-in-from-left duration-200">
              <div className="p-4 border-b border-bone-200 bg-forest-900 text-bone-50 flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <MessageSquare className="w-4 h-4 text-wheat-300" />
                  <span>Riwayat Konsultasi</span>
                </div>
                <button
                  onClick={() => setMobileHistoryOpen(false)}
                  className="p-1 rounded-lg text-bone-200 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-3 border-b border-bone-200">
                <button
                  onClick={() => {
                    setMessages([]);
                    setSelectedChatTitle(null);
                    setShouldRefreshHistory(true);
                    setMobileHistoryOpen(false);
                  }}
                  className="w-full py-2 bg-forest-900 hover:bg-forest-800 text-wheat-300 rounded-xl transition-colors flex items-center justify-center gap-2 text-xs font-bold shadow-sm"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Mulai Sesi Baru</span>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-2">
                <RiwayatChat
                  onSelectChat={(title) => {
                    setSelectedChatTitle(title);
                    setMobileHistoryOpen(false);
                  }}
                  onAddNewChat={() => {
                    setMessages([]);
                    setSelectedChatTitle(null);
                    setShouldRefreshHistory(true);
                    setMobileHistoryOpen(false);
                  }}
                  selectedChatTitle={selectedChatTitle}
                  shouldRefresh={shouldRefreshHistory}
                  onRefreshDone={() => setShouldRefreshHistory(false)}
                  isUserLoggedIn={isUserLoggedIn}
                />
              </div>
            </div>
          </div>
        )}

        {/* ===== CHAT MESSAGES & INPUT AREA ===== */}
        <div className="lg:col-span-8 bg-white border border-bone-300 rounded-2xl shadow-soft flex flex-col overflow-hidden">
          {/* Active Session Header */}
          <div className="px-4 sm:px-6 py-3 border-b border-bone-200 bg-bone-50/60 flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-forest-900 text-wheat-300 flex items-center justify-center font-bold flex-shrink-0 shadow-2xs">
                <Sprout className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-xs sm:text-sm text-forest-900 leading-tight truncate">
                  {selectedChatTitle || "Sesi Konsultasi Baru"}
                </h4>
                <p className="text-[10px] sm:text-[11px] text-sage-700 truncate">
                  Model Agronomi Khusus Padi &amp; Analisis Telemetri Tanah
                </p>
              </div>
            </div>

            {selectedChatTitle && (
              <button
                onClick={() => {
                  setMessages([]);
                  setSelectedChatTitle(null);
                }}
                className="text-xs text-sage-700 hover:text-forest-900 font-semibold px-2.5 py-1 rounded-lg hover:bg-bone-200 transition-colors flex-shrink-0"
              >
                Reset Sesi
              </button>
            )}
          </div>

          {/* Messages Feed */}
          <div
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-bone-50/20"
          >
            {messages.length === 0 && !isLoading ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-6 px-2">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-sage-100 border border-sage-200 rounded-2xl flex items-center justify-center mb-3 text-forest-800 shadow-2xs">
                  <Sprout className="w-7 h-7 sm:w-8 sm:h-8 text-sage-700" />
                </div>
                <h4 className="text-sm sm:text-base font-extrabold text-forest-900 mb-1">
                  Apa yang ingin Anda konsultasikan?
                </h4>
                <p className="text-xs text-sage-700 max-w-md mb-5 leading-relaxed">
                  Tanyakan rekomendasi seputar hara tanah, pemupukan presisi, diagnosa hama padi, atau analisis data sensor lahan.
                </p>

                {/* Prompt Chips */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-xl w-full text-left">
                  {quickPrompts.map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(prompt)}
                      className="p-3 rounded-xl bg-white border border-bone-300 hover:border-sage-500 hover:bg-sage-50/60 transition-all text-xs font-medium text-forest-800 text-left shadow-2xs flex items-center gap-2.5 group"
                    >
                      <HelpCircle className="w-4 h-4 text-sage-500 flex-shrink-0 group-hover:text-forest-800" />
                      <span className="truncate">{prompt}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`flex gap-2.5 sm:gap-3 max-w-[92%] sm:max-w-[80%] ${
                      msg.role === "user" ? "flex-row-reverse" : ""
                    }`}
                  >
                    {/* Avatar */}
                    <div
                      className={`flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center text-xs font-bold shadow-2xs ${
                        msg.role === "bot"
                          ? "bg-forest-900 text-wheat-300 border border-forest-800"
                          : "bg-sage-600 text-white"
                      }`}
                    >
                      {msg.role === "bot" ? (
                        <Sprout className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      ) : (
                        <UserIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      )}
                    </div>

                    {/* Message Card */}
                    <div
                      className={`relative px-4 py-3 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-soft overflow-x-auto ${
                        msg.role === "user"
                          ? "bg-forest-900 text-bone-50 rounded-tr-xs"
                          : "bg-white border border-bone-300 text-forest-900 rounded-tl-xs"
                      }`}
                    >
                      {/* Sender Header */}
                      <div className="flex items-center justify-between gap-4 mb-1.5 opacity-80 text-[11px] font-semibold">
                        <span className={msg.role === "user" ? "text-wheat-300" : "text-sage-700"}>
                          {msg.role === "bot" ? "KawalTani AI" : "Anda"}
                        </span>
                        {msg.time && (
                          <span className="text-[10px] opacity-60 font-normal">
                            {msg.time}
                          </span>
                        )}
                      </div>

                      {/* Content Body */}
                      {msg.role === "user" ? (
                        <p className="whitespace-pre-wrap">{msg.text}</p>
                      ) : (
                        <div className="space-y-2 text-forest-900">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              table: ({ node, ...props }) => (
                                <div className="my-2.5 overflow-x-auto rounded-xl border border-bone-300 shadow-2xs">
                                  <table
                                    className="w-full text-left text-xs border-collapse"
                                    {...props}
                                  />
                                </div>
                              ),
                              thead: ({ node, ...props }) => (
                                <thead
                                  className="bg-forest-900 text-bone-50 text-[11px] font-bold uppercase tracking-wider"
                                  {...props}
                                />
                              ),
                              th: ({ node, ...props }) => (
                                <th
                                  className="px-3.5 py-2.5 border-b border-forest-800"
                                  {...props}
                                />
                              ),
                              td: ({ node, ...props }) => (
                                <td
                                  className="px-3.5 py-2.5 border-b border-bone-200 text-forest-800 bg-white"
                                  {...props}
                                />
                              ),
                              strong: ({ node, ...props }) => (
                                <strong
                                  className="font-bold text-forest-950"
                                  {...props}
                                />
                              ),
                              ul: ({ node, ...props }) => (
                                <ul
                                  className="list-disc pl-4 space-y-1 my-1.5 text-forest-850"
                                  {...props}
                                />
                              ),
                              ol: ({ node, ...props }) => (
                                <ol
                                  className="list-decimal pl-4 space-y-1 my-1.5 text-forest-850"
                                  {...props}
                                />
                              ),
                              p: ({ node, ...props }) => (
                                <p className="my-1.5 leading-relaxed" {...props} />
                              ),
                              hr: ({ node, ...props }) => (
                                <hr className="my-2.5 border-bone-300" {...props} />
                              ),
                            }}
                          >
                            {msg.text}
                          </ReactMarkdown>

                          {/* Action Toolbar */}
                          <div className="pt-2 mt-2 border-t border-bone-200 flex items-center justify-end">
                            <button
                              onClick={() => handleCopy(msg.text, idx)}
                              className="px-2 py-1 rounded-lg text-[11px] font-medium text-sage-700 hover:text-forest-900 hover:bg-bone-100 transition-colors flex items-center gap-1"
                              title="Salin jawaban"
                            >
                              {copiedIdx === idx ? (
                                <>
                                  <Check className="w-3 h-3 text-sage-600" />
                                  <span className="text-sage-600 font-semibold">Tersalin!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3 text-sage-500" />
                                  <span>Salin Teks</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex gap-2.5 max-w-[85%]">
                  <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-forest-900 text-wheat-300 flex items-center justify-center shadow-2xs">
                    <Sprout className="w-4 h-4" />
                  </div>
                  <div className="px-4 py-3 rounded-2xl bg-white border border-bone-300 shadow-soft">
                    <div className="flex items-center gap-2.5">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-sage-600 rounded-full animate-bounce"></span>
                        <span className="w-2 h-2 bg-sage-600 rounded-full animate-bounce [animation-delay:0.15s]"></span>
                        <span className="w-2 h-2 bg-sage-600 rounded-full animate-bounce [animation-delay:0.3s]"></span>
                      </div>
                      <span className="text-xs text-sage-700 font-medium">
                        Menganalisis data lahan &amp; menyusun rekomendasi...
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Bar */}
          <div className="p-3 sm:p-4 border-t border-bone-200 bg-white">
            <div className="flex items-center gap-2 border border-bone-300 rounded-2xl px-3.5 py-2 focus-within:border-sage-500 focus-within:ring-2 focus-within:ring-sage-500/20 bg-bone-50/40 transition-all shadow-2xs">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && !isLoading && handleSend()
                }
                placeholder="Ketik pertanyaan seputar tanaman, hama, atau kondisi tanah..."
                className="flex-1 bg-transparent outline-none text-xs sm:text-sm text-forest-900 placeholder:text-sage-600/70"
                disabled={isLoading}
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || isLoading}
                className="p-2.5 bg-forest-900 hover:bg-forest-800 text-wheat-300 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-2xs flex-shrink-0"
                title="Kirim Pertanyaan"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center justify-between mt-2 px-1 text-[11px] text-sage-700">
              <div className="flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-wheat-600 flex-shrink-0" />
                <span className="truncate">Konsultasi AI adalah rekomendasi agronomik pendukung keputusan petani.</span>
              </div>
              <span className="hidden sm:inline flex-shrink-0 font-medium">{messages.length} pesan</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


