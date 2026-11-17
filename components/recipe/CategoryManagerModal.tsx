"use client";

import { useState } from "react";
import Modal from "./Modal";

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

const ICONS = [
  "category", "restaurant_menu", "fastfood", "local_pizza",
  "local_cafe", "set_meal", "soup_kitchen", "bakery_dining",
  "icecream", "liquor", "kitchen", "blender", "egg",
  "water_drop", "grass", "eco", "scale", "inventory_2",
  "lunch_dining", "ramen_dining", "takeout_dining", "local_dining",
  "brunch_dining", "rice_bowl", "cookie", "cake", "bento", "kebab_dining",
  "coffee", "grocery",
];

const errorMessage = (err: unknown, fallback: string) =>
  err instanceof Error && err.message ? err.message : fallback;

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
    } catch (err) {
      setError(errorMessage(err, "Gagal menambahkan kategori"));
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Hapus kategori ini?")) return;
    setError(null);
    setDeletingId(id);
    try {
      await onDeleteCategory(id);
    } catch (err) {
      setError(errorMessage(err, "Gagal menghapus kategori"));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Modal title="Kelola Kategori" onClose={onClose}>
      {error && (
        <p role="alert" className="p-3 bg-danger-soft text-danger border border-danger font-semibold">
          {error}
        </p>
      )}

      <section className="border border-line bg-white p-4 space-y-4">
        <h3 className="font-semibold">Tambah kategori baru</h3>
        <div>
          <label htmlFor="kategori-nama" className="label-mono block mb-2">
            Nama kategori
          </label>
          <div className="flex gap-2">
            <input
              id="kategori-nama"
              type="text"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              placeholder="Contoh: Sambal"
              className="field flex-1 min-w-0"
            />
            <button
              type="button"
              onClick={handleAdd}
              disabled={adding || !newCatName.trim()}
              className="btn btn-dark shrink-0"
            >
              {adding ? "..." : "Tambah"}
            </button>
          </div>
        </div>

        <fieldset>
          <legend className="label-mono mb-2">Ikon</legend>
          <div className="flex flex-wrap gap-1">
            {ICONS.map((icon) => (
              <button
                key={icon}
                type="button"
                onClick={() => setNewCatIcon(icon)}
                aria-label={icon.replace(/_/g, " ")}
                aria-pressed={newCatIcon === icon}
                className={`w-11 h-11 flex items-center justify-center border transition-colors ${
                  newCatIcon === icon
                    ? "bg-band border-band text-white"
                    : "border-line text-ink hover:bg-paper"
                }`}
              >
                <span aria-hidden="true" className="material-symbols-outlined text-[20px]">
                  {icon}
                </span>
              </button>
            ))}
          </div>
        </fieldset>
      </section>

      <section>
        <h3 className="label-mono mb-2">Kategori tersedia</h3>
        {categories.length === 0 ? (
          <p className="text-ink-soft">Belum ada kategori.</p>
        ) : (
          <ul className="border border-line bg-white divide-y divide-line">
            {categories.map((cat) => (
              <li key={cat.id} className="flex items-center justify-between pl-4">
                <span className="flex items-center gap-3">
                  <span aria-hidden="true" className="material-symbols-outlined text-ink-soft">
                    {cat.icon || "category"}
                  </span>
                  <span className="font-semibold">{cat.name}</span>
                </span>
                <button
                  type="button"
                  onClick={() => handleDelete(cat.id)}
                  disabled={deletingId === cat.id}
                  aria-label={`Hapus kategori ${cat.name}`}
                  className="btn btn-icon h-12 border-l border-line text-danger hover:bg-danger-soft"
                >
                  <span aria-hidden="true" className="material-symbols-outlined text-[20px]">
                    {deletingId === cat.id ? "hourglass_empty" : "delete"}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </Modal>
  );
}
