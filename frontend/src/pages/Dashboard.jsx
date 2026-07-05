import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getHistory } from "../services/api";

const fmt = (n) => `Rp ${Number(n).toLocaleString("id-ID")}`;

export default function Dashboard() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [riwayat, setRiwayat] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getHistory().then((r) => setRiwayat(r.data.riwayat || []))
      .catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-700 to-blue-500 rounded-2xl p-6 text-white">
        <h2 className="text-2xl font-bold">Halo, {user.nama || "User"} 👋</h2>
        <p className="text-blue-100 mt-1">Selamat datang di PrediksiOto</p>
        <Link to="/predict"
          className="inline-block mt-4 bg-white text-blue-700 font-semibold px-5 py-2.5 rounded-xl hover:bg-blue-50 transition-colors">
          🔍 Mulai Prediksi Baru
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow p-4 flex items-center gap-3">
          <div className="text-2xl">📊</div>
          <div>
            <p className="text-gray-400 text-xs">Total Prediksi</p>
            <p className="font-bold text-gray-800 text-lg">{riwayat.length}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow p-4 flex items-center gap-3">
          <div className="text-2xl">🏷️</div>
          <div>
            <p className="text-gray-400 text-xs">Prediksi Terakhir</p>
            <p className="font-bold text-gray-800 text-sm">
              {riwayat[0] ? fmt(riwayat[0].harga_prediksi) : "—"}
            </p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow p-4 flex items-center gap-3">
          <div className="text-2xl">🚗</div>
          <div>
            <p className="text-gray-400 text-xs">Merek Terbaru</p>
            <p className="font-bold text-gray-800 text-lg capitalize">{riwayat[0]?.merek || "—"}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-700">Riwayat Terakhir</h3>
          <Link to="/history" className="text-sm text-blue-600 hover:underline">Lihat semua →</Link>
        </div>
        {loading ? (
          <p className="text-gray-400 text-sm text-center py-6">Memuat...</p>
        ) : riwayat.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-6">Belum ada prediksi.</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {riwayat.slice(0, 5).map((r) => (
              <Link key={r.id} to={`/history/${r.id}`}
                className="flex items-center justify-between py-3 hover:bg-gray-50 px-2 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800 text-sm capitalize">{r.merek} · {r.tahun}</p>
                  <p className="text-gray-400 text-xs">{Number(r.kilometer).toLocaleString("id-ID")} km</p>
                </div>
                <span className="text-blue-700 font-semibold text-sm">{fmt(r.harga_prediksi)}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}