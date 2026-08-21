"use client";
import React, { useEffect, useState, useRef } from "react";
import { MoreVertical, Trash2 } from "lucide-react";
import { BsPencilSquare } from "react-icons/bs";
import { PiPencilSimpleLineFill } from "react-icons/pi";
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
import isToday from "dayjs/plugin/isToday";
import isYesterday from "dayjs/plugin/isYesterday";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import Modal from "./modal";

dayjs.extend(localizedFormat);
dayjs.extend(isToday);
dayjs.extend(isYesterday);
dayjs.extend(utc);
dayjs.extend(timezone);

dayjs.tz.setDefault("Asia/Jakarta");

interface HistoryItem {
  id: number;
  title: string;
  created_at: string;
}

type Category = "Hari Ini" | "Kemarin" | "Hari Sebelumnya";

export default function RiwayatChat({
  onSelectChat,
  onAddNewChat,
  selectedChatTitle,
  shouldRefresh,
  onRefreshDone,
  isUserLoggedIn,
}: {
  onSelectChat: (title: string) => void;
  onAddNewChat: () => void;
  selectedChatTitle: string | null;
  shouldRefresh: boolean;
  onRefreshDone: () => void;
  isUserLoggedIn: boolean;
}) {
  const [history, setHistory] = useState<Record<Category, HistoryItem[]>>({
    "Hari Ini": [],
    Kemarin: [],
    "Hari Sebelumnya": [],
  });

  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
  const [dropdownChatTitle, setDropdownChatTitle] = useState<string | null>(
    null
  );
  const [editingTitleId, setEditingTitleId] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState("");
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [chatToDelete, setChatToDelete] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement | null>(null);
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  useEffect(() => {
    const handleClickOutsideDropdown = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpenDropdownId(null);
        setDropdownChatTitle(null);
      }
    };

    const handleClickOutsideModal = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        cancelDelete();
      }
    };

    document.addEventListener("mousedown", handleClickOutsideDropdown);
    document.addEventListener("mousedown", handleClickOutsideModal);
    return () => {
      document.removeEventListener("mousedown", handleClickOutsideDropdown);
      document.removeEventListener("mousedown", handleClickOutsideModal);
    };
  }, [showDeleteConfirm]);

  const fetchHistory = async () => {
    if (!isUserLoggedIn) {
      setHistory({
        "Hari Ini": [],
        Kemarin: [],
        "Hari Sebelumnya": [],
      });
      onRefreshDone();
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const headers: HeadersInit = {
        "Content-Type": "application/json",
        "Accept": "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch(`${API_URL}/api/chat/names`, {
        headers,
      });

      if (res.status === 401) {
        console.warn(
          "Tidak dapat memuat riwayat chat: Pengguna tidak terautentikasi (401)."
        );
        setHistory({
          "Hari Ini": [],
          Kemarin: [],
          "Hari Sebelumnya": [],
        });
        onRefreshDone();
        return;
      }

      const data: { name_chat: string; created_at?: string; id?: number }[] =
        await res.json();

      const newGroupedHistory: Record<Category, HistoryItem[]> = {
        "Hari Ini": [],
        Kemarin: [],
        "Hari Sebelumnya": [],
      };

      const todayInTargetTimezone = dayjs().tz("Asia/Jakarta").startOf("day");
      const yesterdayInTargetTimezone = dayjs()
        .tz("Asia/Jakarta")
        .subtract(1, "day")
        .startOf("day");

      data.forEach((d, index) => {
        if (!d.name_chat || d.name_chat.trim().length === 0) return;

        const createdAt = d.created_at
          ? dayjs(d.created_at).tz("Asia/Jakarta", true)
          : dayjs().tz("Asia/Jakarta");

        let category: Category;
        if (createdAt.isSame(todayInTargetTimezone, "day")) {
          category = "Hari Ini";
        } else if (createdAt.isSame(yesterdayInTargetTimezone, "day")) {
          category = "Kemarin";
        } else {
          category = "Hari Sebelumnya";
        }

        newGroupedHistory[category].push({
          id: d.id || index,
          title: d.name_chat,
          created_at: d.created_at || dayjs().toISOString(),
        });
      });

      Object.keys(newGroupedHistory).forEach((cat) => {
        newGroupedHistory[cat as Category].sort(
          (a, b) =>
            dayjs(b.created_at).valueOf() - dayjs(a.created_at).valueOf()
        );
      });

      setHistory(newGroupedHistory);
      setOpenDropdownId(null);
      setDropdownChatTitle(null);
      onRefreshDone();
    } catch (err) {
      console.error("Gagal memuat riwayat:", err);
      onRefreshDone();
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [isUserLoggedIn]);

  useEffect(() => {
    if (shouldRefresh) {
      fetchHistory();
    }
  }, [shouldRefresh]);

  const handleSelect = (title: string) => {
    if (dropdownChatTitle !== title) {
      onSelectChat(title);
    }
  };

  const toggleDropdown = (id: number, title: string) => {
    if (openDropdownId === id) {
      setOpenDropdownId(null);
      setDropdownChatTitle(null);
    } else {
      setOpenDropdownId(id);
      setDropdownChatTitle(title);
    }
  };

  const handleDelete = async (title: string) => {
    if (!isUserLoggedIn) {
      alert("Anda harus login untuk menghapus riwayat chat.");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const headers: HeadersInit = {
        "Content-Type": "application/json",
        "Accept": "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch(
        `${API_URL}/api/chat/history/${encodeURIComponent(title)}`,
        {
          method: "DELETE",
          headers,
        }
      );
      if (!res.ok) {
        alert("Gagal menghapus riwayat chat");
        return;
      }
      await fetchHistory();
      setShowDeleteConfirm(false);
      setChatToDelete(null);
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan saat menghapus chat");
    }
  };

  const confirmDelete = (title: string) => {
    setChatToDelete(title);
    setShowDeleteConfirm(true);
    setOpenDropdownId(null);
    setDropdownChatTitle(null);
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setChatToDelete(null);
  };

  const submitRename = async (oldTitle: string) => {
    if (!isUserLoggedIn) {
      alert("Anda harus login untuk mengganti nama chat.");
      setEditingTitleId(null);
      return;
    }

    const newName = editingValue.trim();
    if (!newName || newName === oldTitle) {
      setEditingTitleId(null);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const headers: HeadersInit = {
        "Content-Type": "application/json",
        "Accept": "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch(
        `${API_URL}/api/chat/rename-chat/${encodeURIComponent(
          oldTitle
        )}`,
        {
          method: "PUT",
          headers: headers,
          body: JSON.stringify({ newName }),
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        if (
          res.status === 422 &&
          errorData.error === "Nama chat sudah digunakan oleh Anda"
        ) {
          alert("Nama chat sudah digunakan. Mohon gunakan nama lain.");
        } else {
          alert("Gagal mengganti nama chat");
        }
        return;
      }

      await fetchHistory();

      if (selectedChatTitle === oldTitle) {
        onSelectChat(newName);
      }

      setEditingTitleId(null);
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan saat mengganti nama chat");
    }
  };

  return (
    <div className="flex-1 overflow-y-auto space-y-4 text-xs">
      {!isUserLoggedIn && (
        <div className="p-4 text-center text-sage-600 bg-bone-50/60 rounded-xl border border-bone-200 m-2">
          <p>Login untuk menyimpan riwayat konsultasi Anda.</p>
        </div>
      )}

      {isUserLoggedIn &&
        (Object.keys(history) as Category[]).map((category) => {
          const chats = history[category] || [];
          const validChats = chats.filter(
            (chat) => chat.title && chat.title.trim().length > 0
          );

          if (validChats.length === 0) return null;

          return (
            <div key={category} className="space-y-1.5 px-1">
              <div className="px-3 pt-2 pb-1 text-[11px] font-bold text-sage-600 uppercase tracking-wider flex items-center justify-between">
                <span>{category}</span>
                <span className="text-[10px] px-1.5 py-0.2 bg-bone-200 text-forest-800 rounded-full font-semibold">
                  {validChats.length}
                </span>
              </div>

              <div className="space-y-1">
                {validChats.map((chat) => {
                  const isSelected =
                    selectedChatTitle === chat.title ||
                    dropdownChatTitle === chat.title;

                  return (
                    <div
                      key={chat.id}
                      onClick={() => handleSelect(chat.title)}
                      className={`group relative flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-150 ${
                        isSelected
                          ? "bg-sage-100 border border-sage-300 text-forest-950 font-semibold shadow-2xs"
                          : "text-forest-800 hover:bg-bone-100/70 border border-transparent"
                      }`}
                    >
                      {/* Left accent */}
                      {isSelected && (
                        <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-sage-600" />
                      )}

                      {editingTitleId === chat.id ? (
                        <input
                          autoFocus
                          value={editingValue}
                          onChange={(e) => setEditingValue(e.target.value)}
                          onBlur={() => submitRename(chat.title)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") submitRename(chat.title);
                            if (e.key === "Escape") setEditingTitleId(null);
                          }}
                          className="w-full bg-white px-2 py-1 rounded-lg border border-sage-400 text-xs font-medium text-forest-900 focus:outline-none focus:ring-1 focus:ring-sage-500"
                        />
                      ) : (
                        <span className="truncate max-w-[calc(100%-28px)] text-xs">
                          {chat.title}
                        </span>
                      )}

                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="relative flex-shrink-0"
                      >
                        <button
                          className={`p-1 rounded-lg text-sage-600 hover:text-forest-900 hover:bg-bone-200 transition-all ${
                            openDropdownId === chat.id
                              ? "opacity-100 bg-bone-200"
                              : "opacity-0 group-hover:opacity-100"
                          }`}
                          onClick={() => toggleDropdown(chat.id, chat.title)}
                          aria-label="Menu Opsi"
                        >
                          <MoreVertical className="w-3.5 h-3.5" />
                        </button>

                        {openDropdownId === chat.id && (
                          <div
                            ref={dropdownRef}
                            className="absolute right-0 mt-1.5 w-36 bg-white border border-bone-300 rounded-xl shadow-lg text-xs z-30 p-1 divide-y divide-bone-100"
                          >
                            <button
                              onClick={() => {
                                setEditingTitleId(chat.id);
                                setEditingValue(chat.title);
                                setOpenDropdownId(null);
                                setDropdownChatTitle(null);
                              }}
                              className="flex items-center w-full px-2.5 py-1.5 text-forest-800 rounded-lg hover:bg-bone-50 transition-colors gap-2"
                            >
                              <PiPencilSimpleLineFill className="w-3.5 h-3.5 text-sage-700" />
                              <span>Ganti Judul</span>
                            </button>
                            <button
                              onClick={() => confirmDelete(chat.title)}
                              className="flex items-center w-full px-2.5 py-1.5 text-clay-700 rounded-lg hover:bg-clay-50 transition-colors gap-2"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-clay-600" />
                              <span>Hapus Sesi</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

      {showDeleteConfirm && (
        <Modal>
          <div className="fixed inset-0 z-[9999] bg-forest-950/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div
              className="bg-white border border-bone-300 p-6 rounded-2xl shadow-xl max-w-sm w-full relative space-y-4"
              ref={modalRef}
            >
              <div className="flex items-center gap-3 text-clay-700">
                <div className="w-10 h-10 rounded-xl bg-clay-100 flex items-center justify-center flex-shrink-0">
                  <Trash2 className="w-5 h-5 text-clay-700" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-forest-900">Hapus Sesi Chat?</h3>
                  <p className="text-xs text-sage-700 mt-0.5">
                    Riwayat konsultasi ini akan dihapus secara permanen.
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-bone-200">
                <button
                  onClick={cancelDelete}
                  className="px-3.5 py-2 text-xs font-semibold text-forest-800 bg-bone-100 hover:bg-bone-200 rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={() => chatToDelete && handleDelete(chatToDelete)}
                  className="px-3.5 py-2 text-xs font-semibold text-white bg-clay-700 hover:bg-clay-800 rounded-xl transition-colors shadow-2xs"
                >
                  Hapus Percakapan
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
