"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FaEye, FaEyeSlash, FaUser, FaLock } from "react-icons/fa";
import { Sprout, ShieldCheck, Activity } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

export default function LoginPage() {
  const [userName, setUserName] = useState("");
  const [userPass, setUserPass] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      router.push("/dashboard");
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          user_name: userName,
          user_pass: userPass,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Nama pengguna atau kata sandi tidak valid.");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#FAF9F6] text-[#1E2B1F]">
      {/* Left Banner: Agricultural Digital Twin Brand Info */}
      <div
        className="hidden md:flex md:w-1/2 min-h-screen bg-cover bg-center relative overflow-hidden"
        style={{ backgroundImage: "url('/assets/img/sawah.jpg')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-forest-950/90 via-forest-900/70 to-forest-800/60 flex flex-col justify-between p-12 lg:p-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sage-500/30 border border-sage-300/40 flex items-center justify-center text-wheat-300">
              <Sprout className="w-6 h-6" />
            </div>
            <span className="text-xl font-extrabold text-bone-50 tracking-tight">KawalTani <span className="text-xs px-2 py-0.5 rounded bg-sage-600/60 text-sage-200">System</span></span>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-bone-100 max-w-lg space-y-4"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest-800/80 border border-sage-500/30 text-xs font-semibold text-wheat-300">
              <Activity className="w-3.5 h-3.5" />
              Smart Monitoring & Precision Farming
            </div>
            <h1 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Platform Digital Twin & Telemetri Pertanian Cerdas
            </h1>
            <p className="text-sm lg:text-base text-bone-200 leading-relaxed">
              Pantau kondisi hara tanah secara real-time, dapatkan rekomendasi agronomik berbasis AI, dan tingkatkan efisiensi hasil panen secara berkelanjutan.
            </p>
          </motion.div>

          <div className="flex items-center justify-between text-xs text-sage-300/80 border-t border-forest-700/60 pt-4">
            <span>© 2026 KawalTani Precision Agriculture</span>
            <span>Versi 1.0.0</span>
          </div>
        </div>
      </div>

      {/* Right Form: Login Panel */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 sm:p-10 lg:p-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md bg-white border border-bone-300 rounded-3xl shadow-card p-8 sm:p-10"
        >
          {/* Header */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-forest-900 flex items-center justify-center text-wheat-300 mb-4 shadow-sm">
              <Sprout className="w-8 h-8" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-forest-900 tracking-tight">
              Selamat Datang
            </h2>
            <p className="text-sm text-sage-700 mt-1 font-medium">
              Masuk ke akun monitoring sistem Anda
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Username Input */}
            <div>
              <label
                className="block text-xs font-bold uppercase tracking-wider text-forest-800 mb-2"
                htmlFor="username"
              >
                Nama Pengguna
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-sage-600">
                  <FaUser className="text-sm" />
                </span>
                <input
                  id="username"
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-bone-50/50 border border-bone-300 rounded-xl text-sm font-medium text-forest-900 placeholder:text-sage-600/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sage-500/20 focus:border-sage-500 transition-all"
                  placeholder="Masukkan nama pengguna"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label
                className="block text-xs font-bold uppercase tracking-wider text-forest-800 mb-2"
                htmlFor="password"
              >
                Kata Sandi
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-sage-600">
                  <FaLock className="text-sm" />
                </span>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={userPass}
                  onChange={(e) => setUserPass(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 bg-bone-50/50 border border-bone-300 rounded-xl text-sm font-medium text-forest-900 placeholder:text-sage-600/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sage-500/20 focus:border-sage-500 transition-all"
                  placeholder="Masukkan kata sandi"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-sage-600 hover:text-forest-800 focus:outline-none"
                  aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                >
                  {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="p-3 rounded-xl bg-clay-50 border border-clay-200 text-clay-800 text-xs font-semibold flex items-center gap-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-clay-600 flex-shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3.5 px-4 rounded-xl text-sm font-bold text-white flex items-center justify-center space-x-2 transition-all shadow-md ${
                isLoading
                  ? "bg-sage-400 cursor-not-allowed"
                  : "bg-forest-900 hover:bg-forest-800 active:scale-[0.99] text-wheat-300"
              }`}
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4 text-wheat-300"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8H4z"
                    />
                  </svg>
                  <span>Memverifikasi akun...</span>
                </>
              ) : (
                <span>MASUK KE SISTEM</span>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

