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

  // Fungsi untuk fetch profil (bisa dipanggil kapan saja)
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
      } else {
        alert("Gagal memuat profil");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan saat memuat profil");
    } finally {
      setLoading(false);
    }
  };

  // Load profile saat pertama kali render
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

      // Jika ingin ubah password
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
        alert(data.message);
        fetchProfile();
        setPasswordData({
          current_password: "",
          new_password: "",
          new_password_confirmation: "",
        });
      } else {
        alert(data.message || "Gagal update profil");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan saat update profil");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
          <p className="mt-4 text-gray-600">Memuat profil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Profil Saya</h1>
          <p className="text-gray-600 mt-2">
            Kelola informasi profil Anda dan amankan akun
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Kolom Kiri: Avatar dan Info Akun */}
          <div className="lg:col-span-1 space-y-8">
            {/* Kartu Avatar */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex flex-col items-center">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center mb-4 overflow-hidden border-4 border-white shadow-lg">
                    {profile?.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <UserCircle className="w-24 h-24 text-white" />
                    )}
                  </div>
                  <div className="absolute bottom-4 right-4 w-6 h-6 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
                <h2 className="text-xl font-bold text-gray-900">
                  {form.user_name}
                </h2>
                <p className="text-gray-600">{form.user_email}</p>

                <div className="mt-4 px-4 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                  {profile?.role_id === 1
                    ? "Administrator"
                    : profile?.role_id === 2
                    ? "Manager"
                    : `Role ${profile?.role_id}`}
                </div>
              </div>
            </div>

            {/* Kartu Informasi Akun */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Shield className="w-5 h-5 mr-2 text-gray-700" />
                Informasi Akun
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                      <span className="text-blue-600 font-semibold text-sm">
                        ID
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">User ID</p>
                      <p className="font-medium text-gray-900">
                        {profile?.user_id}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                        profile?.user_sts === "1"
                          ? "bg-green-100"
                          : "bg-red-100"
                      }`}
                    >
                      <CheckCircle
                        className={`w-4 h-4 ${
                          profile?.user_sts === "1"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Status</p>
                      <p
                        className={`font-medium ${
                          profile?.user_sts === "1"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {profile?.user_sts === "1" ? "Aktif" : "Nonaktif"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                      <Calendar className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Dibuat</p>
                      <p className="font-medium text-gray-900">
                        {profile?.user_created}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center mr-3">
                      <Clock className="w-4 h-4 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Terakhir diubah</p>
                      <p className="font-medium text-gray-900">
                        {profile?.user_updated}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Kolom Kanan: Form Edit Profil */}
          <div className="lg:col-span-2">
            {/* Kartu Edit Profil */}
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Edit Profil</h2>
                <div className="text-sm text-gray-500">
                  Semua bidang wajib diisi
                </div>
              </div>

              <div className="space-y-6">
                {/* Nama */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center">
                      <UserCircle className="w-4 h-4 mr-2" />
                      Nama Lengkap
                    </div>
                  </label>
                  <input
                    type="text"
                    name="user_name"
                    value={form.user_name}
                    onChange={handleFormChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Masukkan nama lengkap"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 mr-2" />
                      Alamat Email
                    </div>
                  </label>
                  <input
                    type="email"
                    name="user_email"
                    value={form.user_email}
                    onChange={handleFormChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Masukkan alamat email"
                  />
                </div>

                {/* No. HP */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 mr-2" />
                      Nomor Telepon
                    </div>
                  </label>
                  <input
                    type="text"
                    name="user_phone"
                    value={form.user_phone}
                    onChange={handleFormChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Masukkan nomor telepon"
                  />
                </div>

                {/* Section Password */}
                <div className="pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Key className="w-5 h-5 mr-2 text-gray-700" />
                    Ubah Password
                    <span className="ml-2 text-sm font-normal text-gray-500">
                      (opsional)
                    </span>
                  </h3>
                  <div className="space-y-4">
                    <input
                      type="password"
                      name="current_password"
                      placeholder="Password saat ini"
                      value={passwordData.current_password}
                      onChange={handlePasswordChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        type="password"
                        name="new_password"
                        placeholder="Password baru"
                        value={passwordData.new_password}
                        onChange={handlePasswordChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      />
                      <input
                        type="password"
                        name="new_password_confirmation"
                        placeholder="Konfirmasi password baru"
                        value={passwordData.new_password_confirmation}
                        onChange={handlePasswordChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* Tombol Simpan */}
                <div className="pt-6 border-t border-gray-200">
                  <button
                    onClick={updateProfile}
                    disabled={updating}
                    className="w-full md:w-auto px-8 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl"
                  >
                    {updating ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5 mr-2" />
                        Simpan Perubahan
                      </>
                    )}
                  </button>
                  <p className="mt-3 text-sm text-gray-500">
                    Pastikan semua informasi yang Anda masukkan sudah benar
                    sebelum menyimpan.
                  </p>
                </div>
              </div>
            </div>

            {/* Catatan */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
              <h4 className="font-semibold text-blue-900 mb-2">
                Tips Keamanan
              </h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>
                  • Gunakan password yang kuat dengan kombinasi huruf, angka,
                  dan simbol
                </li>
                <li>• Jangan bagikan informasi login Anda kepada siapapun</li>
                <li>• Perbarui password secara berkala untuk keamanan akun</li>
                <li>
                  • Pastikan email dan nomor telepon Anda aktif untuk verifikasi
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
