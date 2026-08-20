# 🚀 Pawitra App - Panduan Git & Kontribusi Tim

Berikut adalah panduan langkah demi langkah untuk mulai berkontribusi dalam project ini.

---

## 📌 Langkah Awal (Setup Pertama Kali)

Jalankan perintah ini saat pertama kali mengunduh project ke PC kamu:

```bash
# 1. Clone repository ke komputer lokal
git clone [https://github.com/CaesarVior/pawitra-app.git](https://github.com/CaesarVior/pawitra-app.git)

# 2. Masuk ke folder project
cd pawitra-app

# 3. Buat dan pindah ke branch milikmu sendiri
git checkout -b <nama-panggilan>
```

## 🔄 Alur Kerja Harian (Core Workflow)

Setiap kali selesai membuat atau mengubah fitur kodingan, jalankan alur ini:

```bash
# 1. Tandai semua file yang telah diubah
git add .

# 2. Simpan riwayat perubahan dengan pesan ringkas
git commit -m "Menambah halaman Home Page"

# 3. Unggah hasil kodingan ke branch kamu di GitHub
git push origin <nama-branch-kalian>
```

## 📥 Mengambil Pembaruan dari Staging

Sebelum mulai koding atau sebelum melakukan push, pastikan kodingan lokalmu up-to-date dengan branch staging:

```Bash
# Download dan gabungkan perubahan terbaru dari branch staging
git pull origin staging
```
