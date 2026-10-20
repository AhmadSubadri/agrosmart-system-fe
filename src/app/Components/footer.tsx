"use client";

import React from "react";
import Link from "next/link";
import { Sprout, ShieldCheck, Heart, Radio, ExternalLink } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-bone-200/90 bg-white/70 backdrop-blur-sm text-forest-900 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Left: Branding & Research Notice */}
          <div className="flex items-center gap-3 text-center md:text-left">
            <div className="w-8 h-8 rounded-lg bg-forest-900 text-wheat-300 flex items-center justify-center font-bold shadow-2xs flex-shrink-0">
              <Sprout className="w-4 h-4 text-wheat-300" />
            </div>
            <div>
              <div className="flex items-center justify-center md:justify-start gap-2">
                <span className="font-extrabold text-sm tracking-tight text-forest-900">
                  KawalTani System
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-forest-50 border border-forest-200 text-forest-800">
                  v2.4 Pro
                </span>
              </div>
              <p className="text-[11px] text-sage-600 mt-0.5">
                Riset & Pengembangan Pertanian Presisi Digital Twin
              </p>
            </div>
          </div>

          {/* Center: System Status Indicator */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-bone-100/80 border border-bone-200 text-[11px] text-forest-800 font-medium">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sage-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-sage-600"></span>
            </span>
            <span>LoRaWAN & IoT Server:</span>
            <span className="font-bold text-forest-900">Online 99.8%</span>
          </div>

          {/* Right: Copyright & Quick Links */}
          <div className="flex flex-col sm:flex-row items-center gap-3 text-[11px] text-sage-600 text-center md:text-right">
            <div className="flex items-center gap-3">
              <Link
                href="/chatbot"
                className="hover:text-forest-900 transition-colors underline-offset-2 hover:underline"
              >
                Pakar AI
              </Link>
              <span>•</span>
              <Link
                href="/deteksi-fase-padi"
                className="hover:text-forest-900 transition-colors underline-offset-2 hover:underline"
              >
                Deteksi Fase
              </Link>
              <span>•</span>
              <Link
                href="/profil"
                className="hover:text-forest-900 transition-colors underline-offset-2 hover:underline"
              >
                Pengaturan
              </Link>
            </div>
            <span className="hidden sm:inline text-bone-300">|</span>
            <span>© {currentYear} KawalTani</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
