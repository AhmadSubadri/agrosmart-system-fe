"use client";

import {
  Home,
  MapPin,
  BarChart2,
  Lightbulb,
  FileText,
  Settings,
  LogOut,
  RefreshCw,
  Sprout,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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
  const [userName, setUserName] = useState("Pak Suyanto");
  const [userRole, setUserRole] = useState("Petani Mandiri");
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  useEffect(() => {
    try {
      const stored = localStorage.getItem("user");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.user_name) setUserName(parsed.user_name);
        if (parsed.name) setUserName(parsed.name);
      }
    } catch {
      // ignore
    }
  }, []);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
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

  // Menu items persis seperti pada referensi desain AgroTwin
  const Menus: MenuItem[] = [
    {
      title: "Dashboard",
      path: "/dashboard",
      icon: <Home className="w-5 h-5" />,
    },
    {
      title: "Lahan Saya",
      path: "/lahan",
      icon: <MapPin className="w-5 h-5" />,
    },
    {
      title: "Analitik",
      path: "/realtime",
      icon: <BarChart2 className="w-5 h-5" />,
    },
    {
      title: "Rekomendasi",
      path: "/chatbot",
      icon: <Lightbulb className="w-5 h-5" />,
    },
    {
      title: "Laporan",
      path: "/riwayat",
      icon: <FileText className="w-5 h-5" />,
    },
    {
      title: "Pengaturan",
      path: "/profil",
      icon: <Settings className="w-5 h-5" />,
    },
  ];

  const isCurrentPage = (path: string) => {
    if (path === "/dashboard") return pathname === "/dashboard" || pathname === "/";
    return pathname.startsWith(path);
  };

  return (
    <aside
      className={`
        fixed top-0 bottom-0 left-0 z-50 flex flex-col
        bg-white text-slate-800 border-r border-slate-200/90 shadow-sm
        transition-all duration-300 ease-in-out select-none
        ${mobileOpen ? "translate-x-0 w-64" : "-translate-x-full"}
        lg:translate-x-0 ${open ? "lg:w-64" : "lg:w-[76px]"}
      `}
    >
      {/* Brand Header */}
      <div className="h-20 px-5 flex items-center justify-between border-b border-slate-100 flex-shrink-0">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 overflow-hidden group"
          onClick={() => {
            if (setMobileOpen) setMobileOpen(false);
          }}
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center flex-shrink-0 text-white shadow-md group-hover:scale-105 transition-transform">
            <Sprout className="w-5 h-5" />
          </div>
          {(open || mobileOpen) && (
            <div className="flex flex-col min-w-0">
              <span className="font-black text-lg text-slate-900 tracking-tight leading-tight">
                AgroTwin
              </span>
              <span className="text-[11px] font-medium text-slate-400 truncate">
                Smart Farming Better Harvest
              </span>
            </div>
          )}
        </Link>

        {/* Mobile close button */}
        {mobileOpen && (
          <button
            onClick={() => setMobileOpen?.(false)}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation Menu List */}
      <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
        {Menus.map((menu) => {
          const active = isCurrentPage(menu.path);
          return (
            <Link
              key={menu.title}
              href={menu.path}
              onClick={() => {
                setActivePage(menu.title);
                if (setMobileOpen) setMobileOpen(false);
              }}
              className={`
                flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-sm font-bold transition-all duration-150
                ${
                  active
                    ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/20"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }
                ${!open && !mobileOpen ? "justify-center px-0 py-3" : ""}
              `}
              title={!open && !mobileOpen ? menu.title : undefined}
            >
              <div
                className={`flex-shrink-0 transition-colors ${
                  active ? "text-white" : "text-slate-400 group-hover:text-slate-600"
                }`}
              >
                {menu.icon}
              </div>

              {(open || mobileOpen) && (
                <span className="truncate">{menu.title}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User / Profile & Logout Footer */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/50 space-y-2 flex-shrink-0">
        <Link
          href="/profil"
          onClick={() => {
            setActivePage("Profil");
            if (setMobileOpen) setMobileOpen(false);
          }}
          className={`
            flex items-center gap-3 p-2.5 rounded-xl transition-all bg-white border border-slate-200/80 shadow-2xs hover:border-emerald-300
            ${!open && !mobileOpen ? "justify-center p-2" : ""}
          `}
          title={!open && !mobileOpen ? "Profil Pengguna" : undefined}
        >
          {/* Farmer Avatar */}
          <div className="w-9 h-9 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center overflow-hidden flex-shrink-0 text-emerald-800 font-bold text-xs">
            {userName.substring(0, 2).toUpperCase()}
          </div>

          {(open || mobileOpen) && (
            <div className="flex-1 min-w-0 flex flex-col text-left">
              <span className="text-xs font-bold text-slate-800 truncate leading-tight">
                Halo, {userName}
              </span>
              <span className="text-[11px] font-medium text-slate-400 truncate">
                {userRole}
              </span>
            </div>
          )}
        </Link>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className={`
            w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-all
            ${!open && !mobileOpen ? "justify-center px-0 py-2.5" : ""}
          `}
          title={!open && !mobileOpen ? "Keluar Sistem" : undefined}
        >
          <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
            {isLoggingOut ? (
              <RefreshCw className="w-4 h-4 animate-spin text-rose-500" />
            ) : (
              <LogOut className="w-4 h-4 text-slate-400" />
            )}
          </div>
          {(open || mobileOpen) && (
            <span className="truncate">
              {isLoggingOut ? "Memproses..." : "Keluar"}
            </span>
          )}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
