"use client";

import { createContext, useCallback, useContext, useState } from "react";
import Modal from "./Modal";

type AdminFetch = (url: string, init?: RequestInit) => Promise<Response>;

const AdminFetchContext = createContext<AdminFetch>((url, init) => fetch(url, init));

/** fetch untuk aksi pemilik: bila server minta PIN, tampilkan dialog PIN lalu ulangi sekali. */
export const useAdminFetch = () => useContext(AdminFetchContext);

export default function PinProvider({ children }: { children: React.ReactNode }) {
  const [resolvePin, setResolvePin] = useState<((ok: boolean) => void) | null>(null);

  const adminFetch = useCallback<AdminFetch>(async (url, init) => {
    const res = await fetch(url, init);
    if (res.status !== 401) return res;
    const body = await res.clone().json().catch(() => null);
    if (!body?.needPin) return res;
    const unlocked = await new Promise<boolean>((resolve) => setResolvePin(() => resolve));
    return unlocked ? fetch(url, init) : res;
  }, []);

  const finish = (ok: boolean) => {
    resolvePin?.(ok);
    setResolvePin(null);
  };

  return (
    <AdminFetchContext.Provider value={adminFetch}>
      {children}
      {resolvePin && <PinDialog onDone={finish} />}
    </AdminFetchContext.Provider>
  );
}

function PinDialog({ onDone }: { onDone: (ok: boolean) => void }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setChecking(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });
      if (res.ok) return onDone(true);
      const body = await res.json().catch(() => null);
      setError(body?.error || "PIN salah");
      setPin("");
    } catch {
      setError("Gagal memeriksa PIN. Coba lagi.");
    } finally {
      setChecking(false);
    }
  };

  return (
    <Modal title="PIN Pemilik" onClose={() => onDone(false)}>
      <form onSubmit={submit} className="space-y-4">
        <p className="text-ink-soft">
          Mengubah resep, kategori, atau menghapus sesi butuh PIN pemilik. Perangkat ini tetap
          terbuka selama 12 jam setelah PIN benar.
        </p>
        <div>
          <label htmlFor="pin-pemilik" className="label-mono block mb-2">
            PIN
          </label>
          <input
            id="pin-pemilik"
            type="password"
            inputMode="numeric"
            autoComplete="off"
            data-autofocus
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            className="field text-center text-[24px] tracking-[0.3em]"
          />
        </div>
        {error && (
          <p role="alert" className="p-3 bg-danger-soft text-danger border border-danger font-semibold">
            {error}
          </p>
        )}
        <div className="flex gap-3">
          <button type="button" onClick={() => onDone(false)} className="btn btn-line flex-1">
            Batal
          </button>
          <button type="submit" disabled={checking || !pin.trim()} className="btn btn-dark flex-1">
            {checking ? "Memeriksa..." : "Buka"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
