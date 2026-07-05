// src/pages/AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import { getAdminStats } from "../services/api";

const fmt = (n) => `Rp ${Number(n).toLocaleString("id-ID")}`;

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminStats()
      .then((r) => setStats(r.data))
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
    </div>
  );
  if (!stats) return (
    <div className="text-center text-slate-400 py-16 bg-white rounded-2xl border border-slate-100 shadow-sm">
      Gagal memuat data statistik.
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-display font-bold text-slate-900">Dashboard Statistik</h2>
        <p className="text-slate-500 text-sm mt-1">Ringkasan aktivitas seluruh pengguna sistem</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total Pengguna" value={stats.total_user} icon="👥" />
        <StatCard label="Total Prediksi" value={stats.total_prediksi} icon="📊" />
        <StatCard label="Rata-rata Estimasi Harga" value={fmt(stats.rata_rata_harga)} icon="💰" small />
      </div>

      <div className="bg-white/80 backdrop-blur-md border border-slate-100 rounded-2xl shadow-sm p-6">
        <h3 className="text-lg font-display font-bold text-slate-800 mb-5">Merek Terpopuler</h3>
        {stats.merek_terpopuler.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-6">Belum ada data prediksi.</p>
        ) : (
          <div className="space-y-3">
            {stats.merek_terpopuler.map((m, i) => {
              const persen = (m.jumlah / stats.total_prediksi) * 100;
              return (
                <div key={m.merek}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="font-semibold text-slate-700 capitalize">{i + 1}. {m.merek}</span>
                    <span className="text-slate-500 font-medium">{m.jumlah} prediksi</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-brand-500 h-2.5 rounded-full shadow-inner"
                      style={{ width: `${persen}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, small }) {
  return (
    <div className="bg-white/80 backdrop-blur-md border border-slate-100 rounded-2xl shadow-sm p-6 flex items-center gap-5 hover:shadow-md transition-shadow">
      <div className="text-3xl p-3 bg-brand-50 rounded-xl">{icon}</div>
      <div>
        <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">{label}</p>
        <p className={`font-display font-bold text-slate-900 ${small ? "text-xl" : "text-3xl"}`}>{value}</p>
      </div>
    </div>
  );
}