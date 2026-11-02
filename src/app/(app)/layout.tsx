"use client";

import Header from "../Components/header";
import Sidebar from "../Components/sidebar";
import Footer from "../Components/footer";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import AuthGuard from "../Components/AuthGuard";
import { Menu } from "lucide-react";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  // Sidebar expanded by default on desktop for professional appearance
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activePage, setActivePage] = useState("");
  const pathname = usePathname();

  useEffect(() => {
    let title = "Dashboard";

    if (pathname.startsWith("/dashboard")) {
      title = "Dashboard";
    } else if (pathname.startsWith("/realtime")) {
      title = "Realtime";
    } else if (pathname.startsWith("/riwayat")) {
      title = "Riwayat Data";
    } else if (pathname.startsWith("/lahan")) {
      title = "Manajemen Lahan";
    } else if (pathname.startsWith("/plant")) {
      title = pathname.includes("edit") ? "Edit Tanaman" : "Manajemen Tanaman";
    } else if (pathname.startsWith("/sensor")) {
      title = pathname.includes("edit") ? "Edit Sensor" : "Manajemen Sensor";
    } else if (pathname.startsWith("/chatbot")) {
      title = "Asisten AI Pertanian";
    } else if (pathname.startsWith("/deteksi-fase-padi")) {
      title = "Deteksi Fase Padi";
    } else if (pathname.startsWith("/profil")) {
      title = "Profil Akun";
    }

    setActivePage(title);
    setMobileMenuOpen(false);
  }, [pathname]);

  const isLoginPage = pathname === "/login";
  const isDashboard = pathname === "/dashboard" || pathname === "/";

  return (
    <AuthGuard>
      {isLoginPage ? (
        children
      ) : (
        <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col antialiased">
          {/* Mobile backdrop */}
          {mobileMenuOpen && (
            <div
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden transition-opacity"
              onClick={() => setMobileMenuOpen(false)}
            />
          )}

          {/* Sidebar (AgroTwin style) */}
          <Sidebar
            open={sidebarOpen}
            setOpen={setSidebarOpen}
            mobileOpen={mobileMenuOpen}
            setMobileOpen={setMobileMenuOpen}
            activePage={activePage}
            setActivePage={setActivePage}
          />

          {/* Main Content Area */}
          <div
            className={`flex-grow flex flex-col min-w-0 transition-all duration-300 ${pathname.startsWith("/chatbot") ? "h-screen overflow-hidden" : ""
              } ${sidebarOpen ? "lg:ml-64" : "lg:ml-[76px]"}`}
          >
            {/* Header: On dashboard, only render a minimal mobile bar so desktop has clean layout */}
            {isDashboard ? (
              <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200">
                <button
                  onClick={() => setMobileMenuOpen(true)}
                  className="p-1.5 rounded-lg text-slate-700 hover:bg-slate-100"
                  aria-label="Buka Menu"
                >
                  <Menu className="w-5 h-5" />
                </button>
                <span className="font-extrabold text-sm text-slate-800">
                  AgroTwin Dashboard
                </span>
                <div className="w-8" />
              </div>
            ) : (
              <Header
                title={activePage}
                onToggleMobileMenu={() => setMobileMenuOpen((prev) => !prev)}
              />
            )}

            {pathname.startsWith("/chatbot") ? (
              <main className="flex-1 w-full max-w-7xl mx-auto p-2 sm:p-3 md:p-4 overflow-hidden flex flex-col min-h-0">
                {children}
              </main>
            ) : (
              <>
                <main className="flex-1 p-3.5 sm:p-5 md:p-6 lg:p-7 max-w-[1400px] w-full mx-auto">
                  {children}
                </main>
                <Footer />
              </>
            )}
          </div>
        </div>
      )}
    </AuthGuard>
  );
}
