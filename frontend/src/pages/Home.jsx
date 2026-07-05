// src/pages/Home.jsx
import React from "react";
import { Link } from "react-router-dom";

const TESTIMONI = [
  {
    nama: "Rian Saputra",
    kota: "Padang",
    teks: "Sebelum jual Avanza saya, saya cek dulu di sini. Hasilnya cukup mendekati harga yang akhirnya disepakati pembeli.",
    avatar: "RS",
  },
  {
    nama: "Dewi Lestari",
    kota: "Pekanbaru",
    teks: "Suka karena ada rincian kenapa harganya segitu — jadi tidak cuma angka tanpa penjelasan saat negosiasi.",
    avatar: "DL",
  },
  {
    nama: "Fajar Hidayat",
    kota: "Batam",
    teks: "Praktis untuk cek estimasi sebelum survei langsung ke showroom. Formnya juga lengkap, bisa upload foto kendaraan.",
    avatar: "FH",
  },
];

export default function Home() {
  return (
    <div className="bg-gray-50">

      {/* Navbar */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-white/70 backdrop-blur-lg border-b border-white/20">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer">
            <img src="/logo-prediksioto.png" alt="PrediksiOto" className="h-10 w-auto group-hover:scale-105 transition-transform" />
            <span className="text-brand-900 font-display font-bold text-xl tracking-tight">PrediksiOto</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-gray-600 text-sm font-medium hover:text-brand-700 transition-colors">
              Masuk
            </Link>
            <Link
              to="/register"
              className="bg-brand-600 text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-brand-700 shadow-md shadow-brand-500/20 hover:shadow-lg hover:-translate-y-0.5 transition-all"
            >
              Daftar Gratis
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-50 via-white to-brand-100 pt-32 pb-20 lg:pt-40 lg:pb-32">
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-brand-300/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl"></div>
        
        <div className="max-w-5xl mx-auto px-4 relative grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          {/* Kiri: copy */}
          <div className="animate-fade-in-up">
            <span className="inline-block bg-brand-100/80 backdrop-blur-sm border border-brand-200 text-brand-700 text-xs font-bold tracking-wide px-4 py-1.5 rounded-full mb-6 shadow-sm">
              ✨ ESTIMASI HARGA BERBASIS AI
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-slate-900 leading-[1.15] tracking-tight">
              Tahu nilai mobil bekas <span className="text-brand-600">sebelum</span> ditawar.
            </h1>
            <p className="text-slate-600 text-lg mt-6 max-w-md leading-relaxed font-medium">
              PrediksiOto membaca spesifikasi dan deskripsi kendaraan, lalu menghitung
              estimasi harga pasar secara transparan menggunakan Machine Learning.
            </p>
            <div className="flex flex-wrap items-center gap-4 mt-10">
              <Link
                to="/register"
                className="bg-brand-600 text-white font-semibold px-8 py-3.5 rounded-full hover:bg-brand-700 shadow-xl shadow-brand-500/30 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
              >
                Mulai Prediksi →
              </Link>
              <Link
                to="/login"
                className="bg-white border-2 border-slate-200 text-slate-700 font-semibold px-8 py-3.5 rounded-full hover:border-brand-300 hover:bg-slate-50 hover:text-brand-700 transition-colors duration-300"
              >
                Sudah Punya Akun
              </Link>
            </div>
          </div>

          {/* Kanan: ilustrasi mobil */}
          <div className="flex items-center justify-center relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-brand-100 to-white rounded-full blur-2xl opacity-60"></div>
            <div className="relative z-10 transform hover:scale-105 transition-transform duration-700 ease-out">
              <CarIllustration />
            </div>
          </div>
        </div>
      </section>

      {/* Testimoni */}
      <section className="bg-brand-950 py-24 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-4xl bg-brand-800/20 blur-[100px] rounded-full"></div>
        <div className="max-w-5xl mx-auto px-4 relative z-10">
          <p className="text-brand-300 text-sm font-bold uppercase tracking-widest text-center mb-3">
            Kata Pengguna
          </p>
          <h2 className="text-3xl lg:text-4xl font-display font-bold text-white text-center mb-12">
            Dipakai untuk estimasi sebelum transaksi
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {TESTIMONI.map((t) => (
              <TestimoniCard key={t.nama} {...t} />
            ))}
          </div>
        </div>
      </section>

      {/* Cara kerja */}
      <section className="py-24 bg-white relative">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-4xl font-display font-bold text-slate-900 mb-14">Cara Kerja</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 text-left">
            <StepCard step="1" title="Isi Spesifikasi" desc="Masukkan merek, model, tahun, kilometer, dan kondisi kendaraan dengan form yang intuitif." />
            <StepCard step="2" title="AI Memproses" desc="Model Machine Learning menganalisis data dan deskripsi teks untuk menghitung harga." />
            <StepCard step="3" title="Hasil Transparan" desc="Dapatkan estimasi harga lengkap dengan rincian (SHAP) mengapa angka tersebut muncul." />
          </div>
        </div>
      </section>

      {/* CTA penutup */}
      <section className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="relative overflow-hidden bg-gradient-to-br from-brand-900 to-brand-600 rounded-3xl p-12 lg:p-16 shadow-2xl shadow-brand-900/20">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
          
          <h2 className="text-3xl lg:text-4xl font-display font-bold text-white mb-4 relative z-10">
            Siap tahu estimasi harga mobilmu?
          </h2>
          <p className="text-brand-100 text-lg mb-8 max-w-lg mx-auto relative z-10">
            Gratis, tanpa kartu kredit. Dapatkan insight berharga dalam hitungan detik.
          </p>
          <Link
            to="/register"
            className="inline-block relative z-10 bg-white text-brand-700 font-bold px-10 py-4 rounded-full hover:bg-brand-50 hover:scale-105 shadow-xl transition-all duration-300"
          >
            Daftar Sekarang →
          </Link>
        </div>
      </section>

      <footer className="border-t border-gray-200 text-gray-400 text-center text-sm py-6">
        © 2026 PrediksiOto — Capstone Project, Politeknik Negeri Padang
      </footer>
    </div>
  );
}

function TestimoniCard({ nama, kota, teks, avatar }) {
  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors">
      <p className="text-brand-50 text-base leading-relaxed mb-6">"{teks}"</p>
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-brand-500 text-white font-bold flex items-center justify-center shadow-lg">
          {avatar}
        </div>
        <div>
          <p className="text-white text-sm font-medium">{nama}</p>
          <p className="text-blue-300 text-xs">{kota}</p>
        </div>
      </div>
    </div>
  );
}

