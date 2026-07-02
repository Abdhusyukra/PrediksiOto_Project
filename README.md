# 🚗 PrediksiOto

Sistem prediksi harga mobil bekas berbasis Machine Learning (XGBoost + NLP) dengan penjelasan hasil menggunakan metode SHAP.

## 📌 Deskripsi

PrediksiOto adalah aplikasi web yang membantu pengguna memperkirakan harga jual mobil bekas di pasar Indonesia. Pengguna mengisi spesifikasi kendaraan dan deskripsi kondisi, lalu sistem menghasilkan estimasi harga beserta rincian faktor yang mempengaruhi angka tersebut secara transparan.

## 🛠️ Tech Stack

| Komponen | Teknologi |
|---|---|
| Frontend | React.js + Tailwind CSS + Recharts |
| Backend | Python Flask + REST API |
| Machine Learning | XGBoost + TF-IDF (scikit-learn) |
| Explainability | SHAP (SHapley Additive exPlanations) |
| Database | MySQL + SQLAlchemy ORM |
| Autentikasi | JWT (JSON Web Token) |

## ✨ Fitur Utama

### Pengguna (User)
- Register dan login dengan autentikasi JWT
- Prediksi harga mobil bekas berdasarkan:
  - Spesifikasi teknis (merek, model, tahun, kilometer, transmisi, bahan bakar, kapasitas mesin/baterai)
  - Kondisi kendaraan (jumlah pemilik, status pajak, riwayat servis, kondisi ban dan body)
  - Deskripsi teks kendaraan (dianalisis dengan NLP TF-IDF)
- Upload foto kendaraan sebagai dokumentasi
- Dukungan kendaraan listrik (EV) dengan field kapasitas baterai (kWh)
- Hasil prediksi dilengkapi:
  - Grafik feature importance
  - Rincian perhitungan SHAP (breakdown harga dasar + kontribusi tiap faktor)
- Riwayat prediksi (lihat, detail, hapus)

### Admin
- Login admin terpisah dari pengguna biasa
- Dashboard statistik (total user, total prediksi, rata-rata harga, merek terpopuler)
- Daftar seluruh pengguna terdaftar
- Daftar seluruh riwayat prediksi dari semua pengguna

## 🗂️ Struktur Proyek


## ⚙️ Cara Menjalankan (Development)

### Prasyarat
- Python 3.10 / 3.11
- Node.js 18 / 20 (LTS)
- MySQL 8.0+
- Git

### 1. Clone repository

```bash
git clone https://github.com/Abdhusyukra/PrediksiOto_Project.git
cd PrediksiOto_Project
```

### 2. Setup Backend

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# Mac/Linux
source venv/bin/activate

pip install -r requirements.txt
```

Buat file `.env` di folder `backend/`:

```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=prediksioto
DB_USER=root
DB_PASSWORD=password_anda
JWT_SECRET_KEY=ganti_dengan_string_acak_minimal_32_karakter
FLASK_ENV=development
```

Import skema database:

```bash
mysql -u root -p < schema.sql
```

### 3. Siapkan Model ML

Jalankan training model terlebih dahulu:

```bash
cd ml
python train_model.py
```

Salin file `.pkl` hasil training ke `backend/model/`:

```bash
# Windows
copy ml\model\*.pkl backend\model\

# Mac/Linux
cp ml/model/*.pkl backend/model/
```

### 4. Jalankan Backend

```bash
cd backend
venv\Scripts\activate   # Windows
python app.py
```

Server berjalan di: `http://localhost:5000`
Health check: `http://localhost:5000/api/health`

### 5. Setup Frontend

```bash
cd frontend
npm install
```

Buat file `.env.local` di folder `frontend/`:

```env
REACT_APP_API_URL=http://localhost:5000
```

### 6. Jalankan Frontend

```bash
npm start
```

Aplikasi berjalan di: `http://localhost:3000`

## 🔑 Akses Admin

Halaman login admin: `http://localhost:3000/admin/login`

Akun admin dibuat manual melalui database:

```bash
# Generate hash password
python -c "from werkzeug.security import generate_password_hash; print(generate_password_hash('password_anda'))"
```

```sql
INSERT INTO admin (username, password) VALUES ('admin', 'hash_yang_dihasilkan');
```

## 🗄️ Endpoint API

| Method | Endpoint | Deskripsi | Auth |
|---|---|---|---|
| GET | /api/health | Status server | — |
| POST | /api/register | Registrasi pengguna | — |
| POST | /api/login | Login pengguna | — |
| GET | /api/models/\<merek\> | Daftar model per merek | — |
| POST | /api/upload-foto | Upload foto kendaraan | JWT User |
| POST | /api/predict | Prediksi harga | JWT User |
| GET | /api/history | Riwayat prediksi | JWT User |
| GET | /api/history/\<id\> | Detail riwayat | JWT User |
| DELETE | /api/history/\<id\> | Hapus riwayat | JWT User |
| POST | /api/admin/login | Login admin | — |
| GET | /api/admin/stats | Statistik sistem | JWT Admin |
| GET | /api/admin/users | Daftar pengguna | JWT Admin |
| GET | /api/admin/predictions | Semua prediksi | JWT Admin |

## 📊 Performa Model

| Metrik | Nilai |
|---|---|
| Algoritma | XGBoost Regressor |
| Jumlah fitur | 63 (13 terstruktur + 50 TF-IDF) |
| R² Score | 0.94+ |
| Dataset | Mobil bekas pasar Indonesia |

## 🔮 Rencana Pengembangan

- [ ] Computer vision untuk deteksi kondisi kendaraan dari foto
- [ ] Integrasi dengan mitra dealer otomotif sebagai sumber data
- [ ] Scraping data real-time dari platform jual beli (OLX, Mobil123)
- [ ] Rekomendasi harga berdasarkan tren pasar terkini

## 📄 Lisensi

Proyek ini dibuat sebagai bagian dari **Capstone Project** Program Studi Teknologi Rekayasa Perangkat Lunak, Politeknik Negeri Padang.

---

Dibuat oleh **Muhammad 'Abdhu Syukra** · 2026