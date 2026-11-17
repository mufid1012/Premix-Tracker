import Link from "next/link";
import { normalizeToKg } from "@/lib/units";

interface Ingredient {
  id: number;
  ingredientName: string;
  quantity: number;
  unit: string;
}

interface RecipeCardProps {
  name: string;
  categoryName: string;
  categoryIcon: string | null;
  description: string | null;
  ingredients: Ingredient[];
  onEdit: () => void;
}

export default function RecipeCard({
  name,
  categoryName,
  categoryIcon,
  description,
  ingredients,
  onEdit,
}: RecipeCardProps) {
  const totalBeratKg = ingredients.reduce(
    (sum, ing) => sum + normalizeToKg(ing.quantity, ing.unit),
    0
  );
  const totalBerat =
    totalBeratKg >= 1
      ? `${Math.round(totalBeratKg * 10) / 10} Kg`
      : `${Math.round(totalBeratKg * 1000)} gram`;

  return (
    <article className="bg-white grid md:grid-cols-[1fr_16rem]">
      <div className="p-5 md:p-8">
        <div className="flex justify-between items-start gap-4">
          <div>
            <h2 className="text-[22px] font-semibold leading-tight">{name}</h2>
            <p className="label-mono mt-2 flex items-center gap-1">
              <span aria-hidden="true" className="material-symbols-outlined text-[16px]">
                {categoryIcon || "category"}
              </span>
              {categoryName}
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="label-mono">Total berat</p>
            <p className="font-display text-[24px] leading-tight">{totalBerat}</p>
          </div>
        </div>

        {description && <p className="mt-4 text-ink-soft">{description}</p>}

        <h3 className="label-mono mt-6 mb-2">Komposisi bahan (1 resep)</h3>
        {ingredients.length === 0 ? (
          <p className="text-ink-soft">Belum ada bahan. Tambahkan lewat Edit Resep.</p>
        ) : (
          <ul className="border border-line divide-y divide-line">
            {ingredients.map((ing) => (
              <li key={ing.id} className="flex justify-between gap-4 px-3 py-2">
                <span>{ing.ingredientName}</span>
                <span className="font-mono text-[14px] shrink-0">
                  {ing.quantity} {ing.unit}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="p-5 md:p-8 flex flex-col justify-end gap-3 border-t md:border-t-0 md:border-l border-line">
        <Link href="/input" className="btn btn-dark w-full">
          <span aria-hidden="true" className="material-symbols-outlined">
            add_task
          </span>
          Input Produksi
        </Link>
        <button type="button" onClick={onEdit} className="btn btn-line w-full">
          <span aria-hidden="true" className="material-symbols-outlined">
            edit
          </span>
          Edit Resep
        </button>
      </div>
    </article>
  );
}
