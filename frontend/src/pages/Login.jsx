import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../services/api";
import Input from "../components/ui/Input";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await login(form);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Login gagal. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-brand-50 via-white to-brand-100 flex items-center justify-center p-4">
      {/* Decorative blobs */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-brand-300/30 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl"></div>

      <div className="w-full max-w-md relative z-10">

        {/* Tombol back ke landing page */}
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-slate-500 text-sm font-medium hover:text-brand-600 mb-6 transition-colors"
        >
          ← Kembali ke Beranda
        </Link>

        <div className="bg-white/80 backdrop-blur-xl border border-white/40 rounded-3xl shadow-xl shadow-brand-900/5 w-full p-8 sm:p-10">
          <div className="text-center mb-8">
            <img src="/logo-prediksioto.png" alt="PrediksiOto" className="h-16 w-auto mx-auto mb-4" />
            <h1 className="text-3xl font-display font-bold text-slate-900 tracking-tight">Selamat Datang</h1>
            <p className="text-slate-500 text-sm mt-2">Masuk untuk mulai prediksi harga mobil</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-6 text-sm flex items-center gap-2">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input 
              label="Email" type="email" name="email" value={form.email}
              onChange={handleChange} required placeholder="email@contoh.com"
            />
            <Input 
              label="Password" type="password" name="password" value={form.password}
              onChange={handleChange} required placeholder="••••••••"
            />
            <button
              type="submit" disabled={loading}
              className="w-full bg-brand-600 hover:bg-brand-700 disabled:bg-brand-400 text-white font-semibold py-3 rounded-full shadow-md shadow-brand-500/20 hover:shadow-lg hover:-translate-y-0.5 transition-all mt-2"
            >
              {loading ? "Memproses..." : "Masuk Sekarang"}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Belum punya akun?{" "}
            <Link to="/register" className="text-brand-600 hover:text-brand-700 font-semibold hover:underline">
              Daftar di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}