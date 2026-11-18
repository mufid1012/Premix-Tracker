"use client";

import { useEffect, useId, useRef } from "react";

interface ModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

/**
 * Cangkang modal memakai <dialog> bawaan: Escape, perangkap fokus, dan
 * lapisan atas sudah ditangani browser. Lembar bawah di ponsel, tengah di desktop.
 */
export default function Modal({ title, onClose, children, footer }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    ref.current?.showModal();
    // React tidak menulis atribut autofocus ke DOM, jadi fokus awal diarahkan manual
    ref.current?.querySelector<HTMLElement>("[data-autofocus]")?.focus();
  }, []);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        // Klik di luar isi (area backdrop) menutup modal
        if (e.target === ref.current) onClose();
      }}
      className="animate-slide-up m-0 mt-auto w-full max-w-none max-h-[90dvh] md:m-auto md:max-w-lg bg-panel text-ink border border-line p-0 backdrop:bg-black/50"
    >
      <div className="flex flex-col max-h-[90dvh]">
        <div className="flex items-center justify-between border-b border-line bg-white pl-5">
          <h2 id={titleId} className="font-display text-[22px] uppercase tracking-[0.02em]">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="btn btn-icon h-14 w-14 border-l border-line hover:bg-paper"
          >
            <span aria-hidden="true" className="material-symbols-outlined">
              close
            </span>
          </button>
        </div>

        <div className="overflow-y-auto p-5 space-y-5">{children}</div>

        {footer && (
          <div className="border-t border-line bg-white p-4 flex gap-3">{footer}</div>
        )}
      </div>
    </dialog>
  );
}
