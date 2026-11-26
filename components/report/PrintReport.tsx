"use client";

import { createPortal } from "react-dom";
import { SPOON_ESTIMATE_NOTE } from "@/lib/units";

export interface ReportRow {
  name: string;
  value: number;
}

export interface ReportSection {
  title: string;
  nameHeader: string;
  unit: string;
  rows: ReportRow[];
}

export const fmtNumber = (n: number) =>
  n.toLocaleString("id-ID", { maximumFractionDigits: 1, useGrouping: false });

interface PrintReportProps {
  periodLabel: string;
  dateRange: string;
  totalBatch: number;
  totalBahanKg: number;
  sections: ReportSection[];
}

/** Versi cetak laporan. Tidak tampil di layar; dipakai saat Simpan sebagai PDF. */
export default function PrintReport({
  periodLabel,
  dateRange,
  totalBatch,
  totalBahanKg,
  sections,
}: PrintReportProps) {
  return createPortal(
    <div className="print-report">
      <header className="flex items-center gap-4">
        {/* eslint-disable-next-line @next/next/no-img-element -- img biasa supaya pasti termuat saat dicetak */}
        <img
          src="/logo.jpg"
          alt="Logo warung"
          width={64}
          height={64}
          className="rounded-full"
        />
        <div>
          <h1 className="text-[20px] font-bold">Laporan Produksi</h1>
          <p className="mt-1">
            Periode {periodLabel}: {dateRange}
          </p>
        </div>
      </header>

      <table className="mt-4">
        <tbody>
          <tr>
            <th scope="row">Adonan selesai</th>
            <td className="num">{fmtNumber(totalBatch)} resep</td>
          </tr>
          <tr>
            <th scope="row">Bahan terpakai</th>
            <td className="num">{fmtNumber(totalBahanKg)} kg</td>
          </tr>
        </tbody>
      </table>

      {sections.map((s) => (
        <section key={s.title} className="mt-6">
          <h2 className="text-[15px] font-bold">{s.title}</h2>
          <table className="mt-2">
            <thead>
              <tr>
                <th className="num w-10">No</th>
                <th>{s.nameHeader}</th>
                <th className="num w-32">Jumlah ({s.unit})</th>
              </tr>
            </thead>
            <tbody>
              {s.rows.length === 0 ? (
                <tr>
                  <td colSpan={3}>Belum ada data di periode ini.</td>
                </tr>
              ) : (
                s.rows.map((r, i) => (
                  <tr key={r.name}>
                    <td className="num">{i + 1}</td>
                    <td>{r.name}</td>
                    <td className="num">{fmtNumber(r.value)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>
      ))}

      <p className="mt-6 text-[11px]">{SPOON_ESTIMATE_NOTE}</p>
    </div>,
    document.body
  );
}
