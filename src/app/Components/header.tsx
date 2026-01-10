"use client";

import { Bell, Search, Settings, Menu, HelpCircle } from "lucide-react";
import { useState } from "react";

export default function Header({ title }: { title: string }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications] = useState(3);

  return (
    <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-8 py-4">
        {/* Left Section - Title and Breadcrumb */}
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          <div className="flex items-center mt-1">
            <span className="text-sm text-gray-500">Kawal Tani</span>
            <span className="mx-2 text-gray-400">/</span>
            <span className="text-sm font-medium text-blue-600">{title}</span>
          </div>
        </div>

        {/* Right Section - Search and Actions */}
        <div className="flex items-center space-x-4">
          {/* Action Icons */}
          <div className="flex items-center space-x-3">
            {/* Help Button */}
            <button className="p-2.5 rounded-xl hover:bg-gray-100 transition-colors group relative">
              <HelpCircle className="h-5 w-5 text-gray-600 group-hover:text-blue-600" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
            </button>

            {/* User Profile */}
            <div className="flex items-center space-x-3 pl-3 border-l border-gray-200">
              <div className="flex flex-col items-end">
                <span className="font-medium text-gray-900">Dashboard</span>
                <span className="text-sm text-gray-500">Smart System</span>
              </div>
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold">
                  SS
                </div>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Search Bar */}
      <div className="md:hidden px-8 pb-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Cari di sistem..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2.5 w-full rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 transition-colors"
          />
        </div>
      </div>
    </div>
  );
}
