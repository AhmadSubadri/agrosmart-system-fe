"use client";

import Header from "../Components/header";
import Sidebar from "../Components/sidebar";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import AuthGuard from "../Components/AuthGuard";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activePage, setActivePage] = useState("");
  const pathname = usePathname();

  useEffect(() => {
    let title = "Dashboard";

    if (pathname.startsWith("/dashboard")) {
      title = "Dashboard";
    } else if (pathname.startsWith("/realtime")) {
      title = "Realtime";
    } else if (pathname.startsWith("/riwayat")) {
      title = "Riwayat";
    } else if (pathname.startsWith("/plant")) {
      title = pathname.includes("edit") ? "Edit Tanaman" : "Tanaman";
    } else if (pathname.startsWith("/sensor")) {
      title = pathname.includes("edit") ? "Edit Sensor" : "Sensor";
    } else if (pathname.startsWith("/profil")) {
      title = "Profil";
    }

    setActivePage(title);
  }, [pathname]);

  const isLoginPage = pathname === "/login";

  return (
    <AuthGuard>
      {isLoginPage ? (
        children
      ) : (
        <div className="flex">
          <Sidebar
            open={sidebarOpen}
            setOpen={setSidebarOpen}
            activePage={activePage}
            setActivePage={setActivePage}
          />
          <div
            className={`${
              sidebarOpen ? "ml-72" : "ml-20"
            } flex-grow transition-all duration-300`}
          >
            <Header title={activePage} />
            {children}
          </div>
        </div>
      )}
    </AuthGuard>
  );
}
