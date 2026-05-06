"use client";

import { useEffect, useState, useCallback } from "react";
import ProductionCard from "@/components/production/ProductionCard";
import SessionFooter from "@/components/production/SessionFooter";

interface Category {
  id: number;
  name: string;
}

interface Recipe {
  id: number;
  name: string;
  standardBatchKg: number;
  unit: string;
  isUrgent: boolean;
  category: Category;
}

export default function InputPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [batchCounts, setBatchCounts] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchRecipes = useCallback(async () => {
    const params = new URLSearchParams();
    if (activeCategory !== "all") params.set("category", activeCategory);
    if (searchQuery.trim()) params.set("search", searchQuery.trim());
    const res = await fetch(`/api/recipes?${params}`);
    const data = await res.json();
    setRecipes(data);
    setLoading(false);
  }, [activeCategory, searchQuery]);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then(setCategories);
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchRecipes();
  }, [fetchRecipes]);

  const handleIncrement = (recipeId: number) => {
    setBatchCounts((prev) => ({
      ...prev,
      [recipeId]: (prev[recipeId] || 0) + 1,
    }));
  };

  const handleDecrement = (recipeId: number) => {
    setBatchCounts((prev) => ({
      ...prev,
      [recipeId]: Math.max(0, (prev[recipeId] || 0) - 1),
    }));
  };

  const totalBatch = Object.values(batchCounts).reduce(
    (sum, v) => sum + v,
    0
  );

  const handleFinishSession = async () => {
    const entries = Object.entries(batchCounts)
      .filter(([, count]) => count > 0)
      .map(([recipeId, batchCount]) => ({
        recipeId: Number(recipeId),
        batchCount,
      }));

    if (entries.length === 0) return;

    setSubmitting(true);

    try {
      const res = await fetch("/api/productions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entries }),
      });

      if (res.ok) {
        const result = await res.json();
        setSuccessMessage(
          `✅ Sesi berhasil disimpan! ${result.totalBatch} batch, ${result.totalBahanKg} kg bahan terpakai.`
        );
        setBatchCounts({});
        setTimeout(() => setSuccessMessage(null), 5000);
      }
    } catch {
      setSuccessMessage("❌ Gagal menyimpan sesi. Coba lagi.");
      setTimeout(() => setSuccessMessage(null), 3000);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="px-[20px] md:px-[32px] max-w-7xl mx-auto pb-[140px] md:pb-[120px]">
      {/* Search and Category Tabs — sticky below TopAppBar */}
      <section className="sticky top-[64px] bg-background z-30 py-4 -mx-[20px] px-[20px] md:mx-0 md:px-0 space-y-4">
        {/* Search Bar */}
        <div className="relative w-full">
          <span className="material-symbols-outlined absolute left-[12px] top-1/2 -translate-y-1/2 text-outline">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari resep..."
            className="w-full h-[56px] pl-[44px] pr-[12px] rounded-lg bg-surface-container-high border-2 border-surface-container-high focus:border-secondary-container focus:bg-surface-container-lowest focus:ring-0 outline-none text-body-md font-[400] transition-all duration-200 shadow-[inset_0_2px_4px_rgba(74,50,31,0.02)]"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex overflow-x-auto no-scrollbar gap-[12px] pb-2">
          <button
            onClick={() => setActiveCategory("all")}
            className={`
              shrink-0 px-6 py-3 rounded-full font-[700] text-label-bold
              transition-transform active:scale-95
              ${
                activeCategory === "all"
                  ? "bg-primary text-on-primary shadow-soft-press"
                  : "bg-surface-container text-on-surface-variant shadow-soft-press border-2 border-transparent hover:border-outline-variant"
              }
            `}
          >
            Semua
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(String(cat.id))}
              className={`
                shrink-0 px-6 py-3 rounded-full font-[700] text-label-bold
                transition-transform active:scale-95
                ${
                  activeCategory === String(cat.id)
                    ? "bg-primary text-on-primary shadow-soft-press"
                    : "bg-surface-container text-on-surface-variant shadow-soft-press border-2 border-transparent hover:border-outline-variant"
                }
              `}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </section>

      {/* Success Toast */}
      {successMessage && (
        <div className="fixed top-20 left-0 right-0 mx-[20px] z-[70] animate-slide-up">
          <div className="bg-primary-container text-on-primary-container rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.25)] px-[20px] py-[16px] md:max-w-sm md:mx-auto">
            <p className="text-body-md font-[700] text-center">
              {successMessage}
            </p>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="text-center py-[48px]">
          <div className="inline-block w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="mt-[12px] text-body-md text-on-surface-variant">
            Memuat resep...
          </p>
        </div>
      )}

      {/* Recipe Cards Grid */}
      {!loading && (
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[20px] pt-[12px] stagger-children">
          {recipes.map((recipe) => (
            <ProductionCard
              key={recipe.id}
              id={recipe.id}
              name={recipe.name}
              batchCount={batchCounts[recipe.id] || 0}
              onIncrement={handleIncrement}
              onDecrement={handleDecrement}
            />
          ))}
        </section>
      )}

      {/* Empty State */}
      {!loading && recipes.length === 0 && (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-[32px] shadow-soft-press text-center">
          <span className="material-symbols-outlined text-[48px] text-outline mb-[12px]">
            restaurant
          </span>
          <p className="text-body-lg font-[500] text-on-surface">
            Belum ada resep
          </p>
          <p className="text-body-md text-on-surface-variant">
            Buat resep terlebih dahulu di halaman Manajemen Resep.
          </p>
        </div>
      )}

      {/* Session Footer */}
      <SessionFooter
        totalBatch={totalBatch}
        onFinishSession={handleFinishSession}
        submitting={submitting}
      />
    </div>
  );
}
