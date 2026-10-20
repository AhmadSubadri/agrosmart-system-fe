"use client";

import { Menu, Activity, ShieldCheck, Sparkles, User, Camera, MessageSquare } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";

interface HeaderProps {
  title: string;
  onToggleMobileMenu?: () => void;
}

export default function Header({ title, onToggleMobileMenu }: HeaderProps) {
  const [userName, setUserName] = useState<string>("Pengguna");
  const [userRole, setUserRole] = useState<string>("Smart Farming");

  useEffect(() => {
    try {
      const stored = localStorage.getItem("user");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.user_name) setUserName(parsed.user_name);
        if (parsed.user_email) setUserRole(parsed.user_email);
      }
    } catch {
      // ignore
    }
  }, []);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <header className="sticky top-0 z-30 bg-[#FAF9F6]/95 backdrop-blur-md border-b border-bone-200/90 shadow-2xs transition-all">
      <div className="flex items-center justify-between px-3.5 sm:px-6 lg:px-8 py-2.5 sm:py-3">
        {/* Left Section - Hamburger & Breadcrumb */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          {/* Mobile hamburger button */}
          <button
            onClick={onToggleMobileMenu}
            className="lg:hidden p-2 rounded-xl text-forest-800 hover:text-forest-950 hover:bg-bone-200/80 active:scale-95 transition-all"
            aria-label="Buka Menu Navigasi"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-xl font-extrabold text-forest-900 tracking-tight truncate">
                {title}
              </h1>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-sage-600 font-medium truncate">
              <span>KawalTani</span>
              <span className="text-bone-400">/</span>
              <span className="text-forest-800 font-semibold truncate">{title}</span>
            </div>
          </div>
        </div>

        {/* Right Section - Quick AI shortcuts, IoT Live Pill & User Profile */}
        <div className="flex items-center gap-2 sm:gap-3.5 flex-shrink-0">
          {/* Quick AI Action Badges (Hidden on tiny screens) */}
          <div className="hidden md:flex items-center gap-1.5 pr-2">
            <Link
              href="/deteksi-fase-padi"
              className="px-2.5 py-1 rounded-lg bg-forest-50 hover:bg-forest-100 border border-forest-200/80 text-forest-900 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
              title="Deteksi Fase Padi AI"
            >
              <Camera className="w-3.5 h-3.5 text-sage-600" />
              <span>Deteksi AI</span>
            </Link>

            <Link
              href="/chatbot"
              className="px-2.5 py-1 rounded-lg bg-wheat-50 hover:bg-wheat-100 border border-wheat-200 text-forest-900 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
              title="Konsultasi Pakar Tani AI"
            >
              <MessageSquare className="w-3.5 h-3.5 text-wheat-700" />
              <span>Tanya AI</span>
            </Link>
          </div>

          {/* Live IoT Status Pill */}
          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-sage-100/90 border border-sage-200 text-[11px] font-medium text-forest-900">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sage-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-sage-600"></span>
            </span>
            <span className="tracking-wide">Telemetri Aktif</span>
          </div>

          {/* User Profile Capsule (Clickable Link to Profile) */}
          <Link
            href="/profil"
            className="flex items-center gap-2.5 pl-2 sm:pl-3 border-l border-bone-200 hover:opacity-90 transition-opacity group"
            title="Buka Pengaturan Profil"
          >
            <div className="hidden md:flex flex-col items-end text-right">
              <span className="font-bold text-xs sm:text-sm text-forest-900 leading-tight group-hover:text-forest-700 transition-colors">
                {userName}
              </span>
              <span className="text-[10px] text-sage-600 font-medium truncate max-w-[130px]">
                {userRole}
              </span>
            </div>

            <div className="relative">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-forest-900 border border-forest-700 text-wheat-300 font-bold flex items-center justify-center text-xs shadow-2xs group-hover:scale-105 transition-transform">
                {getInitials(userName)}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></span>
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
}
