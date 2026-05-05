import Link from "next/link";

interface Ingredient {
  id: number;
  ingredientName: string;
  quantity: number;
  unit: string;
}

interface RecipeCardProps {
  id: number;
  name: string;
  categoryName: string;
  categoryIcon: string | null;
  description: string | null;
  standardBatchKg: number;
  unit: string;
  ingredients: Ingredient[];
  variant?: "primary" | "secondary";
}

export default function RecipeCard({
  name,
  categoryName,
  categoryIcon,
  description,
  standardBatchKg,
  unit,
  ingredients,
  variant = "primary",
}: RecipeCardProps) {
  const borderColor =
    variant === "primary" ? "border-t-primary" : "border-t-secondary-container";

  return (
    <div className="bg-surface-container-lowest rounded-xl border border-surface-container-highest shadow-[0_4px_8px_rgba(74,50,31,0.04)] overflow-hidden">
      {/* Colored top border */}
      <div className={`border-t-4 ${borderColor}`} />

      <div className="p-[20px] md:p-[32px] flex flex-col md:flex-row gap-[32px]">
        {/* Recipe Info */}
        <div className="flex-1">
          {/* Header row */}
          <div className="flex justify-between items-start mb-[12px]">
            <div>
              <h2 className="text-headline-md font-[700] text-on-surface mb-[4px]">
                {name}
              </h2>
              <span className="inline-flex items-center px-[12px] py-1 rounded-full bg-surface-container-high text-on-surface-variant font-[700] text-[12px] border border-outline-variant">
                <span className="material-symbols-outlined text-[14px] mr-1">
                  {categoryIcon || "category"}
                </span>
                {categoryName}
              </span>
            </div>
            <div className="text-right">
              <span className="block font-[700] text-label-bold text-on-surface-variant">
                Standar Batch
              </span>
              <span className="text-body-lg font-[700] text-primary">
                {standardBatchKg} {unit}
              </span>
            </div>
          </div>

          {/* Description */}
          {description && (
            <p className="text-body-md font-[400] text-on-surface-variant mb-[20px]">
              {description}
            </p>
          )}

          {/* Ingredients List */}
          <div className="bg-surface-container-low rounded-lg p-[12px] border border-surface-container-highest">
            <h3 className="font-[700] text-label-bold text-on-surface mb-[4px] px-2 border-b border-surface-container-highest pb-2 flex items-center">
              <span className="material-symbols-outlined mr-2 text-primary">
                scale
              </span>
              Komposisi Bahan (1 Batch)
            </h3>
            <ul className="text-body-md font-[400] text-on-surface">
              {ingredients.map((ing) => (
                <li
                  key={ing.id}
                  className="flex justify-between py-2 px-2 border-b border-surface-container-high last:border-0 hover:bg-surface-container transition-colors"
                >
                  <span>{ing.ingredientName}</span>
                  <span className="font-bold text-secondary">
                    {ing.quantity} {ing.unit}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Action Area */}
        <div className="md:w-64 flex flex-col justify-end gap-[12px] md:border-l md:border-surface-container-high md:pl-[32px]">
          <Link
            href="/input"
            className="w-full h-[56px] rounded-lg font-[700] text-label-bold bg-primary text-on-primary shadow-[0_2px_4px_rgba(74,50,31,0.1)] active:scale-[0.98] transition-transform flex items-center justify-center"
          >
            <span className="material-symbols-outlined mr-2">add_task</span>
            Input Produksi
          </Link>
          <button className="w-full h-[56px] rounded-lg font-[700] text-label-bold border-2 border-tertiary text-tertiary hover:bg-surface-container-low active:scale-[0.98] transition-all flex items-center justify-center">
            <span className="material-symbols-outlined mr-2">edit</span>
            Edit Resep
          </button>
        </div>
      </div>
    </div>
  );
}
