// Backup database ke backups/produksi-dapur-YYYY-MM-DD-HHmm.sql, simpan 14 hari terakhir.
// Jalankan: npm run db:backup   (jadwal harian: scripts/install-backup-schedule.sh)
import "dotenv/config";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, statSync, unlinkSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const KEEP_DAYS = 14;
const DIR = join(import.meta.dirname, "..", "backups");
const PREFIX = "produksi-dapur-";

// launchd berjalan dengan PATH minimal, jadi cari mysqldump di lokasi umum juga
const MYSQLDUMP =
  process.env.MYSQLDUMP_PATH ||
  ["/Applications/XAMPP/xamppfiles/bin/mysqldump", "/opt/homebrew/bin/mysqldump", "/usr/local/bin/mysqldump"].find(
    existsSync
  ) ||
  "mysqldump";

const url = new URL(process.env.DATABASE_URL);
const pad = (n) => String(n).padStart(2, "0");
const now = new Date();
const stamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}`;

mkdirSync(DIR, { recursive: true });
const file = join(DIR, `${PREFIX}${stamp}.sql`);

const sql = execFileSync(
  MYSQLDUMP,
  [
    "-h", url.hostname === "localhost" ? "127.0.0.1" : url.hostname,
    "-P", url.port || "3306",
    "-u", decodeURIComponent(url.username),
    "--single-transaction",
    "--routines",
    url.pathname.slice(1),
  ],
  // Kata sandi lewat env, bukan argumen, supaya tidak terlihat di daftar proses
  { env: { ...process.env, MYSQL_PWD: decodeURIComponent(url.password) }, maxBuffer: 1 << 30 }
);
writeFileSync(file, sql);

// Hapus backup terjadwal yang lebih tua dari KEEP_DAYS (file lain di folder tidak disentuh)
const cutoff = now.getTime() - KEEP_DAYS * 24 * 60 * 60 * 1000;
const removed = readdirSync(DIR)
  .filter((f) => f.startsWith(PREFIX) && f.endsWith(".sql"))
  .filter((f) => statSync(join(DIR, f)).mtimeMs < cutoff)
  .map((f) => (unlinkSync(join(DIR, f)), f));

console.log(`${now.toISOString()} backup ${file} (${sql.length} byte), dihapus: ${removed.length}`);
