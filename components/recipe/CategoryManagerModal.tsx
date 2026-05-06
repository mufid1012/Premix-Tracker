"use client";

import { useState } from "react";

interface Category {
  id: number;
  name: string;
  icon: string | null;
}

interface CategoryManagerModalProps {
  categories: Category[];
  isOpen: boolean;
  onClose: () => void;
  onAddCategory: (name: string, icon: string) => Promise<void>;
  onDeleteCategory: (id: number) => Promise<void>;
}

export default function CategoryManagerModal({
  categories,
  isOpen,
  onClose,
  onAddCategory,
  onDeleteCategory,
}: CategoryManagerModalProps) {
  const [newCatName, setNewCatName] = useState("");
  const [newCatIcon, setNewCatIcon] = useState("category");
  const [adding, setAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAdd = async () => {
    if (!newCatName.trim()) return;
    setError(null);
    setAdding(true);
    try {
      await onAddCategory(newCatName.trim(), newCatIcon);
      setNewCatName("");
      setNewCatIcon("category");
    } catch (err: any) {
      setError(err.message || "Gagal menambahkan kategori");
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus kategori ini?")) return;
    setError(null);
    setDeletingId(id);
    try {
      await onDeleteCategory(id);
    } catch (err: any) {
      setError(err.message || "Gagal menghapus kategori");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[60]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      <div
        className="
          absolute bottom-0 left-0 right-0
          md:bottom-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2
          bg-white rounded-t-2xl md:rounded-2xl
          md:max-w-md md:w-[90%]
          max-h-[85vh] overflow-y-auto
          shadow-[0_-8px_32px_rgba(0,0,0,0.25)]
          animate-slide-up flex flex-col
        "
      >
        {/* Header */}
        <div className="sticky top-0 bg-surface-container-lowest border-b border-outline-variant px-[20px] py-[16px] flex items-center justify-between z-10">
          <h2 className="text-headline-md font-[700] text-on-surface">
            Kelola Kategori
          </h2>
          <button
            onClick={onClose}
            className="w-[48px] h-[48px] rounded-full flex items-center justify-center hover:bg-surface-container-high active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-[20px] space-y-[24px]">
          {error && (
            <div className="p-3 bg-error-container text-on-error-container rounded-lg text-sm font-[700] flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">error</span>
              {error}
            </div>
          )}

          {/* Add Form */}
          <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant space-y-3">
            <h3 className="font-[700] text-label-bold text-on-surface">Tambah Kategori Baru</h3>
            <div className="flex gap-2">
              <div className="w-16">
                <input
                  type="text"
                  value={newCatIcon}
                  onChange={(e) => setNewCatIcon(e.target.value)}
                  placeholder="Ikon"
                  className="w-full h-[48px] px-2 rounded-lg bg-white border border-outline-variant focus:border-primary text-center text-xs"
                  title="Material Symbols Icon Name"
                />
              </div>
              <input
                type="text"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="Nama kategori"
                className="flex-1 h-[48px] px-3 rounded-lg bg-white border border-outline-variant focus:border-primary outline-none"
              />
              <button
                onClick={handleAdd}
                disabled={adding || !newCatName.trim()}
                className="h-[48px] px-4 rounded-lg bg-primary text-on-primary font-[700] disabled:opacity-50"
              >
                {adding ? "..." : "Tambah"}
              </button>
            </div>
          </div>

          {/* List */}
          <div className="space-y-2">
            <h3 className="font-[700] text-label-bold text-on-surface-variant">Kategori Tersedia</h3>
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center justify-between p-3 bg-surface-container-lowest border border-outline-variant rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary">
                    {cat.icon || "category"}
                  </span>
                  <span className="font-[700] text-body-md">{cat.name}</span>
                </div>
                <button
                  onClick={() => handleDelete(cat.id)}
                  disabled={deletingId === cat.id}
                  className="w-10 h-10 rounded-full text-error hover:bg-error-container/30 flex items-center justify-center disabled:opacity-50"
                  title="Hapus"
                >
                  {deletingId === cat.id ? (
                    <div className="w-4 h-4 border-2 border-error/30 border-t-error rounded-full animate-spin" />
                  ) : (
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
