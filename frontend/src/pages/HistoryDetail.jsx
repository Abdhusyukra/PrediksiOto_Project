// src/pages/HistoryDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getHistoryDetail, BASE_URL } from "../services/api";
import PriceBreakdown from "../components/PriceBreakdown";

const fmt    = (n) => `Rp ${Number(n).toLocaleString("id-ID")}`;
const fmtTgl = (iso) =>
  iso ? new Date(iso).toLocaleString("id-ID", {
    day:"2-digit", month:"long", year:"numeric",
    hour:"2-digit", minute:"2-digit"
  }) : "—";

export default function HistoryDetail() {
  const { id }       = useParams();
  const navigate     = useNavigate();
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getHistoryDetail(id)
      .then((r) => setData(r.data.detail))
      .catch(() => navigate("/history"))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) return <p className="text-center text-gray-400 py-16">Memuat...</p>;
  if (!data)   return null;

  const isListrik = data.bahan_bakar === "listrik";

  const row = (label, value) => (
    <div key={label} className="flex justify-between text-sm py-2.5 border-b border-gray-100 last:border-0">
      <span className="text-gray-500 w-36 flex-shrink-0">{label}</span>
      <span className="font-medium text-gray-800 capitalize text-right">{value ?? "—"}</span>
    </div>
  );

  return (
    <div className="max-w-xl mx-auto space-y-5">
      {/* Harga */}
      <div className="bg-gradient-to-br from-blue-700 to-blue-500 rounded-2xl p-7 text-white text-center">
        <p className="text-blue-100 text-sm">Estimasi Harga</p>
        <p className="text-3xl font-extrabold mt-1">{fmt(data.harga_prediksi)}</p>
        <p className="text-blue-200 text-xs mt-2">{fmtTgl(data.created_at)}</p>
      </div>

      {/* Foto kendaraan */}
      {data.foto_url && (
        <div className="bg-white rounded-xl shadow p-5">
          <h3 className="font-semibold text-gray-700 mb-3">📷 Foto Kendaraan</h3>
          <img
            src={`${BASE_URL}${data.foto_url}`}
            alt={`${data.merek} ${data.model_mobil}`}
            className="w-full h-64 object-cover rounded-lg border border-gray-200"
          />
        </div>
      )}

      {/* Detail spek */}
      <div className="bg-white rounded-xl shadow p-5">
        <h3 className="font-semibold text-gray-700 mb-3">Spesifikasi Kendaraan</h3>
        {row("Merek",          data.merek)}
        {row("Model",          data.model_mobil)}
        {row("Tahun",          data.tahun)}
        {row("Kilometer",      `${Number(data.kilometer).toLocaleString("id-ID")} km`)}
        {row("Transmisi",      data.transmisi)}
        {row("Bahan Bakar",    data.bahan_bakar)}
        {isListrik
          ? row("Kapasitas Baterai", `${data.kapasitas_baterai_kwh} kWh`)
          : row("Kapasitas Mesin",   `${data.kapasitas_cc} cc`)}
        {row("Jumlah Pemilik", data.jumlah_pemilik)}
        {row("Status Pajak",   data.status_pajak)}
        {row("Riwayat Servis", data.riwayat_servis)}
        {row("Kondisi Ban",    data.kondisi_ban)}
        {row("Kondisi Body",   data.kondisi_body)}
      </div>

      {/* Rincian perhitungan SHAP */}
      <PriceBreakdown data={data.shap_breakdown} hargaAkhir={data.harga_prediksi} />

      {/* Deskripsi */}
      {data.deskripsi_teks && (
        <div className="bg-white rounded-xl shadow p-5">
          <h3 className="font-semibold text-gray-700 mb-2">Deskripsi</h3>
          <p className="text-gray-600 text-sm leading-relaxed">{data.deskripsi_teks}</p>
        </div>
      )}

      {/* Aksi */}
      <div className="flex gap-3">
        <Link
          to="/history"
          className="flex-1 text-center bg-white border border-gray-300 text-gray-700 font-semibold py-2.5 rounded-xl hover:bg-gray-50 transition-colors"
        >
          ← Kembali
        </Link>
        <Link
          to="/predict"
          className="flex-1 text-center bg-blue-700 text-white font-semibold py-2.5 rounded-xl hover:bg-blue-800 transition-colors"
        >
          🔍 Prediksi Baru
        </Link>
      </div>
    </div>
  );
}