SISTEM ADMINISTRASI KELAS 6 - MIS COKROAMINOTO PANYINGKIRAN

Tahun Pelajaran 2026/2027

Sistem Informasi Administrasi Kelas 6 Berbasis Web (Serverless Cloud Architecture) yang dirancang khusus untuk memenuhi kebutuhan pengolahan data madrasah/sekolah secara permanen, aman, responsif, dan dapat diakses dari mana saja (HP Maupun Komputer).

1. ARSITEKTUR SISTEM & DESAIN SPREADSHEET

[ Frontend Web App ] <---> [ REST API (Google Apps Script) ] <---> [ Google Sheets Database ]
(GitHub Pages / Statis)              (Code.gs)                       (Online Cloud DB)


Struktur Spreadsheet (Database Google Sheets)

Satu berkas Spreadsheet memiliki tab-tab berikut:

SISWA: ID, NISN, NIS, Nama Lengkap, Jenis Kelamin, Tempat Lahir, Tanggal Lahir, Kelas, Nama Ayah, Nama Ibu, No HP Orang Tua, Alamat, Status Siswa, Tanggal Input, Terakhir Diubah.

GURU: ID, NIP/NIK, Nama Guru, Jenis Kelamin, Mata Pelajaran, Jabatan, No HP, Email, Status.

KELAS: ID, Nama Kelas, Wali Kelas, Tahun Pelajaran, Jumlah Siswa.

NILAI: ID, NISN, Nama Siswa, Kelas, Mata Pelajaran, Nilai Tugas, Nilai STS, Nilai SAS, Nilai Akhir, Predikat, Keterangan.

ABSENSI: ID, NISN, Nama Siswa, Kelas, Tanggal, Status Kehadiran, Keterangan.

LOG: Timestamp, User, Aktivitas, Data, Status.

USERS: Username, PasswordHash, Nama, Role.

2. PANDUAN DEPLOYMENT & INSTALASI (LANGKAH-DEMI-LANGKAH)

LANGKAH 1: Buat Google Spreadsheet

Buka Google Sheets.

Buat Spreadsheet baru dan berikan judul: DATABASE ADMINISTRASI KELAS 6 MIS COKROAMINOTO.

LANGKAH 2: Buka Apps Script Editor

Pada menu Google Sheets, klik Extensions (Ekstensi) → Apps Script.

Hapus semua kode default yang ada di dalam editor Code.gs.

LANGKAH 3: Masukkan Kode Backend (Code.gs)

Salin seluruh isi kode berkas Code.gs yang disediakan di atas.

Tempelkan ke dalam editor Apps Script.

Klik ikon Save (Simpan).

LANGKAH 4: Deploy Web App

Di pojok kanan atas editor Apps Script, klik tombol Deploy → New deployment.

Klik ikon roda gigi ⚙️ (Select type) → pilih Web app.

Isi konfigurasi sebagai berikut:

Description: API Administrasi Kelas 6 v1.0

Execute as: Me (Akun Google Anda)

Who has access: Anyone (Siapa saja) — Penting agar frontend statis dapat mengakses API tanpa terkendala CORS.

Klik tombol Deploy.

Berikan izin akses (Authorize access) dan pilih akun Google Anda. Jika muncul peringatan keamanan, klik Advanced → Go to Untitled project (unsafe) → Allow.

LANGKAH 5: Salin URL Web App

Salin URL Web App yang berakhiran /exec.
Contoh format URL: https://script.google.com/macros/s/AKfycb.../exec

LANGKAH 6: Konfigurasi Frontend Website

Buka berkas index.html.

Cari baris kode konfigurasi berikut:

let API_URL = "[ISI DI SINI: URL Web App Google Apps Script]";


Ganti teks [ISI DI SINI: URL Web App Google Apps Script] dengan URL Web App yang Anda dapatkan dari LANGKAH 5.
Atau, Anda dapat memasukkannya langsung dari antarmuka web melalui menu Pengaturan & Backup.

LANGKAH 7: Deploy Frontend ke GitHub Pages

Buat repository baru di GitHub bernama administrasi-kelas-6.

Upload berkas index.html, Code.gs, dan README.md ke repository tersebut.

Buka Settings repository → Pages.

Pada bagian Source, pilih branch main (atau master) dan folder /root.

Klik Save. Dalam beberapa saat, URL website live Anda siap digunakan.

3. PANDUAN PENGGUNAAN & OTENTIKASI

Username Default: admin

Password Default: admin123

Administrator: Robby

Cara Mengubah Password Administrator:

Login ke dalam aplikasi.

Buka menu Pengaturan & Backup.

Pada panel Ubah Password Admin, masukkan password lama (admin123) dan masukkan password baru Anda.

Klik Perbarui Password. Data password tersimpan secara aman di tab USERS pada Google Sheets.

4. CHECKLIST TESTING & PENGUJIAN AKHIR

Silakan periksa item berikut untuk memastikan aplikasi berjalan sempurna:

[x] Login Berhasil: Login dengan akun admin valid.

[x] Dashboard Tampil: Metrik statistik jumlah siswa, gender, dan presensi terhitung akurat.

[x] Read Data Siswa: Tabel menampilkan data terkini langsung dari Google Sheets.

[x] Tambah Siswa: Form menyimpan data baru secara permanen ke Google Sheets.

[x] Penanganan NISN Ganda: Sistem menolak pendaftaran siswa jika NISN sudah terdaftar.

[x] Edit Siswa: Perubahan data ter-update secara langsung di Google Sheets.

[x] Hapus Siswa: Dialog konfirmasi muncul dan data terhapus dari Google Sheets.

[x] Pencarian Real-time: Pencarian kata kunci NISN/Nama menyaring tabel secara langsung.

[x] Filter Multi-kriteria: Filter berdasarkan Kelas, Gender, dan Status bekerja presisi.

[x] Import Excel: Pembacaan berkas .xlsx, verifikasi NISN, dan pengunggahan massal sukses.

[x] Export Excel & PDF: Berkas terunduh dan dapat dibuka di Microsoft Excel / PDF Reader.

[x] Audit Log: Setiap aktivitas CRUD tercatat pada Sheet LOG.

[x] Responsif HP & Komputer: Tampilan menyesuaikan perangkat desktop, tablet, dan smartphone.

5. TROUBLESHOOTING & PENANGANAN MASALAH

Pesan Error: "Koneksi terputus / Data belum dapat disimpan"

Sebab: URL Web App belum dikonfigurasi dengan benar atau deployment Web App belum diset ke Who has access: Anyone.

Solusi: Ulangi LANGKAH 4, pastikan membuat Deployment Baru (New Deployment) dan pilih opsi Anyone.

Perubahan Kode pada Google Apps Script tidak berdampak ke website

Sebab: Google Apps Script membutuhkan pembuatan New Deployment atau versi baru setiap kali ada perubahan pada kode Code.gs.

Solusi: Klik Deploy → Manage Deployments → Edit → Pilih New Version → Deploy.

Restorasi / Restore Database:

Jika ingin mengembalikan data lama, buka folder Google Drive Anda, cari file cadangan dengan awalan nama BACKUP_ADMINISTRASI_KELAS6_..., lalu salin isinya ke Spreadsheet utama.