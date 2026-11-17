"use client";

import { useEffect, useState, useCallback } from "react";
import CategoryFilter from "@/components/recipe/CategoryFilter";
import SearchField from "@/components/recipe/SearchField";
import RecipeCard from "@/components/recipe/RecipeCard";
import RecipeFormModal, { type RecipeFormData } from "@/components/recipe/RecipeFormModal";
import CategoryManagerModal from "@/components/recipe/CategoryManagerModal";

interface Category {
  id: number;
  name: string;
  icon: string | null;
}

interface Ingredient {
  id: number;
  ingredientName: string;
  quantity: number;
  unit: string;
}

interface Recipe {
  id: number;
  name: string;
  description: string | null;
  standardBatchKg: number;
  unit: string;
  category: Category;
  ingredients: Ingredient[];
}

export default function ResepPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editRecipeData, setEditRecipeData] = useState<Recipe | null>(null);

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

  const handleCreateRecipe = async (data: RecipeFormData) => {
    const res = await fetch("/api/recipes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      setShowModal(false);
      fetchRecipes();
    } else {
      alert("Gagal menyimpan resep. Coba lagi.");
    }
  };

  const handleEditRecipe = async (data: RecipeFormData) => {
    if (!editRecipeData) return;
    const res = await fetch(`/api/recipes/${editRecipeData.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      setEditRecipeData(null);
      fetchRecipes();
    } else {
      alert("Gagal menyimpan resep. Coba lagi.");
    }
  };

  const handleDeleteRecipe = async (id: number) => {
    const res = await fetch(`/api/recipes/${id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setEditRecipeData(null);
      fetchRecipes();
    } else {
      const err = await res.json();
      alert(err.error || "Gagal menghapus resep");
    }
  };

  const handleAddCategory = async (name: string, icon: string) => {
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, icon }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Gagal menambah kategori");
    }
    const cat = await res.json();
    setCategories([...categories, cat]);
  };

  const handleDeleteCategory = async (id: number) => {
    const res = await fetch(`/api/categories/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Gagal menghapus kategori");
    }
    setCategories(categories.filter((c) => c.id !== id));
    if (activeCategory === String(id)) setActiveCategory("all");
  };

  return (
    <>
      <section className="row">
        <div className="frame px-4 py-8 md:py-12 text-center">
          <h1 className="h-display">Manajemen Resep</h1>
          <p className="mt-3 text-ink-soft">
            Proporsi standar bahan untuk 1 resep produksi.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row justify-center gap-3">
            <button type="button" onClick={() => setShowModal(true)} className="btn btn-dark">
              <span aria-hidden="true" className="material-symbols-outlined">
                add
              </span>
              Tambah Resep
            </button>
            <button
              type="button"
              onClick={() => setShowCategoryModal(true)}
              className="btn btn-line"
            >
              <span aria-hidden="true" className="material-symbols-outlined">
                category
              </span>
              Kelola Kategori
            </button>
          </div>
        </div>
      </section>

      <section className="row">
        <div className="frame p-4 space-y-3">
          <SearchField id="cari-resep" value={searchQuery} onChange={setSearchQuery} />
          <CategoryFilter
            categories={categories}
            activeId={activeCategory}
            onSelect={setActiveCategory}
          />
        </div>
      </section>

      {loading && (
        <section className="row">
          <p role="status" className="frame px-4 py-12 text-center label-mono">
            Memuat resep...
          </p>
        </section>
      )}

      {!loading && recipes.length > 0 && (
        <section className="row" aria-label="Daftar resep">
          <div className="frame ruled-grid">
            {recipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                name={recipe.name}
                categoryName={recipe.category.name}
                categoryIcon={recipe.category.icon}
                description={recipe.description}
                ingredients={recipe.ingredients}
                onEdit={() => setEditRecipeData(recipe)}
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
                  Buat resep pertama untuk mulai mencatat produksi.
                </p>
                <button
                  type="button"
                  onClick={() => setShowModal(true)}
                  className="btn btn-dark mt-6"
                >
                  Buat Resep Pertama
                </button>
              </>
            )}
          </div>
        </section>
      )}

      <RecipeFormModal
        categories={categories}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleCreateRecipe}
      />

      {editRecipeData && (
        <RecipeFormModal
          categories={categories}
          isOpen={true}
          onClose={() => setEditRecipeData(null)}
          onSubmit={handleEditRecipe}
          initialData={{
            id: editRecipeData.id,
            name: editRecipeData.name,
            categoryId: editRecipeData.category.id,
            description: editRecipeData.description || "",
            standardBatchKg: editRecipeData.standardBatchKg,
            unit: editRecipeData.unit,
            ingredients: editRecipeData.ingredients.map((ing) => ({
              name: ing.ingredientName,
              quantity: ing.quantity,
              unit: ing.unit,
            })),
          }}
          onDelete={handleDeleteRecipe}
        />
      )}

      <CategoryManagerModal
        categories={categories}
        isOpen={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        onAddCategory={handleAddCategory}
        onDeleteCategory={handleDeleteCategory}
      />
    </>
  );
}
