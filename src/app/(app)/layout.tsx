"use client";

import Header from "../Components/header";
import Sidebar from "../Components/sidebar";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import AuthGuard from "../Components/AuthGuard";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
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
    // Close mobile menu on navigation
    setMobileMenuOpen(false);
  }, [pathname]);

  const isLoginPage = pathname === "/login";

  return (
    <AuthGuard>
      {isLoginPage ? (
        children
      ) : (
        <div className="min-h-screen bg-[#FAF9F6] text-[#1E2B1F] flex flex-col antialiased">
          {/* Mobile backdrop */}
          {mobileMenuOpen && (
            <div
              className="fixed inset-0 bg-forest-950/60 backdrop-blur-sm z-40 lg:hidden transition-opacity"
              onClick={() => setMobileMenuOpen(false)}
            />
          )}

          {/* Sidebar */}
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
            className={`flex-grow flex flex-col min-w-0 transition-all duration-300 ${
              sidebarOpen ? "lg:ml-64" : "lg:ml-20"
            }`}
          >
            <Header
              title={activePage}
              onToggleMobileMenu={() => setMobileMenuOpen((prev) => !prev)}
            />
            <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto">
              {children}
            </main>
          </div>
        </div>
      )}
    </AuthGuard>
  );
}
