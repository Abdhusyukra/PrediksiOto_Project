"""
generate_dummy.py — Buat dataset dummy untuk testing PrediksiOto
Jalankan: python generate_dummy.py
Output  : ../dataset/dataset_dummy.csv
"""

import random
import pandas as pd
import numpy as np

random.seed(42)
np.random.seed(42)

MEREK = ["toyota", "honda", "suzuki", "daihatsu", "mitsubishi", "nissan", "wuling", "hyundai"]
TRANSMISI = ["otomatis", "manual"]
BAHAN_BAKAR = ["bensin", "diesel", "hybrid"]
DESKRIPSI_POOL = [
    "kondisi mulus mesin halus servis rutin dealer ban baru ac dingin pajak hidup",
    "bekas pakai pribadi terawat tidak ada lecet cat original kilometer rendah",
    "mesin bagus body mulus interior bersih ac dingin audio lengkap",
    "dijual cepat butuh uang kondisi prima mesin halus ban baru semua",
    "mobil keluarga terawat servis berkala di bengkel resmi dokumen lengkap",
    "kondisi standar ada lecet kecil mesin normal ac dingin harga nego",
    "bekas rental body ada baret mesin masih bagus ban depan baru",
    "full ori tidak pernah tabrakan cat mulus mesin halus pajak panjang",
    "tangan pertama dari baru terawat sekali semua fungsi normal lengkap",
    "siap pakai tinggal ganti oli mesin sehat ac dingin audio original",
]

rows = []
for _ in range(2000):
    merek       = random.choice(MEREK)
    tahun       = random.randint(2005, 2023)
    kilometer   = random.randint(5000, 250000)
    transmisi   = random.choice(TRANSMISI)
    bahan_bakar = random.choice(BAHAN_BAKAR)
    cc          = random.choice([1000, 1200, 1300, 1500, 1800, 2000, 2400, 2500])
    deskripsi   = random.choice(DESKRIPSI_POOL)

    # Simulasi harga berdasarkan fitur
    base = 80_000_000
    base += (tahun - 2005) * 4_000_000
    base -= kilometer * 80
    base += cc * 8_000
    if transmisi == "otomatis":  base += 8_000_000
    if bahan_bakar == "hybrid":  base += 25_000_000
    if bahan_bakar == "diesel":  base += 5_000_000
    if merek in ["toyota","honda"]: base += 10_000_000
    if merek in ["wuling","suzuki"]: base -= 5_000_000

    # Tambah noise
    base += random.randint(-10_000_000, 10_000_000)
    base = max(base, 15_000_000)

    rows.append({
        "deskripsi"   : deskripsi,
        "merek"       : merek,
        "tahun"       : tahun,
        "kilometer"   : kilometer,
        "transmisi"   : transmisi,
        "bahan_bakar" : bahan_bakar,
        "kapasitas_cc": cc,
        "harga"       : round(base / 1_000_000) * 1_000_000,
    })

import pandas as pd
df = pd.DataFrame(rows)
df.to_csv("../dataset/dataset_dummy.csv", index=False, encoding="utf-8-sig")
print(f"✅ Dataset dummy dibuat: {len(df)} baris → dataset/dataset_dummy.csv")
print(df.describe()[["tahun","kilometer","kapasitas_cc","harga"]])