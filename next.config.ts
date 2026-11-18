import type { NextConfig } from "next";

// Batas "hari ini", minggu, dan bulan di dashboard/laporan dihitung dengan jam lokal
// proses server. Server cloud biasanya UTC, sehingga produksi sebelum 07.00 WIB akan
// masuk ke hari kemarin. Warung beroperasi di WIB, jadi zona waktu dikunci di sini.
process.env.TZ = "Asia/Jakarta";

const nextConfig: NextConfig = {};

export default nextConfig;
