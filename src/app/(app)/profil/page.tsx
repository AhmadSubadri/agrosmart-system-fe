"use client";

import { useEffect, useState, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import {
  UserCircle,
  Mail,
  Phone,
  Key,
  Calendar,
  Shield,
  CheckCircle,
  Clock,
  Save,
  Loader2,
  Lock,
  User,
} from "lucide-react";

interface ProfileData {
  user_id: string;
  user_name: string;
  user_email: string;
  user_phone: string;
  role_id: number;
  user_sts: string;
  user_created: string;
  user_updated: string;
  avatar_url?: string;
}

export default function ProfilPage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const [form, setForm] = useState({
    user_name: "",
    user_email: "",
    user_phone: "",
  });

  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    new_password_confirmation: "",
  });

  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

  const fetchProfile = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      const data = await response.json();

      if (data.success) {
        setProfile(data.data);
        setForm({
          user_name: data.data.user_name,
          user_email: data.data.user_email,
          user_phone: data.data.user_phone,
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleFormChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const updateProfile = async () => {
    setUpdating(true);
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const payload: any = { ...form };

      if (passwordData.current_password && passwordData.new_password) {
        payload.current_password = passwordData.current_password;
        payload.new_password = passwordData.new_password;
        payload.new_password_confirmation =
          passwordData.new_password_confirmation;
      }

      const response = await fetch(`${API_URL}/api/profile`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        alert(data.message || "Profil berhasil diperbarui.");
        fetchProfile();
        setPasswordData({
          current_password: "",
          new_password: "",
          new_password_confirmation: "",
        });
      } else {
        alert(data.message || "Gagal memperbarui profil.");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan saat memperbarui profil.");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 text-sage-600 animate-spin" />
        <p className="mt-3 text-xs font-semibold text-sage-700">Memuat data profil...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-bone-300/80 rounded-2xl p-4 sm:p-6 shadow-soft">
        <h2 className="text-xl sm:text-2xl font-extrabold text-forest-900 tracking-tight">
          Profil & Pengaturan Akun
        </h2>
        <p className="text-sm text-sage-700 mt-0.5">
          Kelola kredensial operator dan identitas akun monitoring
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Kolom Kiri: Avatar & Info Status */}
        <div className="lg:col-span-4 space-y-6">
          {/* Avatar Card */}
          <div className="bg-white border border-bone-300 rounded-2xl shadow-soft p-6 text-center flex flex-col items-center">
            <div className="relative mb-3">
              <div className="w-24 h-24 rounded-2xl bg-forest-900 border-2 border-bone-200 flex items-center justify-center overflow-hidden text-wheat-300 shadow-soft">
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-12 h-12 text-wheat-300" />
                )}
              </div>
              <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-sage-500 rounded-full border-2 border-white" />
            </div>

            <h3 className="text-base font-extrabold text-forest-900">
              {form.user_name || "Operator KawalTani"}
            </h3>
            <p className="text-xs text-sage-700 font-medium">{form.user_email}</p>

            <div className="mt-3 px-3 py-1 bg-sage-100 border border-sage-200 text-forest-900 rounded-full text-xs font-bold">
              {profile?.role_id === 1
                ? "Administrator Utama"
                : profile?.role_id === 2
                ? "Manajer Agronomi"
                : `Operator Tingkat ${profile?.role_id || 1}`}
            </div>
          </div>

          {/* Account Meta Info */}
          <div className="bg-white border border-bone-300 rounded-2xl shadow-soft p-5">
            <h4 className="font-bold text-xs uppercase tracking-wider text-forest-800 mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4 text-forest-700" />
              Status & Keamanan Akun
            </h4>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-2.5 bg-bone-50/70 border border-bone-200 rounded-xl">
                <span className="text-sage-700 font-medium">ID Pengguna</span>
                <span className="font-bold text-forest-900">{profile?.user_id}</span>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-bone-50/70 border border-bone-200 rounded-xl">
                <span className="text-sage-700 font-medium">Status Akun</span>
                <span className="font-bold text-sage-700 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5 text-sage-600" />
                  {profile?.user_sts === "1" ? "Aktif Terverifikasi" : "Nonaktif"}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-bone-50/70 border border-bone-200 rounded-xl">
                <span className="text-sage-700 font-medium">Terdaftar</span>
                <span className="font-bold text-forest-900">{profile?.user_created || "-"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Form Edit Profil & Password */}
        <div className="lg:col-span-8 bg-white border border-bone-300 rounded-2xl shadow-soft p-6 sm:p-8 space-y-6">
          <div>
            <h3 className="font-bold text-forest-900 text-base">Informasi Personal</h3>
            <p className="text-xs text-sage-700">Perbarui kontak dan data identitas Anda</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-forest-800 mb-1.5">
                Nama Lengkap
              </label>
              <input
                type="text"
                name="user_name"
                value={form.user_name}
                onChange={handleFormChange}
                className="w-full px-3.5 py-2.5 bg-bone-50/50 border border-bone-300 rounded-xl text-xs sm:text-sm text-forest-900 focus:outline-none focus:ring-2 focus:ring-sage-500/20 focus:border-sage-500 font-medium"
                placeholder="Nama lengkap"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-forest-800 mb-1.5">
                  Alamat Email
                </label>
                <input
                  type="email"
                  name="user_email"
                  value={form.user_email}
                  onChange={handleFormChange}
                  className="w-full px-3.5 py-2.5 bg-bone-50/50 border border-bone-300 rounded-xl text-xs sm:text-sm text-forest-900 focus:outline-none focus:ring-2 focus:ring-sage-500/20 focus:border-sage-500 font-medium"
                  placeholder="Email"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-forest-800 mb-1.5">
                  Nomor Telepon
                </label>
                <input
                  type="text"
                  name="user_phone"
                  value={form.user_phone}
                  onChange={handleFormChange}
                  className="w-full px-3.5 py-2.5 bg-bone-50/50 border border-bone-300 rounded-xl text-xs sm:text-sm text-forest-900 focus:outline-none focus:ring-2 focus:ring-sage-500/20 focus:border-sage-500 font-medium"
                  placeholder="Nomor HP/WA"
                />
              </div>
            </div>
          </div>

          {/* Section Password */}
          <div className="pt-4 border-t border-bone-200">
            <div className="mb-4">
              <h4 className="font-bold text-forest-900 text-sm flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-forest-800" />
                Ganti Kata Sandi
              </h4>
              <p className="text-xs text-sage-700">Kosongkan jika tidak ingin mengubah kata sandi</p>
            </div>

            <div className="space-y-3">
              <div>
                <input
                  type="password"
                  name="current_password"
                  placeholder="Kata sandi saat ini"
                  value={passwordData.current_password}
                  onChange={handlePasswordChange}
                  className="w-full px-3.5 py-2.5 bg-bone-50/50 border border-bone-300 rounded-xl text-xs sm:text-sm text-forest-900 focus:outline-none focus:ring-2 focus:ring-sage-500/20 focus:border-sage-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="password"
                  name="new_password"
                  placeholder="Kata sandi baru"
                  value={passwordData.new_password}
                  onChange={handlePasswordChange}
                  className="w-full px-3.5 py-2.5 bg-bone-50/50 border border-bone-300 rounded-xl text-xs sm:text-sm text-forest-900 focus:outline-none focus:ring-2 focus:ring-sage-500/20 focus:border-sage-500"
                />
                <input
                  type="password"
                  name="new_password_confirmation"
                  placeholder="Ulangi kata sandi baru"
                  value={passwordData.new_password_confirmation}
                  onChange={handlePasswordChange}
                  className="w-full px-3.5 py-2.5 bg-bone-50/50 border border-bone-300 rounded-xl text-xs sm:text-sm text-forest-900 focus:outline-none focus:ring-2 focus:ring-sage-500/20 focus:border-sage-500"
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4 border-t border-bone-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <button
              onClick={updateProfile}
              disabled={updating}
              className="py-3 px-6 bg-forest-900 hover:bg-forest-800 text-wheat-300 font-bold text-xs sm:text-sm rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {updating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-wheat-300" />
                  <span>Menyimpan Profil...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Simpan Perubahan</span>
                </>
              )}
            </button>
            <span className="text-[11px] text-sage-700">Perubahan akan langsung diterapkan ke sesi Anda</span>
          </div>
        </div>
      </div>
    </div>
  );
}

