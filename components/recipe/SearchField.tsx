interface SearchFieldProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
}

/** Kolom cari resep berbentuk pil, dengan label yang terlihat. */
export default function SearchField({ id, value, onChange }: SearchFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="label-mono block mb-2">
        Cari resep
      </label>
      <div className="relative">
        <span
          aria-hidden="true"
          className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-ink-soft"
        >
          search
        </span>
        <input
          id={id}
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Nama resep..."
          className="field field-pill"
        />
      </div>
    </div>
  );
}
