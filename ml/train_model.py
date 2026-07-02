import os, joblib
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, r2_score
from sklearn.preprocessing import LabelEncoder
from sklearn.feature_extraction.text import TfidfVectorizer
from xgboost import XGBRegressor

MODEL_DIR = "model"
os.makedirs(MODEL_DIR, exist_ok=True)

print("[1/5] Load dataset...")
df = pd.read_excel("../dataset/dataset_mobil_bekas_v2.xlsx")
df = df.rename(columns={
    "tahun_produksi"    : "tahun",
    "kapasitas_mesin_cc": "kapasitas_cc",
    "deskripsi_iklan"   : "deskripsi",
})
df["deskripsi"] = df["deskripsi"].fillna("")
print(f"  {len(df)} baris dimuat")

print("[2/5] Encode fitur kategorikal...")
KATEGORIK = ["merek","model","transmisi","bahan_bakar",
             "status_pajak","riwayat_servis","kondisi_ban","kondisi_body"]
encoders = {}
for col in KATEGORIK:
    df[col] = df[col].str.strip().str.lower()
    enc = LabelEncoder()
    df[f"{col}_enc"] = enc.fit_transform(df[col])
    encoders[col] = enc
    joblib.dump(enc, f"{MODEL_DIR}/enc_{col}.pkl")
print(f"  ✓ {len(KATEGORIK)} encoder disimpan")

merek_model_map = {}
for merek in df["merek"].unique():
    models = sorted(df[df["merek"]==merek]["model"].unique().tolist())
    merek_model_map[merek] = models
joblib.dump(merek_model_map, f"{MODEL_DIR}/merek_model_map.pkl")
print(f"  ✓ Mapping merek-model disimpan")

print("[3/5] TF-IDF vectorizer...")
tfidf = TfidfVectorizer(max_features=50, ngram_range=(1,2), min_df=3)
tfidf_matrix = tfidf.fit_transform(df["deskripsi"]).toarray()
joblib.dump(tfidf, f"{MODEL_DIR}/tfidf_vectorizer.pkl")
print(f"  ✓ {tfidf_matrix.shape[1]} fitur teks")

print("[4/5] Gabung fitur...")
FITUR_NUMERIK = ["merek_enc","model_enc","tahun","kilometer",
                 "kapasitas_cc","kapasitas_baterai_kwh",
                 "jumlah_pemilik","transmisi_enc","bahan_bakar_enc",
                 "status_pajak_enc","riwayat_servis_enc",
                 "kondisi_ban_enc","kondisi_body_enc"]

fitur_numerik = df[FITUR_NUMERIK].values
X = np.hstack([fitur_numerik, tfidf_matrix])
y = df["harga"].values

feature_names = FITUR_NUMERIK + [f"tfidf_{i}" for i in range(tfidf_matrix.shape[1])]
joblib.dump(feature_names, f"{MODEL_DIR}/feature_names.pkl")
joblib.dump(FITUR_NUMERIK, f"{MODEL_DIR}/fitur_numerik_names.pkl")
print(f"  ✓ Total fitur: {X.shape[1]}")

print("[5/5] Training XGBoost...")
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
model = XGBRegressor(
    n_estimators=300, learning_rate=0.05, max_depth=6,
    subsample=0.8, colsample_bytree=0.8, random_state=42, n_jobs=-1
)
model.fit(X_train, y_train, verbose=False)

y_pred = model.predict(X_test)
print(f"\n{'='*40}")
print(f"  MAE : Rp {mean_absolute_error(y_test,y_pred):>15,.0f}")
print(f"  R²  : {r2_score(y_test,y_pred):.4f}")
print(f"{'='*40}")

joblib.dump(model, f"{MODEL_DIR}/xgboost_model.pkl")
print(f"\n✅ Selesai! Model disimpan di ml/model/")