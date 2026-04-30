# 📋 PANDUAN DEPLOY SISTEM KOL SASIH

## Daftar File
- `index.html` — Halaman utama
- `admin.html` — Admin Panel (password: sasih2024)
- `input.html` — Input data bulanan KOL
- `dashboard.html` — Dashboard performa
- `pecel-lele.html` — Form KOL Pecel Lele Aminoto
- `bolu-sunyaragi.html` — Form KOL Bolu Sunyaragi
- `bakmi-jowo.html` — Form KOL Bakmi Jowo
- `google-apps-script.gs` — Kode backend Google Apps Script
- `_redirects` — Konfigurasi Netlify

---

## LANGKAH 1 — Upload ke GitHub

1. Buka **github.com** → Login
2. Klik tombol **"+"** di pojok kanan atas → **"New repository"**
3. Isi **Repository name**: `kol-sasih`
4. Pilih **Public**
5. Klik **"Create repository"**
6. Klik **"uploading an existing file"**
7. Drag & drop SEMUA file dari folder ini
8. Klik **"Commit changes"**

---

## LANGKAH 2 — Deploy ke Netlify

1. Buka **netlify.com** → Login dengan akun GitHub
2. Klik **"Add new site"** → **"Import an existing project"**
3. Pilih **GitHub**
4. Pilih repository **kol-sasih**
5. Klik **"Deploy site"**
6. Tunggu 1-2 menit → Website langsung aktif!
7. Catat link website Anda (contoh: `amazing-name-123.netlify.app`)

---

## LANGKAH 3 — Setup Google Sheet

1. Buka **sheets.google.com**
2. Buat spreadsheet baru → beri nama **"KOL Sasih Data"**
3. Salin **ID Sheet** dari URL:
   ```
   https://docs.google.com/spreadsheets/d/[INI_ID_NYA]/edit
   ```
4. Simpan ID tersebut, akan dibutuhkan di langkah berikutnya

---

## LANGKAH 4 — Setup Google Apps Script

1. Di Google Sheet: klik menu **Extensions** → **Apps Script**
2. Hapus semua kode yang ada
3. Buka file **google-apps-script.gs** → salin semua isinya
4. Paste ke Apps Script editor
5. Di baris paling atas, ganti:
   ```
   const SPREADSHEET_ID = 'PASTE_SHEET_ID_HERE';
   ```
   Menjadi ID sheet Anda, contoh:
   ```
   const SPREADSHEET_ID = '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms';
   ```
6. (Opsional) Ganti password admin:
   ```
   const ADMIN_PASSWORD = 'sasih2024';  // ganti jika mau
   ```
7. Klik **Save** (ikon disket / Ctrl+S)
8. Klik **Run** → pilih fungsi **initSheets** → klik **Run**
   - Pertama kali: izinkan akses Google → klik **Allow**
   - Ini akan membuat semua sheet otomatis

---

## LANGKAH 5 — Deploy Apps Script sebagai Web App

1. Di Apps Script: klik **Deploy** → **New deployment**
2. Klik ikon ⚙️ di sebelah "Select type" → pilih **Web app**
3. Isi konfigurasi:
   - **Description**: Sistem KOL Sasih
   - **Execute as**: Me (email Anda)
   - **Who has access**: Anyone
4. Klik **Deploy**
5. Klik **Authorize access** → pilih akun Google → Allow
6. Salin **Web app URL** yang muncul (panjang, diawali `https://script.google.com/...`)

---

## LANGKAH 6 — Sambungkan Website ke Apps Script

1. Di GitHub: buka repository `kol-sasih`
2. Buka setiap file HTML berikut dan edit:
   - `admin.html`
   - `input.html`
   - `dashboard.html`
   - `pecel-lele.html`
   - `bolu-sunyaragi.html`
   - `bakmi-jowo.html`
3. Di setiap file, cari teks: `PASTE_APPS_SCRIPT_URL_HERE`
4. Ganti dengan URL Apps Script Anda
5. Klik **Commit changes** untuk setiap file

Netlify akan otomatis update website dalam 1-2 menit.

---

## TEST SISTEM

1. Buka link Netlify Anda
2. Klik **Admin Panel** → masuk dengan password `sasih2024`
3. Pilih brand & cabang → isi brief → Simpan
4. Buka form KOL (misalnya Pecel Lele) → isi data → Submit
5. Cek PDF ter-download
6. Cek Google Sheet → data masuk otomatis

---

## FAQ

**Q: Password admin di mana?**
A: Default `sasih2024`. Bisa ganti di konstanta `PASSWORD` di `admin.html` DAN `ADMIN_PASSWORD` di Apps Script.

**Q: Bagaimana kirim link ke KOL?**
A: Kirim salah satu link ini:
- Pecel Lele: `linknetlify.app/pecel-lele.html`
- Bolu Sunyaragi: `linknetlify.app/bolu-sunyaragi.html`
- Bakmi Jowo: `linknetlify.app/bakmi-jowo.html`

**Q: Data KOL tersimpan di mana?**
A: Di Google Sheet Anda, tab `KOL_Master`.

**Q: Brief bisa dikustomisasi?**
A: Ya. Masuk Admin Panel → pilih brand & cabang → edit semua teks, warna, logo, dos/donts → Simpan.

**Q: Apa itu mode demo di Dashboard?**
A: Jika Apps Script belum terhubung, dashboard menampilkan data contoh agar Anda bisa melihat tampilan.
