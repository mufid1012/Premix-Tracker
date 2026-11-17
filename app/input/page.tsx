"use client";

import { useEffect, useState, useCallback, useRef, useSyncExternalStore } from "react";
import Link from "next/link";
import ProductionCard from "@/components/production/ProductionCard";
import SessionFooter from "@/components/production/SessionFooter";
import CategoryFilter from "@/components/recipe/CategoryFilter";
import SearchField from "@/components/recipe/SearchField";
import { readDraft, writeDraft, type Counts } from "@/lib/draft";

type Toast = {
  ok: boolean;
  text: string;
  /** Sesi yang baru disimpan; ada selama tombol Batalkan masih ditawarkan */
  undo?: { sessionId: number; counts: Counts };
};

// false saat render server dan hidrasi, true setelahnya. Bagian yang
// bergantung pada draf di localStorage baru tampil setelah ini true.
const noopSubscribe = () => () => {};
const useIsClient = () => useSyncExternalStore(noopSubscribe, () => true, () => false);

const formatDraftTime = (iso: string) => {
  const d = new Date(iso);
  const sameDay = d.toDateString() === new Date().toDateString();
  return sameDay
    ? `hari ini pukul ${d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}`
    : d.toLocaleString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
};

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
  const isClient = useIsClient();
  // Draf dibaca sekali saat halaman dibuka (di server selalu kosong)
  const [initialDraft] = useState(() => (typeof window === "undefined" ? null : readDraft()));
  const [batchCounts, setBatchCounts] = useState<Counts>(initialDraft?.counts ?? {});
  const [restoredAt, setRestoredAt] = useState(initialDraft?.updatedAt ?? null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [undoing, setUndoing] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const lastWritten = useRef(JSON.stringify(initialDraft?.counts ?? {}));

  // Simpan draf setiap kali hitungan berubah
  useEffect(() => {
    const serialized = JSON.stringify(batchCounts);
    if (serialized === lastWritten.current) return;
    lastWritten.current = serialized;
    writeDraft(batchCounts);
  }, [batchCounts]);

  useEffect(() => () => clearTimeout(toastTimer.current), []);

  const fetchRecipes = useCallback(async () => {
    const params = new URLSearchParams({ sort: "popular" });
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

  const showToast = (next: Toast, ms: number) => {
    clearTimeout(toastTimer.current);
    setToast(next);
    toastTimer.current = setTimeout(() => setToast(null), ms);
  };

  const clearDraft = () => {
    setBatchCounts({});
    setRestoredAt(null);
  };

  // Hapus sesi yang baru disimpan dan kembalikan hitungannya untuk diperbaiki
  const handleUndo = async (sessionId: number, counts: Counts) => {
    setUndoing(true);
    try {
      const res = await fetch(`/api/productions/${sessionId}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setBatchCounts((prev) => {
        const merged = { ...prev };
        for (const [id, n] of Object.entries(counts)) merged[Number(id)] = (merged[Number(id)] || 0) + n;
        return merged;
      });
      showToast({ ok: true, text: "Sesi dibatalkan. Hitungannya dikembalikan untuk diperbaiki." }, 5000);
    } catch {
      showToast({ ok: false, text: "Gagal membatalkan sesi. Hapus lewat Riwayat Sesi." }, 6000);
    } finally {
      setUndoing(false);
    }
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
      // Tombol Batalkan ditawarkan 10 detik, cukup untuk menyadari salah tekan
      showToast(
        {
          ok: true,
          text: `Sesi tersimpan: ${result.totalBatch} resep, ${result.totalBahanKg} kg bahan terpakai.`,
          undo: { sessionId: result.sessionId, counts: batchCounts },
        },
        10000
      );
      clearDraft();
    } catch {
      showToast({ ok: false, text: "Gagal menyimpan sesi. Hitungan tetap tersimpan, coba lagi." }, 5000);
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
          <Link href="/riwayat" className="btn btn-line mt-6">
            <span aria-hidden="true" className="material-symbols-outlined">
              history
            </span>
            Riwayat Sesi
          </Link>
        </div>
      </section>

      {isClient && restoredAt && totalBatch > 0 && (
        <section className="row">
          <div className="frame px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-3 bg-white">
            <p className="flex-1">
              <span className="font-semibold">Hitungan belum disimpan dipulihkan</span>
              <span className="text-ink-soft"> (terakhir diubah {formatDraftTime(restoredAt)}).</span>
            </p>
            <button
              type="button"
              onClick={() => {
                if (confirm("Kosongkan semua hitungan yang belum disimpan?")) clearDraft();
              }}
              className="btn btn-line shrink-0"
            >
              Kosongkan
            </button>
          </div>
        </section>
      )}

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
          className={`fixed top-20 inset-x-4 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-[28rem] z-[70] animate-slide-up flex items-center gap-3 px-5 py-3 font-semibold ${
            toast.ok ? "bg-band text-white" : "bg-danger-soft text-danger border border-danger"
          }`}
        >
          <p className="flex-1 py-1">{toast.text}</p>
          {toast.undo && (
            <button
              type="button"
              disabled={undoing}
              onClick={() => handleUndo(toast.undo!.sessionId, toast.undo!.counts)}
              className="btn shrink-0 bg-white text-ink hover:bg-paper active:bg-panel"
            >
              {undoing ? "..." : "Batalkan"}
            </button>
          )}
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
      {isClient && totalBatch > 0 && <div aria-hidden="true" className="frame h-24" />}

      <SessionFooter
        totalBatch={isClient ? totalBatch : 0}
        onFinishSession={handleFinishSession}
        submitting={submitting}
      />
    </>
  );
}
