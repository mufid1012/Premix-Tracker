"use client";

import { useEffect, useState } from "react";

export interface Category {
  id: number;
  name: string;
  icon: string | null;
}

const SEARCH_DELAY_MS = 250;

/**
 * Daftar resep + kategori dengan filter kategori dan pencarian, dipakai halaman
 * Input dan Resep. Pencarian ditunda sebentar saat mengetik, dan permintaan
 * lama dibatalkan supaya hasil lama tidak menimpa hasil baru.
 */
export function useRecipeList<R>({ sort }: { sort?: "popular" } = {}) {
  const [recipes, setRecipes] = useState<R[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loadedQuery, setLoadedQuery] = useState<string | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [refreshCount, setRefreshCount] = useState(0);

  const params = new URLSearchParams();
  if (sort) params.set("sort", sort);
  if (activeCategory !== "all") params.set("category", activeCategory);
  if (searchQuery.trim()) params.set("search", searchQuery.trim());
  const query = params.toString();

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => (r.ok ? r.json() : []))
      .then(setCategories)
      .catch(() => {});
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(
      () => {
        fetch(`/api/recipes?${query}`, { signal: controller.signal })
          .then((res) => {
            if (!res.ok) throw new Error();
            return res.json();
          })
          .then((data: R[]) => {
            setRecipes(data);
            setLoadError(false);
            setLoadedQuery(query);
          })
          .catch(() => {
            if (controller.signal.aborted) return;
            setRecipes([]);
            setLoadError(true);
            setLoadedQuery(query);
          });
      },
      searchQuery ? SEARCH_DELAY_MS : 0
    );
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
    // searchQuery hanya menentukan jeda; isi permintaan sudah tercakup di query
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, refreshCount]);

  return {
    recipes,
    categories,
    setCategories,
    activeCategory,
    setActiveCategory,
    searchQuery,
    setSearchQuery,
    /** Belum ada hasil sama sekali (tampilkan indikator memuat) */
    loading: loadedQuery === null,
    /** Daftar yang tampil belum sesuai filter terbaru */
    stale: loadedQuery !== query,
    loadError,
    refresh: () => setRefreshCount((n) => n + 1),
  };
}
