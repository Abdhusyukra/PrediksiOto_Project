import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import FeatureChart from "../components/FeatureChart";
import PriceBreakdown from "../components/PriceBreakdown";

export default function Result() {
  const navigate = useNavigate();
  const [hasil, setHasil] = useState(null);

  useEffect(() => {
    const data = sessionStorage.getItem("hasil_prediksi");
    if (!data) { navigate("/predict"); return; }
    setHasil(JSON.parse(data));
  }, [navigate]);

  if (!hasil) return null;
  const { harga_prediksi, harga_format, feature_importance, shap_breakdown, input } = hasil;
  const isListrik = input.bahan_bakar === "listrik";

  return (
    <div className="max-w-2xl mx-auto space-y-8 py-4">
      <div className="relative overflow-hidden bg-gradient-to-br from-brand-700 to-brand-500 rounded-3xl p-10 text-white text-center shadow-2xl shadow-brand-500/30">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-2xl transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-brand-900/20 rounded-full blur-2xl transform -translate-x-1/2 translate-y-1/2"></div>
        
        <p className="relative z-10 text-brand-100 text-sm font-semibold tracking-wide uppercase mb-3">Estimasi Harga Pasar</p>
        <p className="relative z-10 text-5xl font-display font-extrabold tracking-tight">
          {harga_format || `Rp ${Number(harga_prediksi).toLocaleString("id-ID")}`}
        </p>
        <div className="relative z-10 mt-6 inline-flex items-center gap-1.5 bg-brand-900/30 backdrop-blur-sm px-3 py-1.5 rounded-full text-brand-100 text-xs">
          <span>✨</span>
          <span>Berdasarkan XGBoost + SHAP Analysis</span>
        </div>
      </div>

      {/* Feature importance */}
      <FeatureChart data={feature_importance} />

      {/* Rincian perhitungan SHAP */}
      <PriceBreakdown data={shap_breakdown} hargaAkhir={harga_prediksi} />

      <div className="bg-white/80 backdrop-blur-md border border-white/50 rounded-2xl shadow-xl shadow-slate-200/50 p-6">
        <h3 className="text-lg font-display font-bold text-slate-800 mb-4 flex items-center gap-2">
          <span>📋</span> Detail Spesifikasi
        </h3>
        {[
          ["Merek", input.merek],
          ["Model", input.model_mobil],
          ["Tahun", input.tahun],
          ["Kilometer", `${Number(input.kilometer).toLocaleString("id-ID")} km`],
          ["Transmisi", input.transmisi],
          ["Bahan Bakar", input.bahan_bakar],
          isListrik
            ? ["Kapasitas Baterai", `${input.kapasitas_baterai_kwh} kWh`]
            : ["Kapasitas Mesin", `${input.kapasitas_cc} cc`],
        ].map(([label, value]) => (
          <div key={label} className="flex justify-between text-sm py-3 border-b border-slate-100 last:border-0">
            <span className="text-slate-500">{label}</span>
            <span className="font-semibold text-slate-900 capitalize">{value ?? "—"}</span>
          </div>
        ))}
      </div>

      <div className="flex gap-4 pt-4">
        <Link to="/predict"
          className="flex-1 text-center bg-white border-2 border-brand-200 text-brand-700 font-bold py-3 rounded-full hover:bg-brand-50 hover:border-brand-300 transition-all shadow-sm">
          🔄 Prediksi Lagi
        </Link>
        <Link to="/history"
          className="flex-1 text-center bg-brand-600 text-white font-bold py-3 rounded-full hover:bg-brand-700 shadow-lg shadow-brand-500/30 hover:-translate-y-0.5 transition-all">
          📋 Lihat Riwayat
        </Link>
      </div>
    </div>
  );
}