"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useAdminFetch } from "@/components/PinProvider";
import SessionItem, { type Session } from "@/components/production/SessionItem";

interface Page {
  sessions: Session[];
  nextBefore: number | null;
}

const dayLabel = (iso: string) =>
  new Date(iso).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

/** Kelompokkan sesi per tanggal, urutan tetap terbaru dulu */
const groupByDay = (sessions: Session[]) => {
  const groups: Array<{ day: string; sessions: Session[] }> = [];
  for (const s of sessions) {
    const day = dayLabel(s.createdAt);
    const last = groups[groups.length - 1];
    if (last?.day === day) last.sessions.push(s);
    else groups.push({ day, sessions: [s] });
  }
  return groups;
};

export default function RiwayatPage() {
  const adminFetch = useAdminFetch();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [nextBefore, setNextBefore] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const fetchPage = useCallback(async (before: number | null) => {
    const res = await fetch(`/api/productions${before ? `?before=${before}` : ""}`);
    if (!res.ok) throw new Error();
    return (await res.json()) as Page;
  }, []);

  useEffect(() => {
    fetchPage(null)
      .then((page) => {
        setSessions(page.sessions);
        setNextBefore(page.nextBefore);
      })
      .catch(() => setLoadError(true))
      .finally(() => setLoading(false));
  }, [fetchPage]);

  const loadMore = async () => {
    if (!nextBefore) return;
    setLoadingMore(true);
    try {
      const page = await fetchPage(nextBefore);
      setSessions((prev) => [...prev, ...page.sessions]);
      setNextBefore(page.nextBefore);
    } catch {
      setMessage({ ok: false, text: "Gagal memuat sesi sebelumnya. Coba lagi." });
    } finally {
      setLoadingMore(false);
    }
  };


  return (
    <>
      <section className="row">
        <div className="frame px-4 py-8 md:py-12 text-center">
          <h1 className="h-display">Riwayat Sesi</h1>
          <p className="mt-3 text-ink-soft">
            Sesi produksi yang sudah disimpan. Ubah jumlah yang salah input, atau hapus sesinya.
          </p>
          <Link href="/input" className="btn btn-dark mt-6">
            <span aria-hidden="true" className="material-symbols-outlined">
              add
            </span>
            Input Produksi
          </Link>
        </div>
      </section>

      {message && (
        <section className="row">
          <p
            role={message.ok ? "status" : "alert"}
            className={`frame px-4 py-3 font-semibold ${
              message.ok ? "bg-white" : "bg-danger-soft text-danger"
            }`}
          >
            {message.text}
          </p>
        </section>
      )}

      {loading && (
        <section className="row">
          <p role="status" className="frame px-4 py-12 text-center label-mono">
            Memuat riwayat...
          </p>
        </section>
      )}

      {!loading && loadError && (
        <section className="row">
          <p role="alert" className="frame px-4 py-12 text-center text-danger">
            Gagal memuat riwayat. Muat ulang halaman untuk mencoba lagi.
          </p>
        </section>
      )}

      {!loading && !loadError && sessions.length === 0 && (
        <section className="row">
          <div className="frame px-4 py-12 text-center">
            <p className="text-[18px] font-semibold">Belum ada sesi tersimpan</p>
            <p className="mt-1 text-ink-soft">Sesi muncul di sini setelah disimpan di halaman Input.</p>
          </div>
        </section>
      )}

      {groupByDay(sessions).map((group) => (
        <section key={group.day} className="row">
          <div className="frame">
            <h2 className="band">{group.day}</h2>
            <ul className="ruled-grid">
              {group.sessions.map((s) => (
                <SessionItem
                  key={s.id}
                  session={s}
                  adminFetch={adminFetch}
                  onUpdated={(updated) =>
                    setSessions((prev) => prev.map((x) => (x.id === updated.id ? updated : x)))
                  }
                  onDeleted={(id) => setSessions((prev) => prev.filter((x) => x.id !== id))}
                  onMessage={setMessage}
                />
              ))}
            </ul>
          </div>
        </section>
      ))}

      {nextBefore && (
        <section className="row">
          <div className="frame p-4">
            <button
              type="button"
              onClick={loadMore}
              disabled={loadingMore}
              className="btn btn-line w-full"
            >
              {loadingMore ? "Memuat..." : "Muat Sesi Sebelumnya"}
            </button>
          </div>
        </section>
      )}
    </>
  );
}
