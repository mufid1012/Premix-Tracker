"use client";

import { useEffect, useState, useCallback } from "react";
import ProductionCard from "@/components/production/ProductionCard";
import SessionFooter from "@/components/production/SessionFooter";
import CategoryFilter from "@/components/recipe/CategoryFilter";
import SearchField from "@/components/recipe/SearchField";

interface Category {
  id: number;
  name: string;
}

interface Recipe {
  id: number;
  name: string;
  category: Category;
}

export default function InputPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [batchCounts, setBatchCounts] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ ok: boolean; text: string } | null>(null);

  const fetchRecipes = useCallback(async () => {
    const params = new URLSearchParams();
    if (activeCategory !== "all") params.set("category", activeCategory);
    if (searchQuery.trim()) params.set("search", searchQuery.trim());
    try {
      const res = await fetch(`/api/recipes?${params}`);
      if (!res.ok) throw new Error();
      setRecipes(await res.json());
      setLoadError(false);
    } catch {
      setRecipes([]);
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, [activeCategory, searchQuery]);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => (r.ok ? r.json() : []))
      .then(setCategories)
      .catch(() => {});
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

  const totalBatch = Object.values(batchCounts).reduce((sum, v) => sum + v, 0);

  const showToast = (ok: boolean, text: string) => {
    setToast({ ok, text });
    setTimeout(() => setToast(null), ok ? 5000 : 4000);
  };

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

      // Respons 4xx/5xx juga harus memunculkan pesan gagal (lihat catch)
      if (!res.ok) throw new Error();
      const result = await res.json();
      showToast(
        true,
        `Sesi tersimpan: ${result.totalBatch} resep, ${result.totalBahanKg} kg bahan terpakai.`
      );
      setBatchCounts({});
    } catch {
      showToast(false, "Gagal menyimpan sesi. Coba lagi.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <section className="row">
        <div className="frame px-4 py-8 md:py-12 text-center">
          <h1 className="h-display">Input Produksi</h1>
          <p className="mt-3 text-ink-soft">
            Tambah jumlah tiap resep yang selesai diolah, lalu simpan sesinya.
          </p>
        </div>
      </section>

      <section className="row sticky top-16 z-30 bg-paper">
        <div className="frame p-4 space-y-3">
          <SearchField id="cari-resep-input" value={searchQuery} onChange={setSearchQuery} />
          <CategoryFilter
            categories={categories}
            activeId={activeCategory}
            onSelect={setActiveCategory}
          />
        </div>
      </section>

      {toast && (
        <div
          role={toast.ok ? "status" : "alert"}
          className={`fixed top-20 inset-x-4 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-[28rem] z-[70] animate-slide-up px-5 py-4 text-center font-semibold ${
            toast.ok ? "bg-band text-white" : "bg-danger-soft text-danger border border-danger"
          }`}
        >
          {toast.text}
        </div>
      )}

      {loading && (
        <section className="row">
          <p role="status" className="frame px-4 py-12 text-center label-mono">
            Memuat resep...
          </p>
        </section>
      )}

      {!loading && recipes.length > 0 && (
        <section className="row" aria-label="Daftar resep">
          <div className="frame ruled-grid ruled-grid-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
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
          </div>
        </section>
      )}

      {!loading && recipes.length === 0 && (
        <section className="row">
          <div className="frame px-4 py-12 text-center">
            {loadError ? (
              <p role="alert" className="text-danger">
                Gagal memuat resep. Muat ulang halaman untuk mencoba lagi.
              </p>
            ) : searchQuery.trim() || activeCategory !== "all" ? (
              <p className="text-ink-soft">Tidak ada resep yang cocok dengan filter ini.</p>
            ) : (
              <>
                <p className="text-[18px] font-semibold">Belum ada resep</p>
                <p className="mt-1 text-ink-soft">
                  Buat resep terlebih dahulu di halaman Resep.
                </p>
              </>
            )}
          </div>
        </section>
      )}

      {/* Ruang agar footer sesi tidak menutupi kartu terakhir */}
      {totalBatch > 0 && <div aria-hidden="true" className="frame h-24" />}

      <SessionFooter
        totalBatch={totalBatch}
        onFinishSession={handleFinishSession}
        submitting={submitting}
      />
    </>
  );
}
