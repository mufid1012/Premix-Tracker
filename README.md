# Produksi Dapur

Aplikasi pencatatan produksi resep untuk warung: staf menambah jumlah resep yang selesai diolah, menyimpannya per sesi, lalu pemilik melihat ringkasan harian, mingguan, dan bulanan beserta pemakaian bahan.

Dibangun dengan Next.js 16 (App Router), Prisma 7, dan MySQL/MariaDB.

## Halaman

| Halaman | Isi |
|---|---|
| Dashboard (`/`) | Total resep dan bahan hari ini, tren bahan 7 hari |
| Input (`/input`) | Penghitung per resep (urut dari yang paling sering dibuat), simpan sesi, tombol Batalkan 10 detik |
| Riwayat (`/riwayat`) | Sesi tersimpan per tanggal, hapus sesi yang salah input |
| Resep (`/resep`) | Kelola resep, komposisi bahan, dan kategori |
| Laporan (`/laporan`) | Ringkasan per hari/minggu/bulan, periode sebelumnya, unduh CSV |

Hitungan di halaman Input disimpan sebagai draf di perangkat, jadi tidak hilang saat halaman di-refresh.

## Menjalankan di komputer sendiri

```bash
npm install
cp .env.example .env        # isi DATABASE_URL (dan ADMIN_PIN bila perlu)
npx prisma migrate deploy   # buat/perbarui tabel
npm run db:seed             # opsional: data contoh
npm run dev                 # http://localhost:3000
```

## Konfigurasi (`.env`)

| Variabel | Keterangan |
|---|---|
| `DATABASE_URL` | Koneksi MySQL/MariaDB, mis. `mysql://user:pass@localhost:3306/produksi_dapur` |
| `ADMIN_PIN` | PIN pemilik. Bila diisi, menambah/mengubah/menghapus resep dan kategori serta menghapus sesi lewat Riwayat butuh PIN (berlaku 12 jam per perangkat). Kosong = tanpa PIN. |

## Perintah

| Perintah | Fungsi |
|---|---|
| `npm run dev` | Server pengembangan |
| `npm run build` / `npm start` | Build dan jalankan versi produksi |
| `npm run check` | Semua pengecekan sekaligus: lint, typecheck, tes, build. Jalankan sebelum commit. |
| `npm run lint` / `npm run typecheck` | ESLint / TypeScript |
| `npm test` | Tes unit (konversi satuan, draf, periode laporan, PIN, validasi resep) |
| `npm run db:migrate:deploy` | Terapkan migrasi ke database |
| `npm run db:backup` | Backup database ke `backups/` (14 hari terakhir disimpan) |

## Backup otomatis (Mac dengan database lokal)

```bash
bash scripts/install-backup-schedule.sh              # pasang: tiap hari 23.00
bash scripts/install-backup-schedule.sh --uninstall  # lepas
```

Hasil ada di `backups/produksi-dapur-YYYY-MM-DD-HHmm.sql`, log di `backups/backup.log`. Folder `backups/` tidak masuk git. Memulihkan: `mysql -u USER -p produksi_dapur < backups/<file>.sql`.

## Deploy ke server online

1. Siapkan database MySQL/MariaDB dan isi `DATABASE_URL` serta `ADMIN_PIN` di pengaturan environment server.
2. `npm ci && npm run build` (Prisma client dibuat otomatis setelah `npm ci`)
3. `npx prisma migrate deploy`, lalu `npm start` (port bisa diatur dengan `PORT`).
4. Pastikan situs diakses lewat **HTTPS**. Ini diperlukan agar aplikasi bisa dipasang di layar utama ponsel (PWA), dan cookie PIN otomatis hanya dikirim lewat koneksi aman.

Zona waktu dikunci ke WIB di `next.config.ts`, jadi batas "hari ini" tetap benar walaupun server berjalan dalam UTC. Untuk database di server online, gunakan fitur backup dari penyedia database; jadwal `launchd` di atas hanya untuk Mac.

## Alur kerja pengembangan

1. Buat branch baru dari `master` untuk satu perubahan: `git switch -c fitur/nama-singkat`.
2. Commit kecil dan sering; jalankan `npm run check` sebelum push.
3. Push dan buat pull request ke `master`. CI (`.github/workflows/ci.yml`) menjalankan lint, typecheck, tes, dan build.
4. Merge setelah CI hijau, lalu hapus branch-nya. Jangan menumpuk branch di atas branch lain yang belum di-merge.
5. Bila perubahan menyentuh skema: `npm run db:migrate` membuat migrasi, commit folder `prisma/migrations/` bersama kodenya, dan di server cukup `npm run db:migrate:deploy`.

## Struktur

```
app/                 halaman dan route API (app/api/*)
components/          komponen UI; recipe/useRecipeList.ts dipakai Input dan Resep
lib/                 logika bersama + tesnya (units, draft, reportPeriod, adminAuth, recipeInput)
prisma/              skema, migrasi, seed
scripts/             backup database dan jadwalnya
DESIGN.md            arah desain dan alasan tiap keputusan visual
```

Komposisi bahan disalin ke setiap entry produksi saat sesi disimpan, sehingga laporan lama tidak berubah ketika resep diedit atau dihapus.
