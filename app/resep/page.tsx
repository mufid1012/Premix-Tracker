"use client";

import { useEffect, useState, useCallback } from "react";
import CategoryFilter from "@/components/recipe/CategoryFilter";
import RecipeCard from "@/components/recipe/RecipeCard";
import RecipeFormModal, {
  type RecipeFormData,
} from "@/components/recipe/RecipeFormModal";
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
  const [showModal, setShowModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editRecipeData, setEditRecipeData] = useState<Recipe | null>(null);

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

  const handleCreateRecipe = async (data: RecipeFormData) => {
    const res = await fetch("/api/recipes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      setShowModal(false);
      fetchRecipes();
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
    <div className="p-[20px] max-w-5xl mx-auto">
      {/* Page Title & Search */}
      <div className="mb-[32px] flex flex-col md:flex-row md:items-center justify-between gap-[20px] pt-[32px]">
        <div>
          <h1 className="text-display-lg font-[800] tracking-[-0.02em] text-on-surface mb-[4px]">
            Manajemen Resep
          </h1>
          <p className="text-body-md font-[400] text-on-surface-variant">
            Panduan proporsi standar untuk 1 resep produksi.
          </p>
        </div>

        {/* Search + Add */}
        <div className="flex gap-[12px] w-full md:w-auto">
          <div className="relative flex-1 md:flex-none">
            <span className="material-symbols-outlined absolute left-[12px] top-1/2 -translate-y-1/2 text-outline">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari resep..."
              className="w-full md:w-80 h-[56px] pl-[44px] pr-[12px] rounded-lg bg-surface-container-high border-2 border-surface-container-high focus:border-secondary-container focus:bg-surface-container-lowest focus:ring-0 outline-none text-body-md font-[400] transition-all duration-200 shadow-[inset_0_2px_4px_rgba(74,50,31,0.02)]"
            />
          </div>
          <button
            onClick={() => setShowCategoryModal(true)}
            className="shrink-0 w-[56px] h-[56px] rounded-lg border-2 border-outline-variant text-on-surface-variant hover:bg-surface-container-high shadow-[0_2px_4px_rgba(74,50,31,0.02)] active:scale-95 transition-all flex items-center justify-center"
            title="Kelola Kategori"
          >
            <span className="material-symbols-outlined">category</span>
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="shrink-0 w-[56px] h-[56px] rounded-lg bg-primary text-on-primary shadow-soft-press active:scale-95 transition-transform flex items-center justify-center"
            title="Tambah Resep"
          >
            <span
              className="material-symbols-outlined"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              add
            </span>
          </button>
        </div>
      </div>

      {/* Category Filters */}
      <div className="mb-[24px]">
        <div className="w-full overflow-x-auto pb-2 hide-scrollbar">
          <CategoryFilter
            categories={categories}
            activeId={activeCategory}
            onSelect={setActiveCategory}
          />
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-[48px]">
          <div className="inline-block w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="mt-[12px] text-body-md text-on-surface-variant">
            Memuat resep...
          </p>
        </div>
      )}

      {/* Recipe List */}
      {!loading && (
        <div className="flex flex-col gap-[20px] stagger-children">
          {recipes.map((recipe, idx) => (
            <RecipeCard
              key={recipe.id}
              id={recipe.id}
              name={recipe.name}
              categoryName={recipe.category.name}
              categoryIcon={recipe.category.icon}
              description={recipe.description}
              ingredients={recipe.ingredients}
              variant={idx % 2 === 0 ? "primary" : "secondary"}
              onEdit={() => setEditRecipeData(recipe)}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && recipes.length === 0 && (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-[32px] shadow-soft-press text-center">
          <span
            className="material-symbols-outlined text-[48px] text-outline mb-[12px]"
            style={{ fontVariationSettings: "'FILL' 0" }}
          >
            restaurant_menu
          </span>
          <p className="text-body-lg font-[500] text-on-surface mb-[4px]">
            Belum ada resep
          </p>
          <p className="text-body-md text-on-surface-variant mb-[20px]">
            Buat resep pertama untuk memulai pencatatan produksi.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-[8px] bg-primary text-on-primary font-[700] text-label-bold px-[24px] py-[12px] rounded-lg active-press shadow-soft-press"
          >
            <span className="material-symbols-outlined">add</span>
            Buat Resep
          </button>
        </div>
      )}

      {/* Create Recipe Modal */}
      <RecipeFormModal
        categories={categories}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleCreateRecipe}
      />

      {/* Edit Recipe Modal */}
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

      {/* Category Manager Modal */}
      <CategoryManagerModal
        categories={categories}
        isOpen={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        onAddCategory={handleAddCategory}
        onDeleteCategory={handleDeleteCategory}
      />
    </div>
  );
}
