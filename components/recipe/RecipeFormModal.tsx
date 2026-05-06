"use client";

import { useState } from "react";

interface Category {
  id: number;
  name: string;
}

interface RecipeFormModalProps {
  categories: Category[];
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: RecipeFormData) => void;
}

export interface RecipeFormData {
  name: string;
  categoryId: number;
  description: string;
  standardBatchKg: number;
  unit: string;
  ingredients: Array<{ name: string; quantity: number; unit: string }>;
}

export default function RecipeFormModal({
  categories,
  isOpen,
  onClose,
  onSubmit,
}: RecipeFormModalProps) {
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState<number>(
    categories[0]?.id || 1
  );
  const [description, setDescription] = useState("");
  const [standardBatchKg, setStandardBatchKg] = useState<number>(5);
  const [unit, setUnit] = useState("Kg");
  const [ingredients, setIngredients] = useState([
    { name: "", quantity: 0, unit: "Kg" },
  ]);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const addIngredient = () => {
    setIngredients([...ingredients, { name: "", quantity: 0, unit: "Kg" }]);
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
    if (!name.trim() || standardBatchKg <= 0) return;

    const validIngredients = ingredients.filter(
      (ing) => ing.name.trim() && ing.quantity > 0
    );

    setSubmitting(true);
    await onSubmit({
      name: name.trim(),
      categoryId,
      description: description.trim(),
      standardBatchKg,
      unit,
      ingredients: validIngredients,
    });
    setSubmitting(false);

    // Reset
    setName("");
    setDescription("");
    setStandardBatchKg(5);
    setIngredients([{ name: "", quantity: 0, unit: "Kg" }]);
  };

  const inputClass =
    "w-full h-[56px] px-[16px] rounded-lg bg-surface-container-high border-2 border-surface-container-high focus:border-secondary-container focus:bg-surface-container-lowest focus:ring-0 outline-none text-body-md font-[400] transition-all duration-200";

  return (
    <div className="fixed inset-0 z-[60]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal — bottom sheet on mobile, centered on desktop */}
      <div
        className="
          absolute bottom-0 left-0 right-0
          md:bottom-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2
          bg-white rounded-t-2xl md:rounded-2xl
          md:max-w-lg md:w-[90%]
          max-h-[85vh] overflow-y-auto
          shadow-[0_-8px_32px_rgba(0,0,0,0.25)]
        "
      >
        {/* Header */}
        <div className="sticky top-0 bg-surface-container-lowest border-b border-outline-variant px-[20px] py-[16px] flex items-center justify-between z-10">
          <h2 className="text-headline-md font-[700] text-on-surface">
            Resep Baru
          </h2>
          <button
            onClick={onClose}
            className="w-[48px] h-[48px] rounded-full flex items-center justify-center hover:bg-surface-container-high active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Form */}
        <div className="p-[20px] space-y-[20px]">
          {/* Recipe Name */}
          <div>
            <label className="block text-label-bold font-[700] text-on-surface-variant mb-[8px]">
              Nama Resep *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Bumbu Merah Dasar"
              className={inputClass}
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-label-bold font-[700] text-on-surface-variant mb-[8px]">
              Kategori *
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(Number(e.target.value))}
              className={inputClass}
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Batch Size Row */}
          <div className="flex gap-[12px]">
            <div className="flex-1">
              <label className="block text-label-bold font-[700] text-on-surface-variant mb-[8px]">
                Standar Batch *
              </label>
              <input
                type="number"
                value={standardBatchKg}
                onChange={(e) => setStandardBatchKg(Number(e.target.value))}
                min={0.1}
                step={0.5}
                className={inputClass}
              />
            </div>
            <div className="w-24">
              <label className="block text-label-bold font-[700] text-on-surface-variant mb-[8px]">
                Unit
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className={inputClass}
              >
                <option value="Kg">Kg</option>
                <option value="Liter">Liter</option>
                <option value="Porsi">Porsi</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-label-bold font-[700] text-on-surface-variant mb-[8px]">
              Deskripsi
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Catatan tentang resep ini..."
              rows={2}
              className="w-full px-[16px] py-[12px] rounded-lg bg-surface-container-high border-2 border-surface-container-high focus:border-secondary-container focus:bg-surface-container-lowest focus:ring-0 outline-none text-body-md font-[400] transition-all duration-200 resize-none"
            />
          </div>

          {/* Ingredients */}
          <div>
            <label className="block text-label-bold font-[700] text-on-surface-variant mb-[8px]">
              Komposisi Bahan
            </label>

            <div className="space-y-[8px]">
              {ingredients.map((ing, idx) => (
                <div key={idx} className="flex gap-[8px] items-center">
                  <input
                    type="text"
                    value={ing.name}
                    onChange={(e) =>
                      updateIngredient(idx, "name", e.target.value)
                    }
                    placeholder="Nama bahan"
                    className="flex-1 h-[48px] px-[12px] rounded-lg bg-surface-container-high border border-outline-variant focus:border-secondary-container focus:bg-surface-container-lowest focus:ring-0 outline-none text-body-md transition-all"
                  />
                  <input
                    type="number"
                    value={ing.quantity || ""}
                    onChange={(e) =>
                      updateIngredient(idx, "quantity", Number(e.target.value))
                    }
                    placeholder="Qty"
                    min={0}
                    step={0.1}
                    className="w-20 h-[48px] px-[8px] rounded-lg bg-surface-container-high border border-outline-variant focus:border-secondary-container focus:bg-surface-container-lowest focus:ring-0 outline-none text-body-md text-center transition-all"
                  />
                  <select
                    value={ing.unit}
                    onChange={(e) =>
                      updateIngredient(idx, "unit", e.target.value)
                    }
                    className="w-16 h-[48px] px-[4px] rounded-lg bg-surface-container-high border border-outline-variant focus:border-secondary-container focus:ring-0 outline-none text-body-md transition-all"
                  >
                    <option value="Kg">Kg</option>
                    <option value="gr">gr</option>
                    <option value="ml">ml</option>
                    <option value="Liter">L</option>
                    <option value="bks">bks</option>
                  </select>
                  {ingredients.length > 1 && (
                    <button
                      onClick={() => removeIngredient(idx)}
                      className="w-[40px] h-[40px] rounded-full flex items-center justify-center text-error hover:bg-error-container/30 active:scale-95 transition-all"
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        delete
                      </span>
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={addIngredient}
              className="mt-[12px] w-full h-[48px] rounded-lg border-2 border-dashed border-outline-variant text-on-surface-variant font-[700] text-label-bold hover:bg-surface-container-high active:scale-[0.98] transition-all flex items-center justify-center gap-[8px]"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              Tambah Bahan
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-surface-container-lowest border-t border-outline-variant p-[20px] flex gap-[12px]">
          <button
            onClick={onClose}
            className="flex-1 h-[56px] rounded-lg font-[700] text-label-bold border-2 border-outline text-on-surface-variant hover:bg-surface-container-high active:scale-[0.98] transition-all"
          >
            Batal
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || !name.trim()}
            className="flex-1 h-[56px] rounded-lg font-[700] text-label-bold bg-primary text-on-primary shadow-soft-press active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-[8px]"
          >
            {submitting ? (
              <div className="w-5 h-5 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">
                  save
                </span>
                Simpan
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
