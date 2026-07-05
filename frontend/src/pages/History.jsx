// src/pages/History.jsx
import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { getHistory, deleteHistory, BASE_URL } from "../services/api";
import Pagination from "../components/ui/Pagination";

const fmt = (n) => `Rp ${Number(n).toLocaleString("id-ID")}`;
const fmtTgl = (iso) =>
  iso ? new Date(iso).toLocaleDateString("id-ID", {
    day:"2-digit", month:"short", year:"numeric"
  }) : "—";

export default function History() {
  const [riwayat, setRiwayat] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hapusId, setHapusId] = useState(null);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMerek, setFilterMerek] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const muat = () => {
    setLoading(true);
    getHistory()
      .then((r) => setRiwayat(r.data.riwayat || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(muat, []);

  const handleHapus = async (id) => {
    if (!window.confirm("Hapus riwayat ini?")) return;
    setHapusId(id);
    try {
      await deleteHistory(id);
      setRiwayat((prev) => prev.filter((r) => r.id !== id));
    } catch {
      alert("Gagal hapus.");
    } finally {
      setHapusId(null);
    }
  };

  const filteredData = useMemo(() => {
    return riwayat.filter(r => {
      const matchSearch = r.merek.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          r.model_mobil.toLowerCase().includes(searchQuery.toLowerCase());
      const matchFilter = filterMerek ? r.merek.toLowerCase() === filterMerek.toLowerCase() : true;
      return matchSearch && matchFilter;
    });
  }, [riwayat, searchQuery, filterMerek]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  
  const uniqueMerek = [...new Set(riwayat.map(r => r.merek))];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold text-slate-900">📋 Riwayat Prediksi</h2>
          <p className="text-slate-500 text-sm mt-1">{riwayat.length} prediksi tersimpan</p>
        </div>
        <Link
          to="/predict"
          className="bg-brand-600 text-white text-sm font-bold px-5 py-2.5 rounded-full hover:bg-brand-700 shadow-md shadow-brand-500/20 hover:shadow-lg hover:-translate-y-0.5 transition-all whitespace-nowrap"
        >
          + Prediksi Baru
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-2">
        <div className="flex-1 relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            🔍
          </span>
          <input
            type="text"
            placeholder="Cari merek atau model..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          />
        </div>
        <select
          value={filterMerek}
          onChange={(e) => { setFilterMerek(e.target.value); setCurrentPage(1); }}
          className="w-full sm:w-48 px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 bg-white"
        >
          <option value="">Semua Merek</option>
          {uniqueMerek.map(merek => (
            <option key={merek} value={merek}>{merek}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="text-center text-slate-400 py-16">Memuat...</div>
      ) : filteredData.length === 0 ? (
        <div className="text-center text-slate-400 py-16 bg-white rounded-2xl border border-slate-100 shadow-sm">
          Belum ada riwayat prediksi yang sesuai.{" "}
          <Link to="/predict" className="text-brand-600 hover:underline font-semibold">Mulai sekarang →</Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-4 py-3 text-left">Foto</th>
                <th className="px-4 py-3 text-left">Kendaraan</th>
                <th className="px-4 py-3 text-right">Kilometer</th>
                <th className="px-4 py-3 text-right">Harga Estimasi</th>
                <th className="px-4 py-3 text-center">Tanggal</th>
                <th className="px-4 py-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {currentData.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    {r.foto_url ? (
                      <img
                        src={`${BASE_URL}${r.foto_url}`}
                        alt={r.merek}
                        className="w-12 h-12 object-cover rounded-lg border border-gray-200"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-gray-300 text-xs">
                        🚗
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-800 capitalize">
                    {r.merek} {r.model_mobil} · {r.tahun}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600">
                    {Number(r.kilometer).toLocaleString("id-ID")} km
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-blue-700">
                    {fmt(r.harga_prediksi)}
                  </td>
                  <td className="px-4 py-3 text-center text-gray-400">
                    {fmtTgl(r.created_at)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Link
                        to={`/history/${r.id}`}
                        className="text-blue-600 hover:underline text-xs"
                      >
                        Detail
                      </Link>
                      <button
                        onClick={() => handleHapus(r.id)}
                        disabled={hapusId === r.id}
                        className="text-red-500 hover:text-red-700 text-xs font-semibold disabled:opacity-50"
                      >
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
}