"use client";

import { useState } from "react";

export interface Session {
  id: number;
  createdAt: string;
  totalBatch: number;
  totalBahanKg: number;
  entries: Array<{ id: number; recipeName: string; batchCount: number }>;
}

type AdminFetch = (url: string, init?: RequestInit) => Promise<Response>;

interface SessionItemProps {
  session: Session;
  adminFetch: AdminFetch;
  onUpdated: (session: Session) => void;
  onDeleted: (id: number) => void;
  onMessage: (msg: { ok: boolean; text: string }) => void;
}

export const timeLabel = (iso: string) =>
  new Date(iso).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });

/** Satu sesi di Riwayat: lihat, ubah jumlah per resep, atau hapus. */
export default function SessionItem({
  session: s,
  adminFetch,
  onUpdated,
  onDeleted,
  onMessage,
}: SessionItemProps) {
  // Jumlah yang sedang diubah per entry; null = tidak dalam mode ubah
  const [draft, setDraft] = useState<Record<number, number> | null>(null);
  const [busy, setBusy] = useState(false);

  const startEdit = () => setDraft(Object.fromEntries(s.entries.map((e) => [e.id, e.batchCount])));

  const change = (id: number, delta: number) =>
    setDraft((d) => (d ? { ...d, [id]: Math.max(0, (d[id] ?? 0) + delta) } : d));

  const changed = !!draft && s.entries.some((e) => draft[e.id] !== e.batchCount);
  const allZero = !!draft && s.entries.every((e) => draft[e.id] === 0);

  const save = async () => {
    if (!draft || !changed) return setDraft(null);
    if (allZero && !confirm("Semua jumlah 0. Sesi ini akan dihapus. Lanjutkan?")) return;
    setBusy(true);
    try {
      const res = await adminFetch(`/api/productions/${s.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entries: s.entries
            .filter((e) => draft[e.id] !== e.batchCount)
            .map((e) => ({ id: e.id, batchCount: draft[e.id] })),
        }),
      });
      if (res.status === 401) return; // dialog PIN dibatalkan; tetap di mode ubah
      if (!res.ok) throw new Error();
      const result = await res.json();
      setDraft(null);
      if (result.deleted) {
        onDeleted(s.id);
        onMessage({ ok: true, text: `Sesi ${timeLabel(s.createdAt)} dihapus.` });
      } else {
        onUpdated(result.session);
        onMessage({ ok: true, text: `Jumlah sesi ${timeLabel(s.createdAt)} diperbarui.` });
      }
    } catch {
      onMessage({ ok: false, text: "Gagal menyimpan perubahan. Coba lagi." });
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    const ok = confirm(
      `Hapus sesi ${timeLabel(s.createdAt)} (${s.totalBatch} resep)? Angka di dashboard dan laporan akan berkurang. Tindakan ini tidak bisa dibatalkan.`
    );
    if (!ok) return;
    setBusy(true);
    try {
      const res = await adminFetch(`/api/productions/${s.id}`, { method: "DELETE" });
      if (res.status === 401) return;
      if (!res.ok) throw new Error();
      onDeleted(s.id);
      onMessage({ ok: true, text: `Sesi ${timeLabel(s.createdAt)} dihapus.` });
    } catch {
      onMessage({ ok: false, text: "Gagal menghapus sesi. Coba lagi." });
    } finally {
      setBusy(false);
    }
  };

  return (
    <li className="bg-white p-4 md:px-6 flex flex-col sm:flex-row gap-4">
      <div className="sm:w-40 shrink-0">
        <p className="font-display text-[28px] leading-none">{timeLabel(s.createdAt)}</p>
        <p className="label-mono mt-2">
          {s.totalBatch} resep, {s.totalBahanKg} kg
        </p>
      </div>

      <ul className="flex-1 border border-line divide-y divide-line self-start w-full">
        {s.entries.map((e) => (
          <li key={e.id} className="flex items-center justify-between gap-4 px-3 py-2">
            <span className={draft && draft[e.id] === 0 ? "text-ink-soft line-through" : ""}>
              {e.recipeName}
            </span>
            {draft ? (
              <span className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => change(e.id, -1)}
                  disabled={busy || draft[e.id] === 0}
                  aria-label={`Kurangi ${e.recipeName}`}
                  className="btn btn-line btn-icon h-11 w-11"
                >
                  <span aria-hidden="true" className="material-symbols-outlined">
                    remove
                  </span>
                </button>
                <span aria-live="polite" className="font-display text-[22px] w-8 text-center">
                  {draft[e.id]}
                </span>
                <button
                  type="button"
                  onClick={() => change(e.id, 1)}
                  disabled={busy}
                  aria-label={`Tambah ${e.recipeName}`}
                  className="btn btn-dark btn-icon h-11 w-11"
                >
                  <span aria-hidden="true" className="material-symbols-outlined">
                    add
                  </span>
                </button>
              </span>
            ) : (
              <span className="font-mono text-[14px] shrink-0">{e.batchCount} resep</span>
            )}
          </li>
        ))}
      </ul>

      <div className="flex sm:flex-col gap-2 shrink-0 self-start w-full sm:w-auto">
        {draft ? (
          <>
            <button type="button" onClick={save} disabled={busy} className="btn btn-dark flex-1">
              {busy ? "Menyimpan..." : changed ? "Simpan" : "Selesai"}
            </button>
            <button
              type="button"
              onClick={() => setDraft(null)}
              disabled={busy}
              className="btn btn-line flex-1"
            >
              Batal
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={startEdit}
              disabled={busy || s.entries.length === 0}
              className="btn btn-line flex-1"
            >
              <span aria-hidden="true" className="material-symbols-outlined text-[20px]">
                edit
              </span>
              Ubah Jumlah
            </button>
            <button
              type="button"
              onClick={remove}
              disabled={busy}
              className="btn btn-danger flex-1"
            >
              <span aria-hidden="true" className="material-symbols-outlined text-[20px]">
                delete
              </span>
              {busy ? "Menghapus..." : "Hapus Sesi"}
            </button>
          </>
        )}
      </div>
    </li>
  );
}
