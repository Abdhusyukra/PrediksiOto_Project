import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Home              from "./pages/Home";
import Login             from "./pages/Login";
import Register          from "./pages/Register";
import Dashboard          from "./pages/Dashboard";
import Predict            from "./pages/Predict";
import Result             from "./pages/Result";
import History            from "./pages/History";
import HistoryDetail      from "./pages/HistoryDetail";
import ProtectedRoute     from "./components/ProtectedRoute";

import AdminLogin           from "./pages/AdminLogin";
import AdminDashboard       from "./pages/AdminDashboard";
import AdminUsers           from "./pages/AdminUsers";
import AdminPredictions     from "./pages/AdminPredictions";
import AdminProtectedRoute  from "./components/AdminProtectedRoute";
import AdminLayout          from "./components/AdminLayout";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Protected: User */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/predict" element={<Predict />} />
          <Route path="/result" element={<Result />} />
          <Route path="/history" element={<History />} />
          <Route path="/history/:id" element={<HistoryDetail />} />
        </Route>

        {/* Protected: Admin */}
        <Route element={<AdminProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin/dashboard"   element={<AdminDashboard />} />
            <Route path="/admin/users"       element={<AdminUsers />} />
            <Route path="/admin/predictions" element={<AdminPredictions />} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/home" />} />
      </Routes>
    </BrowserRouter>
  );
}