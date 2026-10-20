"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import RiwayatChat from "./riwayat-chat/riwayatChat";
import { useRouter, useSearchParams } from "next/navigation";
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

function ChatbotContent() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [selectedChatTitle, setSelectedChatTitle] = useState<string | null>(null);
  const [shouldRefreshHistory, setShouldRefreshHistory] = useState(false);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [mobileHistoryOpen, setMobileHistoryOpen] = useState(false);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const promptSentRef = useRef(false);
  const router = useRouter();
  const searchParams = useSearchParams();
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
          Accept: "application/json",
        };
        if (token) headers.Authorization = `Bearer ${token}`;

        const res = await fetch(
          `${API_URL}/api/chat/history/${encodeURIComponent(selectedChatTitle)}`,
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
        Accept: "application/json",
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

  /* ================== AUTO PROCESS INCOMING PROMPT ================== */
  useEffect(() => {
    const promptParam = searchParams.get("prompt");
    if (
      promptParam &&
      isUserLoggedIn &&
      !promptSentRef.current &&
      messages.length === 0 &&
      !isLoading
    ) {
      promptSentRef.current = true;
      handleSend(promptParam);
    }
  }, [searchParams, isUserLoggedIn, messages.length, isLoading]);

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
    <div className="h-full w-full flex flex-col min-h-0 overflow-hidden gap-2 sm:gap-3">
      {/* Compact Top Header Bar */}
      <div className="bg-white border border-bone-300 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 shadow-2xs flex items-center justify-between gap-3 flex-shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-forest-900 text-wheat-300 flex items-center justify-center font-bold flex-shrink-0 shadow-2xs">
            <Sprout className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-extrabold text-forest-900 tracking-tight truncate">
                Asisten Cerdas Pertanian
              </h2>
              <span className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-wheat-200/80 border border-wheat-300 text-[9px] font-bold text-forest-900 uppercase tracking-wider">
                Groq AI
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-sage-600 truncate hidden md:block">
              Konsultasi agronomik berbasis AI untuk diagnosa tanah, hama, dan pemupukan presisi
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-sage-100 border border-sage-200 text-[10px] font-semibold text-forest-800">
            <Sparkles className="w-3 h-3 text-sage-600 animate-pulse" />
            <span>AI Siap</span>
          </div>

          <button
            onClick={() => {
              setMessages([]);
              setSelectedChatTitle(null);
              setShouldRefreshHistory(true);
            }}
            className="px-2.5 py-1 bg-forest-900 hover:bg-forest-800 text-wheat-300 rounded-lg transition-colors shadow-2xs flex items-center gap-1.5 text-xs font-bold active:scale-[0.98]"
            title="Mulai Sesi Baru"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sesi Baru</span>
          </button>

          {/* Mobile History Drawer Toggle */}
          <button
            onClick={() => setMobileHistoryOpen(true)}
            className="lg:hidden p-1.5 rounded-lg bg-bone-100 border border-bone-300 text-forest-900 hover:bg-bone-200 transition-colors flex items-center gap-1 text-xs font-semibold"
            title="Buka Riwayat Konsultasi"
          >
            <PanelLeft className="w-4 h-4" />
            <span className="text-[11px]">Riwayat</span>
          </button>
        </div>
      </div>

      {/* Main Full-Height Chat Container */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 overflow-hidden">
        {/* ===== DESKTOP SIDEBAR - Chat History ===== */}
        <div className="hidden lg:flex lg:col-span-4 bg-white border border-bone-300 rounded-xl shadow-2xs flex-col overflow-hidden h-full min-h-0">
          <div className="p-3 border-b border-bone-200 bg-bone-50/60 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-forest-800" />
              <h3 className="font-bold text-forest-900 text-xs sm:text-sm">Riwayat Konsultasi</h3>
            </div>
            <button
              onClick={() => {
                setMessages([]);
                setSelectedChatTitle(null);
                setShouldRefreshHistory(true);
              }}
              className="px-2 py-1 bg-forest-50 hover:bg-forest-100 text-forest-900 border border-forest-200 rounded-md transition-colors text-[11px] font-bold flex items-center gap-1"
              title="Mulai Sesi Baru"
            >
              <PlusCircle className="w-3 h-3" />
              <span>Baru</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-2 min-h-0">
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
            <div
              className="fixed inset-0 bg-forest-950/60 backdrop-blur-xs transition-opacity"
              onClick={() => setMobileHistoryOpen(false)}
            />

            <div className="relative w-4/5 max-w-xs bg-white border-r border-bone-300 h-full flex flex-col shadow-2xl z-10 animate-in slide-in-from-left duration-200">
              <div className="p-3.5 border-b border-bone-200 bg-forest-900 text-bone-50 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-2 font-bold text-xs sm:text-sm">
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

              <div className="p-2.5 border-b border-bone-200 flex-shrink-0">
                <button
                  onClick={() => {
                    setMessages([]);
                    setSelectedChatTitle(null);
                    setShouldRefreshHistory(true);
                    setMobileHistoryOpen(false);
                  }}
                  className="w-full py-2 bg-forest-900 hover:bg-forest-800 text-wheat-300 rounded-lg transition-colors flex items-center justify-center gap-1.5 text-xs font-bold shadow-2xs"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Mulai Sesi Baru</span>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-2 min-h-0">
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

        {/* ===== MAIN CHAT PANEL (MESSAGES + ALWAYS-VISIBLE INPUT) ===== */}
        <div className="lg:col-span-8 bg-white border border-bone-300 rounded-xl shadow-2xs flex flex-col overflow-hidden h-full min-h-0">
          {/* Active Session Sub-Header */}
          <div className="px-3.5 sm:px-4 py-2 border-b border-bone-200 bg-bone-50/70 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
              <div className="min-w-0">
                <h4 className="font-bold text-xs sm:text-sm text-forest-900 leading-tight truncate">
                  {selectedChatTitle || "Sesi Konsultasi Baru"}
                </h4>
                <p className="text-[10px] text-sage-600 truncate">
                  Model Agronomi Padi &amp; Telemetri Tanah KawalTani
                </p>
              </div>
            </div>

            {selectedChatTitle && (
              <button
                onClick={() => {
                  setMessages([]);
                  setSelectedChatTitle(null);
                }}
                className="text-[11px] text-sage-700 hover:text-forest-900 font-semibold px-2 py-0.5 rounded hover:bg-bone-200 transition-colors flex-shrink-0"
              >
                Reset Sesi
              </button>
            )}
          </div>

          {/* Messages Feed (Scrollable only inside this viewport area) */}
          <div
            ref={chatContainerRef}
            className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-4 md:p-5 space-y-3.5 bg-bone-50/30 scroll-smooth"
          >
            {messages.length === 0 && !isLoading ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-4 px-2">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-sage-100 border border-sage-200 rounded-2xl flex items-center justify-center mb-2.5 text-forest-800 shadow-2xs">
                  <Sprout className="w-6 h-6 sm:w-7 sm:h-7 text-sage-700" />
                </div>
                <h4 className="text-sm sm:text-base font-extrabold text-forest-900 mb-1">
                  Apa yang ingin Anda konsultasikan?
                </h4>
                <p className="text-xs text-sage-700 max-w-md mb-4 leading-relaxed">
                  Tanyakan rekomendasi seputar hara tanah, pemupukan presisi, diagnosa hama padi, atau analisis data sensor lahan.
                </p>

                {/* Prompt Chips */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-xl w-full text-left">
                  {quickPrompts.map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(prompt)}
                      className="p-2.5 sm:p-3 rounded-xl bg-white border border-bone-300 hover:border-sage-500 hover:bg-sage-50/60 transition-all text-xs font-medium text-forest-800 text-left shadow-2xs flex items-center gap-2 group active:scale-[0.99]"
                    >
                      <HelpCircle className="w-3.5 h-3.5 text-sage-500 flex-shrink-0 group-hover:text-forest-800" />
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
                    className={`flex gap-2 sm:gap-2.5 max-w-[92%] sm:max-w-[82%] ${
                      msg.role === "user" ? "flex-row-reverse" : ""
                    }`}
                  >
                    {/* Avatar */}
                    <div
                      className={`flex-shrink-0 w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold shadow-2xs ${
                        msg.role === "bot"
                          ? "bg-forest-900 text-wheat-300 border border-forest-800"
                          : "bg-sage-600 text-white"
                      }`}
                    >
                      {msg.role === "bot" ? (
                        <Sprout className="w-3.5 h-3.5" />
                      ) : (
                        <UserIcon className="w-3.5 h-3.5" />
                      )}
                    </div>

                    {/* Message Card */}
                    <div
                      className={`relative px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-soft overflow-x-auto ${
                        msg.role === "user"
                          ? "bg-forest-900 text-bone-50 rounded-tr-xs"
                          : "bg-white border border-bone-300 text-forest-900 rounded-tl-xs"
                      }`}
                    >
                      {/* Sender Header */}
                      <div className="flex items-center justify-between gap-4 mb-1 opacity-80 text-[10px] sm:text-[11px] font-semibold">
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
                                <div className="my-2 overflow-x-auto rounded-lg border border-bone-300 shadow-2xs">
                                  <table
                                    className="w-full text-left text-xs border-collapse"
                                    {...props}
                                  />
                                </div>
                              ),
                              thead: ({ node, ...props }) => (
                                <thead
                                  className="bg-forest-900 text-bone-50 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider"
                                  {...props}
                                />
                              ),
                              th: ({ node, ...props }) => (
                                <th
                                  className="px-3 py-2 border-b border-forest-800"
                                  {...props}
                                />
                              ),
                              td: ({ node, ...props }) => (
                                <td
                                  className="px-3 py-2 border-b border-bone-200 text-forest-800 bg-white"
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
                                  className="list-disc pl-4 space-y-1 my-1 text-forest-850"
                                  {...props}
                                />
                              ),
                              ol: ({ node, ...props }) => (
                                <ol
                                  className="list-decimal pl-4 space-y-1 my-1 text-forest-850"
                                  {...props}
                                />
                              ),
                              p: ({ node, ...props }) => (
                                <p className="my-1 leading-relaxed" {...props} />
                              ),
                              hr: ({ node, ...props }) => (
                                <hr className="my-2 border-bone-300" {...props} />
                              ),
                            }}
                          >
                            {msg.text}
                          </ReactMarkdown>

                          {/* Action Toolbar */}
                          <div className="pt-1.5 mt-1.5 border-t border-bone-200 flex items-center justify-end">
                            <button
                              onClick={() => handleCopy(msg.text, idx)}
                              className="px-2 py-0.5 rounded text-[10px] font-medium text-sage-700 hover:text-forest-900 hover:bg-bone-100 transition-colors flex items-center gap-1"
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
                <div className="flex gap-2 max-w-[85%]">
                  <div className="flex-shrink-0 w-7 h-7 rounded-xl bg-forest-900 text-wheat-300 flex items-center justify-center shadow-2xs">
                    <Sprout className="w-3.5 h-3.5" />
                  </div>
                  <div className="px-3.5 py-2.5 rounded-2xl bg-white border border-bone-300 shadow-soft">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <span className="w-1.5 h-1.5 bg-sage-600 rounded-full animate-bounce"></span>
                        <span className="w-1.5 h-1.5 bg-sage-600 rounded-full animate-bounce [animation-delay:0.15s]"></span>
                        <span className="w-1.5 h-1.5 bg-sage-600 rounded-full animate-bounce [animation-delay:0.3s]"></span>
                      </div>
                      <span className="text-xs text-sage-700 font-medium">
                        Menyusun rekomendasi agronomis...
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Always-Visible Fixed Bottom Input Bar */}
          <div className="p-2.5 sm:p-3 border-t border-bone-200 bg-white flex-shrink-0">
            <div className="flex items-center gap-2 border border-bone-300 rounded-xl px-3 py-1.5 focus-within:border-sage-500 focus-within:ring-2 focus-within:ring-sage-500/20 bg-bone-50/50 transition-all shadow-2xs">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && !isLoading && handleSend()
                }
                placeholder="Tanyakan seputar tanaman, hama, hara, atau analisis sensor..."
                className="flex-1 bg-transparent outline-none text-xs sm:text-sm text-forest-900 placeholder:text-sage-600/70"
                disabled={isLoading}
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || isLoading}
                className="p-2 bg-forest-900 hover:bg-forest-800 text-wheat-300 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-2xs flex-shrink-0 active:scale-95"
                title="Kirim Pertanyaan"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-center justify-between mt-1.5 px-1 text-[10px] text-sage-600">
              <div className="flex items-center gap-1 min-w-0">
                <AlertCircle className="w-3 h-3 text-wheat-600 flex-shrink-0" />
                <span className="truncate">Rekomendasi AI pendukung keputusan agronomis petani.</span>
              </div>
              <span className="hidden sm:inline flex-shrink-0 font-semibold">{messages.length} pesan</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ChatbotPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-sage-700 flex flex-col items-center justify-center min-h-[300px]">
          <RefreshCw className="w-6 h-6 animate-spin text-forest-800 mb-2" />
          <p className="text-xs font-semibold">Memuat Asisten AI KawalTani...</p>
        </div>
      }
    >
      <ChatbotContent />
    </Suspense>
  );
}
