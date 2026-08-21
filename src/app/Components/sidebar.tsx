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
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  mobileOpen?: boolean;
  setMobileOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  activePage: string;
  setActivePage: React.Dispatch<React.SetStateAction<string>>;
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

  const Menus = [
    {
      title: "Dashboard",
      path: "/dashboard",
      icon: <Home className="w-5 h-5" />,
      description: "Overview sistem",
    },
    {
      title: "Realtime",
      path: "/realtime",
      icon: <Activity className="w-5 h-5" />,
      description: "Data telemetri",
    },
    {
      title: "Riwayat",
      path: "/riwayat",
      icon: <Clock className="w-5 h-5" />,
      description: "Histori & grafik",
    },
    {
      title: "Lahan",
      path: "/lahan",
      icon: <MapPin className="w-5 h-5" />,
      description: "Manajemen area lahan",
      category: "Manajemen Agronomi",
    },
    {
      title: "Tanaman",
      path: "/plant",
      icon: <Sprout className="w-5 h-5" />,
      description: "Katalog & komoditas",
    },
    {
      title: "Sensor",
      path: "/sensor",
      icon: <Radio className="w-5 h-5" />,
      description: "Node IoT & status",
    },
    {
      title: "Chatbot",
      path: "/chatbot",
      icon: <MessageSquare className="w-5 h-5" />,
      description: "Konsultasi cerdas tani",
      category: "Fitur Cerdas AI",
    },
    {
      title: "Deteksi Fase Padi",
      path: "/deteksi-fase-padi",
      icon: <Leaf className="w-5 h-5" />,
      description: "Analisis citra tanaman",
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
        bg-forest-900 text-bone-100 border-r border-forest-700/80 shadow-2xl
        transition-all duration-300 ease-in-out
        ${/* Mobile classes */ ""}
        ${mobileOpen ? "translate-x-0 w-72" : "-translate-x-full"}
        ${/* Desktop classes */ ""}
        lg:translate-x-0 ${open ? "lg:w-64" : "lg:w-20"}
      `}
    >
      {/* Header / Brand */}
      <div className="h-18 px-4 py-4 border-b border-forest-800 flex items-center justify-between">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-sage-500/20 border border-sage-400/30 flex items-center justify-center flex-shrink-0 text-sage-300">
            <Sprout className="w-5 h-5 text-wheat-400" />
          </div>
          {(open || mobileOpen) && (
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-base text-bone-50 tracking-tight flex items-center gap-1.5">
                KawalTani <span className="text-[10px] px-1.5 py-0.5 rounded bg-sage-700/60 text-sage-200 uppercase font-semibold">Pro</span>
              </span>
              <span className="text-xs text-sage-300/80 truncate">Smart Agriculture</span>
            </div>
          )}
        </div>

        {/* Desktop Collapse Toggle */}
        <button
          onClick={() => setOpen(!open)}
          className="hidden lg:flex items-center justify-center w-7 h-7 rounded-lg text-sage-300 hover:text-white hover:bg-forest-800 transition-colors"
          title={open ? "Perkecil Menu" : "Perluas Menu"}
        >
          {open ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>

        {/* Mobile Close Button */}
        {setMobileOpen && (
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-sage-300 hover:text-white hover:bg-forest-800"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-4 px-3 overflow-y-auto space-y-1">
        {Menus.map((menu, index) => {
          const active = isCurrentPage(menu.path);
          return (
            <div key={index}>
              {menu.category && (open || mobileOpen) && (
                <div className="px-3 pt-4 pb-1 text-[11px] font-semibold text-sage-400/70 tracking-wider uppercase">
                  {menu.category}
                </div>
              )}
              {menu.category && !open && !mobileOpen && (
                <div className="my-2 border-t border-forest-800" />
              )}

              <Link
                href={menu.path}
                onClick={() => {
                  setActivePage(menu.title);
                  if (setMobileOpen) setMobileOpen(false);
                }}
                className={`
                  group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative
                  ${
                    active
                      ? "bg-sage-600/30 text-wheat-200 border border-sage-500/40 shadow-sm"
                      : "text-bone-200/80 hover:bg-forest-800/80 hover:text-bone-50"
                  }
                  ${!open && !mobileOpen ? "justify-center px-0" : ""}
                `}
                title={!open && !mobileOpen ? menu.title : undefined}
              >
                {/* Active Indicator Bar */}
                {active && (
                  <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-wheat-400" />
                )}

                <div
                  className={`flex-shrink-0 transition-colors ${
                    active ? "text-wheat-300" : "text-sage-400 group-hover:text-sage-200"
                  }`}
                >
                  {menu.icon}
                </div>

                {(open || mobileOpen) && (
                  <div className="flex-1 min-w-0 flex flex-col">
                    <span className="truncate leading-snug">{menu.title}</span>
                    <span className="text-[11px] text-sage-400/70 truncate group-hover:text-sage-300/80 font-normal">
                      {menu.description}
                    </span>
                  </div>
                )}
              </Link>
            </div>
          );
        })}
      </div>

      {/* User / Profile footer */}
      <div className="p-3 border-t border-forest-800/80 bg-forest-950/40">
        <Link
          href="/profil"
          onClick={() => {
            setActivePage("Profil");
            if (setMobileOpen) setMobileOpen(false);
          }}
          className={`
            flex items-center gap-3 p-2.5 rounded-xl transition-colors
            ${
              pathname.startsWith("/profil")
                ? "bg-sage-600/30 text-wheat-200 border border-sage-500/40"
                : "text-bone-200/80 hover:bg-forest-800/80 hover:text-bone-50"
            }
            ${!open && !mobileOpen ? "justify-center" : ""}
          `}
          title={!open && !mobileOpen ? "Profil Akun" : undefined}
        >
          <div className="w-8 h-8 rounded-lg bg-clay-500/30 border border-clay-400/40 flex items-center justify-center text-wheat-300 flex-shrink-0">
            <User className="w-4 h-4" />
          </div>
          {(open || mobileOpen) && (
            <div className="flex-1 min-w-0 flex flex-col">
              <span className="text-xs font-semibold text-bone-100 truncate">Pengaturan Akun</span>
              <span className="text-[11px] text-sage-400/80 truncate">Kelola profil & sistem</span>
            </div>
          )}
        </Link>
      </div>
    </aside>
  );
};

export default Sidebar;

