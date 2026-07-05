import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { predict } from "../services/api";
import api from "../services/api";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";

const MEREK_LIST = [
  "toyota","honda","suzuki","daihatsu","mitsubishi",
  "nissan","wuling","hyundai","mazda","bmw","mercedes-benz"
];

export default function Predict() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    deskripsi:"", merek:"", model_mobil:"", tahun:"", kilometer:"",
    transmisi:"", bahan_bakar:"", kapasitas_cc:"", kapasitas_baterai_kwh:"",
    jumlah_pemilik:"1", status_pajak:"hidup",
    riwayat_servis:"lengkap", kondisi_ban:"tebal", kondisi_body:"mulus"
  });
  const [modelList, setModelList]   = useState([]);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState("");

  // State foto
  const [fotoPreview, setFotoPreview] = useState(null);
  const [fotoPath, setFotoPath]       = useState("");
  const [uploadingFoto, setUploadingFoto] = useState(false);

  const isListrik = form.bahan_bakar === "listrik";

  useEffect(() => {
    if (!form.merek) { setModelList([]); return; }
    api.get(`/api/models/${form.merek}`)
      .then((r) => setModelList(r.data.models || []))
      .catch(() => setModelList([]));
    setForm((f) => ({ ...f, model_mobil: "" }));
  }, [form.merek]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "bahan_bakar") {
      setForm((f) => ({ ...f, bahan_bakar: value, kapasitas_cc: "", kapasitas_baterai_kwh: "" }));
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  };

  const handleFotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Preview lokal dulu
    setFotoPreview(URL.createObjectURL(file));
    setUploadingFoto(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("foto", file);
      const res = await api.post("/api/upload-foto", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setFotoPath(res.data.foto_path);
    } catch (err) {
      setError("Gagal upload foto. Coba lagi.");
      setFotoPreview(null);
    } finally {
      setUploadingFoto(false);
    }
  };

  const hapusFoto = () => {
    setFotoPreview(null);
    setFotoPath("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const required = ["merek","model_mobil","tahun","kilometer","transmisi","bahan_bakar"];
    for (const key of required) {
      if (!form[key]) { setError(`Field ${key.replace("_"," ")} wajib diisi`); return; }
    }
    if (isListrik && !form.kapasitas_baterai_kwh) {
      setError("Kapasitas baterai (kWh) wajib diisi untuk mobil listrik");
      return;
    }
    if (!isListrik && !form.kapasitas_cc) {
      setError("Kapasitas mesin (cc) wajib diisi");
      return;
    }

    setLoading(true);
    try {
      const res = await predict({
        ...form,
        tahun                : Number(form.tahun),
        kilometer             : Number(form.kilometer),
        kapasitas_cc          : Number(form.kapasitas_cc || 0),
        kapasitas_baterai_kwh : Number(form.kapasitas_baterai_kwh || 0),
        jumlah_pemilik        : Number(form.jumlah_pemilik),
        foto_path             : fotoPath,
      });
      sessionStorage.setItem("hasil_prediksi", JSON.stringify({ ...res.data, input: form }));
      navigate("/result");
    } catch (err) {
      setError(err.response?.data?.message || "Prediksi gagal. Pastikan backend berjalan.");
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">🔍 Prediksi Harga</h2>
        <p className="text-gray-500 text-sm mt-1">Isi spesifikasi kendaraan selengkap mungkin</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Upload Foto */}
        <div className="bg-white rounded-xl shadow p-5">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            📷 Foto Kendaraan
            <span className="font-normal text-gray-400 ml-1">(opsional — untuk dokumentasi)</span>
          </label>

          {fotoPreview ? (
            <div className="relative">
              <img
                src={fotoPreview}
                alt="Preview kendaraan"
                className="w-full h-56 object-cover rounded-lg border border-gray-200"
              />
              {uploadingFoto && (
                <div className="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm font-medium">Mengupload...</span>
                </div>
              )}
              <button
                type="button"
                onClick={hapusFoto}
                className="absolute top-2 right-2 bg-white/90 hover:bg-white text-red-600 text-xs font-semibold px-3 py-1.5 rounded-lg shadow"
              >
                ✕ Hapus
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-lg py-8 cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-colors">
              <span className="text-3xl">📸</span>
              <span className="text-sm text-gray-500">Klik untuk ambil/upload foto kendaraan</span>
              <span className="text-xs text-gray-400">JPG, PNG, atau WEBP</span>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFotoChange}
                className="hidden"
              />
            </label>
          )}

          <p className="text-xs text-gray-400 mt-2">
            * Foto digunakan untuk dokumentasi riwayat. Kondisi kendaraan tetap diisi manual di bawah.
          </p>
        </div>

        {/* Deskripsi */}
        <div className="bg-white rounded-xl shadow p-5">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Deskripsi Kendaraan
            <span className="font-normal text-gray-400 ml-1">(opsional)</span>
          </label>
          <textarea name="deskripsi" value={form.deskripsi}
            onChange={handleChange} rows={3}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            placeholder="Contoh: servis rutin bengkel resmi, bebas banjir, interior rapi..." />
        </div>

        {/* Spesifikasi Utama */}
        <div className="bg-white rounded-xl shadow p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">📋 Spesifikasi Utama</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select label="Merek" required name="merek" value={form.merek} onChange={handleChange}>
              <option value="">Pilih merek</option>
              {MEREK_LIST.map((m) => (
                <option key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</option>
              ))}
            </Select>

            <Select label="Model" required name="model_mobil" value={form.model_mobil} onChange={handleChange} disabled={!form.merek}>
              <option value="">{form.merek ? "Pilih model" : "Pilih merek dulu"}</option>
              {modelList.map((m) => (
                <option key={m} value={m.toLowerCase()}>{m}</option>
              ))}
            </Select>

            <Input label="Tahun" required type="number" name="tahun" value={form.tahun} onChange={handleChange} min="2010" max="2025" placeholder="2020" />

            <Input label="Kilometer" required type="number" name="kilometer" value={form.kilometer} onChange={handleChange} min="0" placeholder="50000" />

            <Select label="Transmisi" required name="transmisi" value={form.transmisi} onChange={handleChange}>
              <option value="">Pilih transmisi</option>
              <option value="matik">Matik / AT</option>
              <option value="manual">Manual / MT</option>
            </Select>

            <Select label="Bahan Bakar" required name="bahan_bakar" value={form.bahan_bakar} onChange={handleChange}>
              <option value="">Pilih bahan bakar</option>
              <option value="bensin">Bensin</option>
              <option value="diesel">Diesel</option>
              <option value="listrik">Listrik (EV)</option>
            </Select>

            {isListrik ? (
              <Input label="Kapasitas Baterai (kWh)" required type="number" name="kapasitas_baterai_kwh" value={form.kapasitas_baterai_kwh} onChange={handleChange} min="10" max="150" placeholder="contoh: 17, 31, 72" />
            ) : (
              <Input label="Kapasitas Mesin (cc)" required type="number" name="kapasitas_cc" value={form.kapasitas_cc} onChange={handleChange} min="660" max="5000" placeholder="1500" />
            )}
          </div>
          {isListrik && (
            <p className="text-xs text-blue-600 mt-3 bg-blue-50 rounded-lg px-3 py-2">
              ⚡ Mobil listrik tidak memiliki kapasitas mesin (cc) — isi kapasitas baterai dalam kWh.
              Contoh: Wuling Air EV ±17 kWh, BinguoEV ±31 kWh, Hyundai Ioniq 5 ±72 kWh.
            </p>
          )}
        </div>

        {/* Kondisi Kendaraan */}
        <div className="bg-white rounded-xl shadow p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">🔧 Kondisi Kendaraan</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Jumlah Pemilik Sebelumnya" type="number" name="jumlah_pemilik" value={form.jumlah_pemilik} onChange={handleChange} min="1" max="10" />

            <Select label="Status Pajak" name="status_pajak" value={form.status_pajak} onChange={handleChange}>
              <option value="hidup">Hidup</option>
              <option value="mati <1 tahun">Mati kurang dari 1 tahun</option>
              <option value="mati >1 tahun">Mati lebih dari 1 tahun</option>
            </Select>

            <Select label="Riwayat Servis" name="riwayat_servis" value={form.riwayat_servis} onChange={handleChange}>
              <option value="lengkap">Lengkap</option>
              <option value="sebagian">Sebagian</option>
              <option value="tidak ada">Tidak Ada</option>
            </Select>

            <Select label="Kondisi Ban" name="kondisi_ban" value={form.kondisi_ban} onChange={handleChange}>
              <option value="tebal">Tebal</option>
              <option value="sedang">Sedang</option>
              <option value="tipis">Tipis</option>
            </Select>

            <Select label="Kondisi Body" name="kondisi_body" value={form.kondisi_body} onChange={handleChange}>
              <option value="mulus">Mulus</option>
              <option value="lecet ringan">Lecet Ringan</option>
              <option value="bekas cat ulang">Bekas Cat Ulang</option>
            </Select>
          </div>
        </div>

        <button type="submit" disabled={loading || uploadingFoto}
          className="w-full bg-blue-700 hover:bg-blue-800 disabled:bg-blue-400 text-white font-semibold py-3 rounded-xl transition-colors text-base">
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
              Memproses...
            </span>
          ) : "🚀 Prediksi Harga"}
        </button>
      </form>
    </div>
  );
}