function StepCard({ step, title, desc }) {
  return (
    <div>
      <div className="w-9 h-9 rounded-full bg-blue-700 text-white font-bold flex items-center justify-center text-sm mb-3">
        {step}
      </div>
      <h4 className="font-semibold text-gray-800 mb-1.5">{title}</h4>
      <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}

function CarIllustration() {
  return (
    <svg viewBox="0 0 480 320" className="w-full max-w-md" role="img" aria-label="Ilustrasi mobil">
      <ellipse cx="240" cy="265" rx="190" ry="14" fill="#E5E7EB" />
      <path
        d="M70 215 Q70 175 110 168 L150 130 Q165 115 190 115 L300 115 Q325 115 340 130 L375 168 Q415 175 415 215 L415 230 Q415 245 400 245 L90 245 Q75 245 75 230 Z"
        fill="#1D4ED8"
      />
      <path
        d="M155 168 L185 135 Q195 125 210 125 L280 125 Q295 125 305 135 L335 168 Z"
        fill="#BFDBFE"
      />
      <rect x="158" y="166" width="160" height="6" fill="#1E3A8A" opacity="0.4" />
      <circle cx="150" cy="245" r="32" fill="#111827" />
      <circle cx="150" cy="245" r="14" fill="#9CA3AF" />
      <circle cx="330" cy="245" r="32" fill="#111827" />
      <circle cx="330" cy="245" r="14" fill="#9CA3AF" />
      <rect x="80" y="190" width="26" height="14" rx="4" fill="#FBBF24" />
      <rect x="374" y="190" width="26" height="14" rx="4" fill="#EF4444" />
      <rect x="100" y="215" width="50" height="6" rx="3" fill="#FFFFFF" opacity="0.5" />
    </svg>
  );
}