// src/pages/AdminPredictions.jsx
import React, { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { getAdminPredictions } from "../services/api";
import Pagination from "../components/ui/Pagination";

const fmt    = (n) => `Rp ${Number(n).toLocaleString("id-ID")}`;
const fmtTgl = (iso) =>
  iso ? new Date(iso).toLocaleDateString("id-ID", {
    day: "2-digit", month: "short", year: "numeric"
  }) : "—";

export default function AdminPredictions() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterMerek, setFilterMerek] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Jika ada ?userId=..., pre-filter berdasarkan user
  const [filterUserId] = useState(() => searchParams.get("userId") || "");

  useEffect(() => {
    getAdminPredictions()
      .then((r) => setData(r.data.predictions || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filteredData = useMemo(() => {
    return data.filter(p => {
      const matchUser = filterUserId ? String(p.user_id) === String(filterUserId) : true;
      const matchSearch =
        p.merek.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.model_mobil.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.user_nama.toLowerCase().includes(searchQuery.toLowerCase());
      const matchFilter = filterMerek ? p.merek.toLowerCase() === filterMerek.toLowerCase() : true;
      return matchUser && matchSearch && matchFilter;
    });
  }, [data, searchQuery, filterMerek, filterUserId]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const uniqueMerek = [...new Set(data.map(p => p.merek))].sort();

  // Nama user yang sedang difilter (untuk badge info)
  const filteredUserName = filterUserId && data.length > 0
    ? data.find(p => String(p.user_id) === filterUserId)?.user_nama
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-2xl font-display font-bold text-slate-900">Semua Prediksi</h2>
          <p className="text-slate-500 text-sm mt-1">
            {filteredUserName
              ? <>Menampilkan prediksi milik <span className="font-semibold text-brand-600">{filteredUserName}</span></>
              : <>{data.length} prediksi terdaftar</>
            }
          </p>
        </div>
        {filteredUserName && (
          <a
            href="/admin/predictions"
            className="text-xs font-semibold text-slate-500 hover:text-red-500 border border-slate-200 hover:border-red-200 px-3 py-1.5 rounded-lg transition-all"
          >
            ✕ Reset Filter
          </a>
        )}
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7 7 0 1110 3a7 7 0 016.65 13.65z" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Cari pengguna, merek, atau model..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 bg-white"
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

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
        </div>
      ) : filteredData.length === 0 ? (
        <div className="text-center text-slate-400 py-20 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 mx-auto mb-3 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="font-medium">Tidak ada data prediksi yang sesuai.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-5 py-3.5 text-left">#</th>
                  <th className="px-5 py-3.5 text-left">Pengguna</th>
                  <th className="px-5 py-3.5 text-left">Kendaraan</th>
                  <th className="px-5 py-3.5 text-right">Estimasi Harga</th>
                  <th className="px-5 py-3.5 text-center">Kondisi</th>
                  <th className="px-5 py-3.5 text-center">Tanggal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentData.map((p, idx) => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3.5 text-slate-400 text-xs">
                      {(currentPage - 1) * itemsPerPage + idx + 1}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs flex-shrink-0">
                          {p.user_nama?.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-slate-800">{p.user_nama}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 capitalize">
                      <p className="font-medium text-slate-800">{p.merek} {p.model_mobil}</p>
                      <p className="text-xs text-slate-400">{p.tahun} · {Number(p.kilometer).toLocaleString("id-ID")} km</p>
                    </td>
                    <td className="px-5 py-3.5 text-right font-semibold text-brand-700">
                      {fmt(p.harga_prediksi)}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      {p.kondisi_body ? (
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          p.kondisi_body === "Baru" ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"
                        }`}>
                          {p.kondisi_body}
                        </span>
                      ) : "—"}
                    </td>
                    <td className="px-5 py-3.5 text-center text-slate-400 text-xs">
                      {fmtTgl(p.created_at)}
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