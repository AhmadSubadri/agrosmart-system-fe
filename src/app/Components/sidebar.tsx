"use client";

import {
  Leaf,
  Activity,
  Home,
  Clock,
  MapPin,
  Sprout,
  Radio,
  MessageSquare,
  User,
  ChevronLeft,
  ChevronRight,
  X,
  LogOut,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

interface SidebarProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  mobileOpen?: boolean;
  setMobileOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  activePage: string;
  setActivePage: React.Dispatch<React.SetStateAction<string>>;
}

interface MenuItem {
  title: string;
  path: string;
  icon: React.ReactNode;
  description: string;
  category?: string;
  badge?: string;
}

const Sidebar: React.FC<SidebarProps> = ({
  open,
  setOpen,
  mobileOpen = false,
  setMobileOpen,
  activePage,
  setActivePage,
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    const token = localStorage.getItem("token");
    try {
      if (token) {
        await fetch(`${API_URL}/api/logout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("selectedSiteId");
      router.push("/login");
    }
  };

  const Menus: MenuItem[] = [
    {
      title: "Dashboard",
      path: "/dashboard",
      icon: <Home className="w-4 h-4" />,
      description: "Overview sistem & KPI",
      category: "Monitoring Lahan",
    },
    {
      title: "Realtime",
      path: "/realtime",
      icon: <Activity className="w-4 h-4" />,
      description: "Live sensor stream",
    },
    {
      title: "Riwayat",
      path: "/riwayat",
      icon: <Clock className="w-4 h-4" />,
      description: "Histori & grafik waktu",
    },
    {
      title: "Lahan",
      path: "/lahan",
      icon: <MapPin className="w-4 h-4" />,
      description: "Area & digital twin",
      category: "Manajemen Agronomi",
    },
    {
      title: "Tanaman",
      path: "/plant",
      icon: <Sprout className="w-4 h-4" />,
      description: "Varietas & siklus panen",
    },
    {
      title: "Sensor",
      path: "/sensor",
      icon: <Radio className="w-4 h-4" />,
      description: "Status node IoT telemetri",
    },
    {
      title: "Chatbot Tani",
      path: "/chatbot",
      icon: <MessageSquare className="w-4 h-4" />,
      description: "Asisten agronomis cerdas",
      category: "Kecerdasan Buatan",
      badge: "AI",
    },
    {
      title: "Deteksi Fase Padi",
      path: "/deteksi-fase-padi",
      icon: <Leaf className="w-4 h-4" />,
      description: "Computer Vision kamera",
      badge: "Vision",
    },
  ];

  const isCurrentPage = (path: string) => {
    if (path === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(path);
  };

  return (
    <aside
      className={`
        fixed top-0 bottom-0 left-0 z-50 flex flex-col
        bg-forest-900 text-bone-100 border-r border-forest-800 shadow-xl
        transition-all duration-300 ease-in-out select-none
        ${/* Mobile view */ ""}
        ${mobileOpen ? "translate-x-0 w-72" : "-translate-x-full"}
        ${/* Desktop view */ ""}
        lg:translate-x-0 ${open ? "lg:w-64" : "lg:w-[72px]"}
      `}
    >
      {/* Brand Logo Header */}
      <div className="h-16 px-4 border-b border-forest-800/90 flex items-center justify-between flex-shrink-0">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 overflow-hidden group"
          onClick={() => {
            if (setMobileOpen) setMobileOpen(false);
          }}
        >
          <div className="w-9 h-9 rounded-xl bg-emerald-600 border border-emerald-500/80 flex items-center justify-center flex-shrink-0 text-white shadow-2xs group-hover:scale-105 transition-transform">
            <Sprout className="w-5 h-5 text-white" />
          </div>
          {(open || mobileOpen) && (
            <div className="flex flex-col min-w-0">
              <span className="font-extrabold text-base text-bone-50 tracking-tight flex items-center gap-1.5">
                AgroTwin
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-950/80 text-emerald-300 font-bold border border-emerald-700/60">
                  AI Twin
                </span>
              </span>
              <span className="text-[10px] text-sage-400 truncate">Smart Farming Better Harvest</span>
            </div>
          )}
        </Link>

        {/* Desktop Collapse Toggle */}
        <button
          onClick={() => setOpen(!open)}
          className="hidden lg:flex items-center justify-center w-6 h-6 rounded-lg text-sage-400 hover:text-white hover:bg-forest-800 transition-colors"
          title={open ? "Perkecil Menu" : "Perluas Menu"}
        >
          {open ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
        </button>

        {/* Mobile Close Button */}
        {setMobileOpen && (
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-sage-300 hover:text-white hover:bg-forest-800"
            aria-label="Tutup Menu"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation Links Scrollable Area */}
      <div className="flex-1 py-3 px-2.5 overflow-y-auto space-y-0.5 scrollbar-thin scrollbar-thumb-forest-800">
        {Menus.map((menu, index) => {
          const active = isCurrentPage(menu.path);
          return (
            <div key={index}>
              {menu.category && (open || mobileOpen) && (
                <div className="px-3 pt-3.5 pb-1 text-[10px] font-bold text-sage-400/80 tracking-wider uppercase">
                  {menu.category}
                </div>
              )}
              {menu.category && !open && !mobileOpen && (
                <div className="my-2 border-t border-forest-800/80" />
              )}

              <Link
                href={menu.path}
                onClick={() => {
                  setActivePage(menu.title);
                  if (setMobileOpen) setMobileOpen(false);
                }}
                className={`
                  group flex items-center gap-3 px-2.5 py-2 rounded-xl text-xs font-semibold transition-all duration-150 relative
                  ${active
                    ? "bg-forest-800 text-wheat-300 border border-forest-700 shadow-2xs"
                    : "text-bone-200/80 hover:bg-forest-800/60 hover:text-bone-50"
                  }
                  ${!open && !mobileOpen ? "justify-center px-0 py-2.5" : ""}
                `}
                title={!open && !mobileOpen ? menu.title : undefined}
              >
                {/* Active Left Indicator */}
                {active && (
                  <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-wheat-400" />
                )}

                <div
                  className={`flex-shrink-0 transition-colors ${active ? "text-wheat-300" : "text-sage-400 group-hover:text-sage-200"
                    }`}
                >
                  {menu.icon}
                </div>

                {(open || mobileOpen) && (
                  <div className="flex-1 min-w-0 flex items-center justify-between gap-1">
                    <div className="flex flex-col min-w-0">
                      <span className="truncate leading-tight">{menu.title}</span>
                      <span className="text-[10px] text-sage-400/70 truncate group-hover:text-sage-300/80 font-normal">
                        {menu.description}
                      </span>
                    </div>

                    {menu.badge && (
                      <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-wheat-400/15 border border-wheat-400/30 text-wheat-300 uppercase tracking-wider flex-shrink-0">
                        {menu.badge}
                      </span>
                    )}
                  </div>
                )}
              </Link>
            </div>
          );
        })}
      </div>

      {/* User / Profile & Logout Footer */}
      <div className="p-2.5 border-t border-forest-800/90 bg-forest-950/60 space-y-2 flex-shrink-0">
        <Link
          href="/profil"
          onClick={() => {
            setActivePage("Profil");
            if (setMobileOpen) setMobileOpen(false);
          }}
          className={`
            flex items-center gap-2.5 p-2 rounded-xl transition-all bg-forest-800/70 border border-forest-700/60 hover:bg-forest-800
            ${!open && !mobileOpen ? "justify-center p-2" : ""}
          `}
          title={!open && !mobileOpen ? "Profil Pengguna" : undefined}
        >
          <div className="w-8 h-8 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center overflow-hidden flex-shrink-0">
            <User className="w-4 h-4 text-emerald-800" />
          </div>
          {(open || mobileOpen) && (
            <div className="flex-1 min-w-0 flex flex-col">
              <span className="text-xs font-bold text-bone-50 truncate leading-tight">Halo, Pak Suyanto</span>
              <span className="text-[10px] text-sage-400 truncate">Petani Mandiri</span>
            </div>
          )}
        </Link>

        {/* Quick Logout Button in Sidebar */}
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className={`
            w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all
            ${isLoggingOut
              ? "bg-rose-950/50 text-rose-300 cursor-wait opacity-90"
              : "text-rose-300/80 hover:bg-rose-950/40 hover:text-rose-200 active:scale-[0.98]"
            }
            ${!open && !mobileOpen ? "justify-center px-0 py-2" : ""}
          `}
          title={!open && !mobileOpen ? "Keluar Sistem" : undefined}
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {(open || mobileOpen) && (
            <span className="truncate block text-xs">
              {isLoggingOut ? "Memproses..." : "Keluar"}
            </span>
          )}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
