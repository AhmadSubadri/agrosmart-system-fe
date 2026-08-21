"use client";

import { Menu, Activity, ShieldCheck, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

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
    <header className="sticky top-0 z-30 bg-[#FAF9F6]/90 backdrop-blur-md border-b border-bone-200/90 shadow-soft">
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3.5">
        {/* Left Section - Hamburger & Breadcrumb */}
        <div className="flex items-center gap-3">
          {/* Mobile hamburger button */}
          <button
            onClick={onToggleMobileMenu}
            className="lg:hidden p-2 rounded-xl text-forest-700 hover:text-forest-900 hover:bg-bone-200 transition-colors"
            aria-label="Buka Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-forest-900 tracking-tight">
                {title}
              </h1>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-sage-700/80 font-medium">
              <span>Kawal Tani</span>
              <span className="text-bone-400">/</span>
              <span className="text-forest-700">{title}</span>
            </div>
          </div>
        </div>

        {/* Right Section - Live Status & User Info */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Live IoT Status Pill */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-sage-100 border border-sage-200 text-xs font-medium text-forest-800">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sage-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-sage-600"></span>
            </span>
            <span className="tracking-wide">IoT Telemetri Aktif</span>
          </div>

          {/* User Profile Capsule */}
          <div className="flex items-center gap-3 pl-3 border-l border-bone-200">
            <div className="hidden md:flex flex-col items-end text-right">
              <span className="font-semibold text-sm text-forest-900 leading-tight">
                {userName}
              </span>
              <span className="text-[11px] text-sage-700/90 font-medium truncate max-w-[140px]">
                {userRole}
              </span>
            </div>

            <div className="relative">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-forest-800 border border-forest-700 text-wheat-300 font-bold flex items-center justify-center text-xs sm:text-sm shadow-sm">
                {getInitials(userName)}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-sage-500 border-2 border-white rounded-full"></span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

