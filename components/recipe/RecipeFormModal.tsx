"use client";

import { useState } from "react";
import { normalizeToKg } from "@/lib/units";
import Modal from "@/components/Modal";

interface Category {
  id: number;
  name: string;
}

/** Dipasang hanya saat terbuka; isian awal diambil dari initialData (edit) atau kosong (baru). */
interface RecipeFormModalProps {
  categories: Category[];
  onClose: () => void;
  onSubmit: (data: RecipeFormData) => Promise<void> | void;
  initialData?: RecipeFormData & { id: number };
  onDelete?: (id: number) => Promise<void> | void;
}

export interface RecipeFormData {
  name: string;
  categoryId: number;
  description: string;
  standardBatchKg: number;
  unit: string;
  ingredients: Array<{ name: string; quantity: number; unit: string }>;
}

const UNITS = [
  { value: "Kg", label: "Kg" },
  { value: "gr", label: "gr" },
  { value: "ml", label: "ml" },
  { value: "Liter", label: "L" },
  { value: "sdt", label: "sdt" },
  { value: "sdm", label: "sdm" },
];

const EMPTY_INGREDIENT = { name: "", quantity: 0, unit: "Kg" };

export default function RecipeFormModal({
  categories,
  onClose,
  onSubmit,
  initialData,
  onDelete,
}: RecipeFormModalProps) {
  const [name, setName] = useState(initialData?.name ?? "");
  const [chosenCategoryId, setCategoryId] = useState<number | undefined>(initialData?.categoryId);
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [ingredients, setIngredients] = useState(
    initialData?.ingredients.length ? initialData.ingredients : [EMPTY_INGREDIENT]
  );
  const [submitting, setSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Kategori bisa belum termuat saat modal dibuka; pakai yang pertama sebagai bawaan
  const categoryId = chosenCategoryId ?? categories[0]?.id;

  const addIngredient = () => {
    setIngredients([...ingredients, EMPTY_INGREDIENT]);
  };

  const removeIngredient = (idx: number) => {
    setIngredients(ingredients.filter((_, i) => i !== idx));
  };

  const updateIngredient = (
    idx: number,
    field: "name" | "quantity" | "unit",
    value: string | number
  ) => {
    const updated = [...ingredients];
    updated[idx] = { ...updated[idx], [field]: value };
    setIngredients(updated);
  };

  const handleSubmit = async () => {
    if (!name.trim() || categoryId === undefined) return;

    const validIngredients = ingredients.filter((ing) => ing.name.trim() && ing.quantity > 0);

    // Standar batch dihitung otomatis dari total berat bahan
    const totalBerat = validIngredients.reduce(
      (sum, ing) => sum + normalizeToKg(ing.quantity, ing.unit),
      0
    );

    setSubmitting(true);
    await onSubmit({
      name: name.trim(),
      categoryId,
      description: description.trim(),
      standardBatchKg: totalBerat > 0 ? totalBerat : 1,
      unit: "Kg",
      ingredients: validIngredients,
    });
    setSubmitting(false);
  };

  const footer = (
    <>
      {initialData && onDelete && (
        <button
          type="button"
          onClick={async () => {
            if (
              confirm(
                "Hapus resep ini? Riwayat produksi resep ini tetap tersimpan di laporan."
              )
            ) {
              setIsDeleting(true);
              await onDelete(initialData.id);
              setIsDeleting(false); // bila gagal atau PIN dibatalkan, tombol aktif lagi
            }
          }}
          disabled={isDeleting || submitting}
          aria-label="Hapus resep"
          className="btn btn-danger btn-icon h-12 shrink-0"
        >
          <span aria-hidden="true" className="material-symbols-outlined">
            {isDeleting ? "hourglass_empty" : "delete"}
          </span>
        </button>
      )}
      <button type="button" onClick={onClose} className="btn btn-line flex-1">
        Batal
      </button>
      <button
        type="button"
        onClick={handleSubmit}
        disabled={submitting || !name.trim()}
        className="btn btn-dark flex-1"
      >
        {submitting ? "Menyimpan..." : "Simpan Resep"}
      </button>
    </>
  );

  return (
    <Modal title={initialData ? "Edit Resep" : "Resep Baru"} onClose={onClose} footer={footer}>
      <div>
        <label htmlFor="resep-nama" className="label-mono block mb-2">
          Nama resep (wajib)
        </label>
        <input
          id="resep-nama"
          type="text"
          data-autofocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Contoh: Bumbu Merah Dasar"
          className="field"
        />
      </div>

      <div>
        <label htmlFor="resep-kategori" className="label-mono block mb-2">
          Kategori (wajib)
        </label>
        <select
          id="resep-kategori"
          value={categoryId ?? ""}
          onChange={(e) => setCategoryId(Number(e.target.value))}
          className="field"
        >
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="resep-deskripsi" className="label-mono block mb-2">
          Deskripsi
        </label>
        <textarea
          id="resep-deskripsi"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Catatan tentang resep ini..."
          rows={2}
          className="field py-3 resize-none"
        />
      </div>

      <fieldset>
        <legend className="label-mono mb-2">Komposisi bahan untuk 1 resep</legend>

        <div aria-hidden="true" className="flex gap-2 label-mono text-[11px] mb-1">
          <span className="flex-1">Bahan</span>
          <span className="w-16 sm:w-20 text-center">Jumlah</span>
          <span className="w-[4.5rem] sm:w-20">Satuan</span>
          {ingredients.length > 1 && <span className="w-12" />}
        </div>

        <div className="space-y-2">
          {ingredients.map((ing, idx) => (
            <div key={idx} className="flex gap-2 items-center">
              <input
                type="text"
                aria-label={`Nama bahan ${idx + 1}`}
                value={ing.name}
                onChange={(e) => updateIngredient(idx, "name", e.target.value)}
                placeholder="Nama bahan"
                className="field flex-1 min-w-0"
              />
              <input
                type="number"
                aria-label={`Jumlah bahan ${idx + 1}`}
                value={ing.quantity || ""}
                onChange={(e) => updateIngredient(idx, "quantity", Number(e.target.value))}
                placeholder="0"
                min={0}
                step={0.1}
                className="field w-16 sm:w-20 px-1 text-center"
              />
              <select
                aria-label={`Satuan bahan ${idx + 1}`}
                value={ing.unit}
                onChange={(e) => updateIngredient(idx, "unit", e.target.value)}
                className="field w-[4.5rem] sm:w-20 px-1"
              >
                {UNITS.map((u) => (
                  <option key={u.value} value={u.value}>
                    {u.label}
                  </option>
                ))}
              </select>
              {ingredients.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeIngredient(idx)}
                  aria-label={`Hapus bahan ${idx + 1}`}
                  className="btn btn-danger btn-icon h-12 shrink-0"
                >
                  <span aria-hidden="true" className="material-symbols-outlined text-[20px]">
                    delete
                  </span>
                </button>
              )}
            </div>
          ))}
        </div>

        <button type="button" onClick={addIngredient} className="btn btn-line w-full mt-3 border-dashed">
          <span aria-hidden="true" className="material-symbols-outlined text-[18px]">
            add
          </span>
          Tambah Bahan
        </button>
      </fieldset>
    </Modal>
  );
}
