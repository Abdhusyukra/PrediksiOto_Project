import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/home");
  };

  const navLink = (to, label) => (
    <Link to={to} className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${location.pathname === to
        ? "bg-brand-50 text-brand-700 shadow-sm border border-brand-100"
        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
      }`}>{label}</Link>
  );

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <img src="/logo-prediksioto.png" alt="PrediksiOto" className="h-10 w-auto group-hover:scale-105 transition-transform" />
          <span className="text-brand-900 font-display font-bold text-xl tracking-tight">PrediksiOto</span>
        </Link>
        <div className="flex items-center gap-1">
          {navLink("/", "Dashboard")}
          {navLink("/predict", "Prediksi")}
          {navLink("/history", "Riwayat")}
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-sm">
              {user.nama ? user.nama.charAt(0).toUpperCase() : "U"}
            </div>
            <span className="text-gray-700 text-sm font-medium">{user.nama || "User"}</span>
          </div>
          <button onClick={handleLogout}
            className="text-gray-500 hover:text-red-600 text-sm font-medium px-3 py-1.5 rounded-md hover:bg-red-50 transition-colors">
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}