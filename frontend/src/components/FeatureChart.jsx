import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

const COLORS = ["#3B82F6","#10B981","#F59E0B","#8B5CF6","#EF4444","#06B6D4"];

export default function FeatureChart({ data }) {
  if (!data || Object.keys(data).length === 0) return null;
  const chartData = Object.entries(data)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  return (
    <div className="bg-white rounded-xl shadow p-5">
      <h3 className="font-semibold text-gray-700 mb-4">📊 Pengaruh Fitur terhadap Prediksi</h3>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={chartData} layout="vertical"
          margin={{ top: 0, right: 20, bottom: 0, left: 90 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" unit="%" tick={{ fontSize: 12 }} />
          <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={85} />
          <Tooltip formatter={(v) => [`${v.toFixed(2)}%`, "Kontribusi"]} />
          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
            {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}