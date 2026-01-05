"use client";

import { MdDashboard } from "react-icons/md";
import { Ri24HoursLine } from "react-icons/ri";
import { PiPlantFill } from "react-icons/pi";
import { MdOutlineSensors } from "react-icons/md";
import { CgProfile } from "react-icons/cg";
import { IoChatbubbleSharp } from "react-icons/io5";
import { FaLocationDot } from "react-icons/fa6";
import {
  Menu,
  X,
  Home,
  Clock,
  MapPin,
  Sprout,
  Radio,
  MessageSquare,
  User,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  activePage: string;
  setActivePage: React.Dispatch<React.SetStateAction<string>>;
}

const Sidebar: React.FC<SidebarProps> = ({
  open,
  setOpen,
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
      icon: <Home className="w-5 h-5" />,
      description: "Data real-time",
    },
    {
      title: "Riwayat",
      path: "/riwayat",
      icon: <Clock className="w-5 h-5" />,
      description: "Histori data",
    },
    {
      title: "Lahan",
      path: "/lahan",
      icon: <MapPin className="w-5 h-5" />,
      description: "Manajemen lahan",
      spacing: true,
    },
    {
      title: "Tanaman",
      path: "/plant",
      icon: <Sprout className="w-5 h-5" />,
      description: "Data tanaman",
    },
    {
      title: "Sensor",
      path: "/sensor",
      icon: <Radio className="w-5 h-5" />,
      description: "Manajemen sensor",
    },
    {
      title: "Chatbot",
      path: "/chatbot",
      icon: <MessageSquare className="w-5 h-5" />,
      description: "Asisten AI",
      spacing: true,
    },
    {
      title: "Deteksi Fase Padi",
      path: "/deteksi-fase-padi",
      icon: <Sprout className="w-5 h-5" />,
      description: "Analisis tanaman padi",
    },
  ];

  const currentPage =
    Menus.find((menu) => menu.path === pathname)?.title || "Dashboard";

  return (
    <div
      className={`${
        open ? "w-64" : "w-20"
      } h-screen bg-gradient-to-b from-gray-900 to-gray-800 shadow-2xl transition-all duration-300 ease-in-out flex flex-col fixed top-0 left-0 z-50 border-r border-gray-700`}
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-700 flex items-center justify-between">
        {open ? (
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center mr-3">
                <Home className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-xl font-bold text-white">KawalTani</h1>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center w-full">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center mb-2">
              <Home className="w-5 h-5 text-white" />
            </div>
            <button
              onClick={() => setOpen(true)}
              className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        )}
      </div>

      {/* Menu Items */}
      <div className="flex-grow py-6 overflow-y-auto">
        <ul className="space-y-1 px-3">
          {Menus.map((menu, index) => (
            <li key={index}>
              {menu.spacing && (
                <div
                  className={`${open ? "px-4 py-2" : "py-2"} ${
                    !open && "hidden"
                  }`}
                >
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {menu.spacing && "Manajemen"}
                  </span>
                </div>
              )}
              <Link href={menu.path} passHref>
                <div
                  className={`flex items-center p-3 rounded-xl transition-all duration-200 group cursor-pointer ${
                    currentPage === menu.title
                      ? "bg-gradient-to-r from-blue-500/20 to-indigo-500/20 border-l-4 border-blue-500"
                      : "hover:bg-gray-700/50"
                  } ${!open && "justify-center"}`}
                  onClick={() => setActivePage(menu.title)}
                >
                  <div className={`flex items-center ${open ? "w-full" : ""}`}>
                    <div
                      className={`flex items-center justify-center ${
                        currentPage === menu.title
                          ? "text-blue-400"
                          : "text-gray-400"
                      } group-hover:text-white transition-colors`}
                    >
                      {menu.icon}
                    </div>
                    {open && (
                      <div className="ml-4 flex-1">
                        <span
                          className={`font-medium ${
                            currentPage === menu.title
                              ? "text-white"
                              : "text-gray-300"
                          } group-hover:text-white transition-colors`}
                        >
                          {menu.title}
                        </span>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {menu.description}
                        </p>
                      </div>
                    )}
                  </div>
                  {currentPage === menu.title && open && (
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Profile Section */}
      <div className="border-t border-gray-700 p-4">
        <Link href="/profil" passHref>
          <div
            className={`flex items-center p-3 rounded-xl transition-all duration-200 cursor-pointer ${
              activePage === "Profil"
                ? "bg-gradient-to-r from-blue-500/20 to-indigo-500/20"
                : "hover:bg-gray-700/50"
            } ${!open && "justify-center"}`}
            onClick={() => setActivePage("Profil")}
          >
            <div className={`flex items-center ${open ? "w-full" : ""}`}>
              <div
                className={`flex items-center justify-center ${
                  activePage === "Profil" ? "text-blue-400" : "text-gray-400"
                } hover:text-white transition-colors`}
              >
                <User className="w-5 h-5" />
              </div>
              {open && (
                <div className="ml-4 flex-1">
                  <span
                    className={`font-medium ${
                      activePage === "Profil" ? "text-white" : "text-gray-300"
                    } hover:text-white transition-colors`}
                  >
                    Profil
                  </span>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Kelola akun Anda
                  </p>
                </div>
              )}
            </div>
            {activePage === "Profil" && open && (
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
            )}
          </div>
        </Link>
      </div>

      {/* Toggle Hint */}
      {!open && (
        <div className="absolute bottom-20 left-0 right-0 flex justify-center">
          <div className="bg-gray-800 text-gray-400 text-xs px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
            Klik untuk memperluas
          </div>
        </div>
      )}

      {/* Version */}
      {open && (
        <div className="px-4 py-3 border-t border-gray-700">
          <p className="text-xs text-gray-500 text-center">
            v1.0.0 • KawalTani System
          </p>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
