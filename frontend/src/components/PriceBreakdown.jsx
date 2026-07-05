// src/components/PriceBreakdown.jsx
import React from "react";

const fmtRp = (n) => {
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : n > 0 ? "+" : "";
  return `${sign}Rp ${abs.toLocaleString("id-ID")}`;
};

const PENJELASAN_FITUR = {
  "Merek": "Reputasi dan nilai jual kembali merek di pasaran",
  "Model": "Popularitas dan permintaan pasar untuk model ini",
  "Tahun": "Usia kendaraan — semakin baru umumnya semakin tinggi nilainya",
  "Kilometer": "Jarak tempuh — makin tinggi km, makin besar penyusutan",
  "Kapasitas Mesin": "Besaran cc mempengaruhi performa dan segmen harga",
  "Kapasitas Baterai": "Kapasitas baterai EV menentukan jarak tempuh dan nilai jual",
  "Jumlah Pemilik": "Riwayat kepemilikan — makin sedikit pemilik, makin diminati",
  "Transmisi": "Jenis transmisi mempengaruhi preferensi pembeli",
  "Bahan Bakar": "Jenis bahan bakar mempengaruhi biaya operasional & nilai jual",
  "Status Pajak": "Status pajak hidup/mati mempengaruhi kesiapan pakai",
  "Riwayat Servis": "Kelengkapan riwayat servis menunjukkan perawatan kendaraan",
  "Kondisi Ban": "Kondisi ban mempengaruhi biaya yang harus dikeluarkan pembeli",
  "Kondisi Body": "Kondisi cat dan body mempengaruhi penampilan & nilai jual",
  "Deskripsi Iklan": "Kata kunci dalam deskripsi yang mengindikasikan kondisi kendaraan",
};

export default function PriceBreakdown({ data, hargaAkhir }) {
  if (!data || !data.rincian) return null;

  const { harga_dasar, rincian } = data;

  // Hanya tampilkan fitur dengan pengaruh signifikan (>= 500rb) biar tidak noise
  const rincianSignifikan = rincian.filter((r) => Math.abs(r.pengaruh) >= 500_000);

  return (
    <div className="bg-white rounded-xl shadow p-5">
      <h3 className="font-semibold text-gray-700 mb-1">🧾 Rincian Perhitungan Estimasi</h3>
      <p className="text-xs text-gray-400 mb-4">
        Dihitung menggunakan metode SHAP untuk menjelaskan kontribusi setiap faktor
      </p>

      {/* Harga dasar */}
      <div className="flex justify-between items-center py-2.5 border-b border-gray-100">
        <span className="text-sm text-gray-600">Harga rata-rata pasar (basis)</span>
        <span className="font-mono text-sm font-medium text-gray-800">
          Rp {harga_dasar.toLocaleString("id-ID")}
        </span>
      </div>

      {/* Rincian tiap faktor */}
      {rincianSignifikan.map((r) => (
        <div key={r.fitur} className="py-2.5 border-b border-gray-100 last:border-0">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-700 font-medium">{r.fitur}</span>
            <span
              className={`font-mono text-sm font-semibold ${
                r.arah === "naik" ? "text-green-600" : "text-red-500"
              }`}
            >
              {fmtRp(r.pengaruh)}
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            {PENJELASAN_FITUR[r.fitur] || ""}
          </p>
        </div>
      ))}

      {/* Total akhir */}
      <div className="flex justify-between items-center pt-3 mt-1 border-t-2 border-gray-200">
        <span className="text-sm font-semibold text-gray-800">Estimasi Harga Akhir</span>
        <span className="font-mono text-base font-bold text-blue-700">
          Rp {Number(hargaAkhir).toLocaleString("id-ID")}
        </span>
      </div>

      <p className="text-xs text-gray-400 mt-3">
        * Nilai di atas dihitung relatif terhadap rata-rata harga seluruh data kendaraan
        yang digunakan untuk melatih model, bukan harga pasar resmi.
      </p>
    </div>
  );
}