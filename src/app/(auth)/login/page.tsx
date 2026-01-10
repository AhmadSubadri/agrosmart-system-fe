"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FaEye, FaEyeSlash, FaUser, FaLock } from "react-icons/fa";
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
        throw new Error(data.message || "Login gagal");
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
    <div className="flex flex-col md:flex-row h-screen bg-gradient-to-br from-teal-50 to-green-50">
      {/* Bagian Kiri (desktop) / Atas (mobile): Penjelasan */}
      <div
        className="hidden md:flex md:w-1/2 h-full bg-cover bg-center relative overflow-hidden"
        style={{ backgroundImage: "url('/assets/img/sawah.jpg')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-teal-900/70 to-teal-700/50 flex items-center justify-center p-6 md:p-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-white max-w-lg text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
              KawalTani
            </h1>
            <p className="text-base md:text-lg leading-relaxed">
              KawalTani adalah aplikasi berbasis web untuk pemantauan pertanian
              berbasis Digital Twin. Dapatkan informasi real-time tentang
              kondisi tanaman dan lahan, peringatan cerdas, serta rekomendasi
              berbasis data untuk pengelolaan lahan yang lebih efisien.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Bagian Kanan (desktop) / Bawah (mobile): Form Login */}
      <div className="w-full flex items-center justify-center p-6 md:w-1/2 md:p-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 md:p-10"
        >
          <div className="flex flex-col items-center justify-center">
            <Image
              src="/basic_logo2.png"
              alt="Logo KawalTani"
              width={150}
              height={150}
              priority
            />
            <h2 className="text-3xl font-bold text-teal-800 text-center">
              Selamat Datang di <br />
              <span className="text-emerald-600">KawalTani</span>
            </h2>

            <p className="text-gray-500 text-sm">
              Smart Monitoring for Smart Farming
            </p>
          </div>
          <br></br>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label
                className="block text-teal-700 text-sm font-medium mb-2"
                htmlFor="username"
              >
                Nama Pengguna
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-teal-500">
                  <FaUser />
                </span>
                <input
                  id="username"
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-teal-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition duration-300"
                  placeholder="Masukkan nama pengguna"
                  required
                  onInvalid={(e) =>
                    (e.target as HTMLInputElement).setCustomValidity(
                      "Nama pengguna harus diisi"
                    )
                  }
                  onInput={(e) =>
                    (e.target as HTMLInputElement).setCustomValidity("")
                  }
                />
              </div>
            </div>

            <div>
              <label
                className="block text-teal-700 text-sm font-medium mb-2"
                htmlFor="password"
              >
                Kata Sandi
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-teal-500">
                  <FaLock />
                </span>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={userPass}
                  onChange={(e) => setUserPass(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-teal-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition duration-300"
                  placeholder="Masukkan kata sandi"
                  required
                  onInvalid={(e) =>
                    (e.target as HTMLInputElement).setCustomValidity(
                      "Kata sandi harus diisi"
                    )
                  }
                  onInput={(e) =>
                    (e.target as HTMLInputElement).setCustomValidity("")
                  }
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-teal-500 hover:text-teal-700 focus:outline-none"
                >
                  {showPassword ? (
                    <FaEyeSlash size={20} />
                  ) : (
                    <FaEye size={20} />
                  )}
                </button>
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-red-500 text-sm text-center"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`w-full font-bold py-3 rounded-lg text-white flex items-center justify-center space-x-2 transition duration-300 ${
                isLoading
                  ? "bg-teal-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-teal-500 to-green-500 hover:from-teal-600 hover:to-green-600 shadow-lg"
              }`}
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-white"
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
                  <span>Memproses...</span>
                </>
              ) : (
                <span>MASUK</span>
              )}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
