"use client";

import "./globals.css";
import Header from "./Components/header";
import Sidebar from "./Components/sidebar";
import Site from "./Components/dropdownSite";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activePage, setActivePage] = useState("Dashboard");
  const [selectedSite, setSelectedSite] = useState<string>("");
  const pathname = usePathname();

  const handleSiteChange = (value: string) => {
    setSelectedSite(value);
  };

  useEffect(() => {
    const pathMap: { [key: string]: string } = {
      "/realtime": "Realtime",
      "/riwayat": "Riwayat",
      "/plant": "Tanaman",
      "/plant/tambah-plant": "Tanaman",
      "/plant/edit-plant": "Tanaman",
      "/sensor": "Sensor",
      "/sensor/tambah-sensor": "Sensor",
      "/sensor/edit-sensor": "Sensor",
      "/profil": "Profil",
    };
    setActivePage(pathMap[pathname] || "Dashboard");
  }, [pathname]);

  const isLoginPage = pathname === "/login";

  return (
    <html lang="en">
      <body className="font-roboto" suppressHydrationWarning>
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
      </body>
    </html>
  );
}
