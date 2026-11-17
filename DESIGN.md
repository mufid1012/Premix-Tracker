---
name: Produksi Dapur, lembar bergaris
reference: https://player.style (diminta pemilik pada 18 Nov 2026 sebagai acuan langsung)
dial: ENERGY 2 / RHYTHM 2 / MOTION 1
colors:
  paper: '#e2e4dd'
  panel: '#f4f6f4'
  white: '#ffffff'
  ink: '#000000'
  ink-soft: '#565e67'
  line: '#828c97'
  band: '#242628'
  accent: '#0067df'
  danger: '#ba1a1a'
  danger-soft: '#fdecea'
typography:
  display: Tektur 500, huruf kapital, letter-spacing 0.02em, 40px ponsel / 64px desktop
  body: Inter 400/600, 16px
  label: JetBrains Mono 400, huruf kapital, 13-14px, tanpa letter-spacing tambahan
radius:
  default: 0
  pill: 9999px (hanya kolom pencarian)
---

## Arah

Atas permintaan pemilik, tampilan mengikuti bahasa visual player.style: abu-abu hangat, bingkai garis tipis, pita label gelap, dan huruf judul persegi. Font asli acuan (Rotonto, Aeonik) berlisensi komersial, jadi diganti Tektur dan Inter. Logo, nama, dan materi merek Mux tidak dipakai; nama aplikasi ditulis sebagai teks.

Aplikasi ini lembar log produksi untuk staf dapur, dipakai di ponsel dan tablet di dapur yang terang. Tema terang tetap (tanpa mode gelap) karena itu yang paling terbaca di kondisi tersebut dan memang bahasa visual acuannya.

## Alasan tiap keputusan

- **Warna:** netral menanggung struktur; biru `accent` hanya untuk aksi utama halaman (Selesaikan Sesi), angka penghitung yang sudah terisi, batang puncak di grafik, dan cincin fokus.
- **Tata letak:** satu kolom berbingkai garis vertikal (`.frame`), tiap bagian dipisah garis horizontal selebar layar (`.row`). Halaman terbaca seperti lembar log bergaris; ini motif identitasnya.
- **Pita gelap (`.band`):** membuka setiap bagian data, menggantikan judul kartu, supaya mata langsung menemukan awal bagian.
- **Tektur:** judul halaman dan angka besar, bentuk persegi bersudut tumpul paling mirip huruf acuan dan tetap terbaca dari jarak meja dapur.
- **Inter:** teks isi, netral dan jelas pada ukuran 16px.
- **JetBrains Mono kapital:** label, navigasi, tombol; meniru label acuan dan membedakan label dari data.
- **Sudut 0:** semua kontrol dan panel persegi agar sejalan dengan garis bingkai. Satu-satunya pengecualian kolom pencarian berbentuk pil, mengikuti acuan dan menandai titik awal pencarian.
- **Grid bergaris (`.ruled-grid`), bukan kartu melayang:** sel dipisah garis tipis, tanpa bayangan. Bayangan tidak dipakai sama sekali kecuali backdrop modal.
- **Spasi:** basis 4px; padding sel 16-20px di ponsel, 24-32px di desktop. Garis, bukan jarak lebar, yang memisahkan kelompok.
- **Ikon:** Material Symbols Outlined, hanya bila menjelaskan isinya (dashboard, resep, kalender, unduh). Selalu `aria-hidden` karena teks di sebelahnya sudah memberi nama.
- **Gerak (MOTION 1):** hanya perubahan warna saat hover dan lembar modal/toast yang naik dari bawah. Dimatikan bila `prefers-reduced-motion`.

## Komponen

- **Tombol:** `.btn` + varian. `btn-dark` untuk aksi utama biasa, `btn-accent` untuk satu aksi kunci per halaman, `btn-line` untuk aksi sekunder, `btn-danger` untuk hapus. Tinggi minimum 48px (56px untuk penghitung di halaman Input).
- **Kolom isian:** `.field`, latar putih, garis `line`, label `label-mono` yang terlihat di atasnya.
- **Chip kategori:** `.chip` persegi; terpilih memakai `aria-pressed` dan latar `band`.
- **Navigasi:** desktop di TopAppBar sebagai sel-sel bergaris; ponsel di bilah bawah 4 sel. Halaman aktif berlatar `band`.
- **Modal:** `<dialog>` bawaan (Escape dan perangkap fokus dari browser). Lembar bawah di ponsel, di tengah di desktop.
- **Status data:** setiap tampilan data punya keadaan memuat, kosong, dan gagal.

## Bahasa

Semua teks antarmuka dalam bahasa Indonesia, langsung dan spesifik ("Selesaikan Sesi", "Unduh Laporan (CSV)"). Tanpa tanda pisah panjang; pakai koma, titik dua, atau tanda kurung.
