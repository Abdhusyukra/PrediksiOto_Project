import os, re, uuid, joblib, numpy as np
import shap
from datetime import timedelta
from dotenv import load_dotenv
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import (
    JWTManager, create_access_token,
    jwt_required, get_jwt_identity, get_jwt
)
from werkzeug.security import generate_password_hash, check_password_hash

load_dotenv()

app = Flask(__name__)
CORS(app)

app.config["SQLALCHEMY_DATABASE_URI"] = (
    f"mysql+mysqlconnector://{os.getenv('DB_USER')}:{os.getenv('DB_PASSWORD')}"
    f"@{os.getenv('DB_HOST')}:{os.getenv('DB_PORT',3306)}/{os.getenv('DB_NAME')}"
)
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["JWT_SECRET_KEY"]           = os.getenv("JWT_SECRET_KEY")
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=24)

UPLOAD_DIR = "uploads"
ALLOWED_EXT = {"png", "jpg", "jpeg", "webp"}
os.makedirs(UPLOAD_DIR, exist_ok=True)

db  = SQLAlchemy(app)
jwt = JWTManager(app)

# ── Models ORM ────────────────────────────────────────────────
class User(db.Model):
    __tablename__ = "users"
    id         = db.Column(db.Integer, primary_key=True)
    nama       = db.Column(db.String(100), nullable=False)
    email      = db.Column(db.String(150), unique=True, nullable=False)
    password   = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, server_default=db.func.now())

class Admin(db.Model):
    __tablename__ = "admin"
    id         = db.Column(db.Integer, primary_key=True)
    username   = db.Column(db.String(50), unique=True, nullable=False)
    password   = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, server_default=db.func.now())

class PrediksiLog(db.Model):
    __tablename__ = "prediksi_log"
    id                    = db.Column(db.Integer, primary_key=True)
    user_id               = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)
    deskripsi_teks        = db.Column(db.Text)
    merek                 = db.Column(db.String(100))
    model_mobil           = db.Column(db.String(100))
    tahun                 = db.Column(db.Integer)
    kilometer             = db.Column(db.Integer)
    transmisi             = db.Column(db.String(50))
    bahan_bakar           = db.Column(db.String(50))
    kapasitas_cc          = db.Column(db.Integer)
    kapasitas_baterai_kwh = db.Column(db.Integer)
    jumlah_pemilik        = db.Column(db.Integer)
    status_pajak          = db.Column(db.String(50))
    riwayat_servis        = db.Column(db.String(50))
    kondisi_ban           = db.Column(db.String(50))
    kondisi_body          = db.Column(db.String(50))
    foto_path             = db.Column(db.String(255))
    harga_prediksi        = db.Column(db.BigInteger)
    shap_breakdown        = db.Column(db.Text)
    created_at            = db.Column(db.DateTime, server_default=db.func.now())

# ── Load Model ────────────────────────────────────────────────
MODEL_DIR       = "model"
model           = joblib.load(f"{MODEL_DIR}/xgboost_model.pkl")
tfidf           = joblib.load(f"{MODEL_DIR}/tfidf_vectorizer.pkl")
enc_merek       = joblib.load(f"{MODEL_DIR}/enc_merek.pkl")
enc_model_mob   = joblib.load(f"{MODEL_DIR}/enc_model.pkl")
enc_trans       = joblib.load(f"{MODEL_DIR}/enc_transmisi.pkl")
enc_bbkar       = joblib.load(f"{MODEL_DIR}/enc_bahan_bakar.pkl")
enc_pajak       = joblib.load(f"{MODEL_DIR}/enc_status_pajak.pkl")
enc_servis      = joblib.load(f"{MODEL_DIR}/enc_riwayat_servis.pkl")
enc_ban         = joblib.load(f"{MODEL_DIR}/enc_kondisi_ban.pkl")
enc_body        = joblib.load(f"{MODEL_DIR}/enc_kondisi_body.pkl")
merek_model_map = joblib.load(f"{MODEL_DIR}/merek_model_map.pkl")
print("✓ Model berhasil diload")

explainer = shap.TreeExplainer(model)
print("✓ SHAP explainer siap")

NAMA_FITUR_NUMERIK = [
    "Merek", "Model", "Tahun", "Kilometer", "Kapasitas Mesin",
    "Kapasitas Baterai", "Jumlah Pemilik", "Transmisi", "Bahan Bakar",
    "Status Pajak", "Riwayat Servis", "Kondisi Ban", "Kondisi Body"
]
JUMLAH_FITUR_NUMERIK = len(NAMA_FITUR_NUMERIK)

# ── Helpers ───────────────────────────────────────────────────
def encode_aman(encoder, nilai):
    try:
        return int(encoder.transform([str(nilai).lower().strip()])[0])
    except:
        return 0

def error(msg, code=400):
    return jsonify({"status":"error","message":msg}), code

def ok(data, code=200):
    return jsonify({"status":"success",**data}), code

def file_diizinkan(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXT

def hitung_shap_breakdown(X, is_listrik):
    shap_values = explainer.shap_values(X)[0]
    base_value  = float(explainer.expected_value)

    if is_listrik:
        fitur_disembunyikan = {"Kapasitas Mesin"}
    else:
        fitur_disembunyikan = {"Kapasitas Baterai"}

    breakdown = []
    for i, nama in enumerate(NAMA_FITUR_NUMERIK):
        if nama in fitur_disembunyikan:
            continue
        breakdown.append({
            "fitur": nama,
            "pengaruh": float(shap_values[i])
        })

    pengaruh_deskripsi = float(np.sum(shap_values[JUMLAH_FITUR_NUMERIK:]))
    breakdown.append({
        "fitur": "Deskripsi Iklan",
        "pengaruh": pengaruh_deskripsi
    })

    breakdown.sort(key=lambda x: abs(x["pengaruh"]), reverse=True)

    return {
        "harga_dasar": round(base_value / 1_000_000) * 1_000_000,
        "rincian": [
            {
                "fitur": b["fitur"],
                "pengaruh": round(b["pengaruh"] / 1_000_000) * 1_000_000,
                "arah": "naik" if b["pengaruh"] >= 0 else "turun"
            }
            for b in breakdown
        ]
    }

def admin_required(fn):
    """Decorator: pastikan JWT yang dipakai adalah JWT milik admin."""
    from functools import wraps
    @wraps(fn)
    @jwt_required()
    def wrapper(*args, **kwargs):
        claims = get_jwt()
        if claims.get("role") != "admin":
            return error("Akses ditolak. Hanya untuk admin.", 403)
        return fn(*args, **kwargs)
    return wrapper

# ── Routes: Umum ──────────────────────────────────────────────
@app.route("/api/health")
def health():
    return ok({"message":"PrediksiOto API aktif"})

@app.route("/api/models/<merek>", methods=["GET"])
def get_models(merek):
    models = merek_model_map.get(merek.lower().strip(), [])
    return ok({"models": models})

@app.route("/uploads/<filename>")
def serve_upload(filename):
    return send_from_directory(UPLOAD_DIR, filename)

@app.route("/api/upload-foto", methods=["POST"])
@jwt_required()
def upload_foto():
    if "foto" not in request.files:
        return error("Tidak ada file foto")
    file = request.files["foto"]
    if file.filename == "":
        return error("Nama file kosong")
    if not file_diizinkan(file.filename):
        return error("Format file harus jpg, jpeg, png, atau webp")

    ext = file.filename.rsplit(".", 1)[1].lower()
    nama_unik = f"{uuid.uuid4().hex}.{ext}"
    file.save(os.path.join(UPLOAD_DIR, nama_unik))

    return ok({"foto_path": nama_unik, "foto_url": f"/uploads/{nama_unik}"})

# ── Routes: User ──────────────────────────────────────────────
@app.route("/api/register", methods=["POST"])
def register():
    d        = request.get_json()
    nama     = (d.get("nama") or "").strip()
    email    = (d.get("email") or "").strip().lower()
    password = (d.get("password") or "").strip()
    if not all([nama, email, password]):
        return error("Semua field wajib diisi")
    if User.query.filter_by(email=email).first():
        return error("Email sudah terdaftar", 409)
    db.session.add(User(
        nama=nama, email=email,
        password=generate_password_hash(password)
    ))
    db.session.commit()
    return ok({"message": f"Akun {nama} berhasil dibuat"}, 201)

@app.route("/api/login", methods=["POST"])
def login():
    d     = request.get_json()
    email = (d.get("email") or "").strip().lower()
    pw    = (d.get("password") or "").strip()
    user  = User.query.filter_by(email=email).first()
    if not user or not check_password_hash(user.password, pw):
        return error("Email atau password salah", 401)
    token = create_access_token(identity=str(user.id), additional_claims={"role": "user"})
    return ok({"token":token,"user":{"id":user.id,"nama":user.nama,"email":user.email}})

@app.route("/api/predict", methods=["POST"])
@jwt_required()
def predict():
    claims = get_jwt()
    if claims.get("role") != "user":
        return error("Akses ditolak", 403)

    d              = request.get_json()
    deskripsi      = (d.get("deskripsi") or "").strip()
    merek          = (d.get("merek") or "").strip()
    model_mobil    = (d.get("model_mobil") or "").strip()
    tahun          = d.get("tahun")
    kilometer      = d.get("kilometer")
    transmisi      = (d.get("transmisi") or "").strip()
    bahan_bakar    = (d.get("bahan_bakar") or "").strip()
    kapasitas_cc   = d.get("kapasitas_cc", 0)
    kapasitas_kwh  = d.get("kapasitas_baterai_kwh", 0)
    jumlah_pemilik = d.get("jumlah_pemilik", 1)
    status_pajak   = (d.get("status_pajak") or "hidup").strip()
    riwayat_servis = (d.get("riwayat_servis") or "lengkap").strip()
    kondisi_ban    = (d.get("kondisi_ban") or "tebal").strip()
    kondisi_body   = (d.get("kondisi_body") or "mulus").strip()
    foto_path      = (d.get("foto_path") or "").strip()

    if not all([merek, model_mobil, tahun, kilometer, transmisi, bahan_bakar]):
        return error("Merek, model, tahun, kilometer, transmisi, bahan_bakar wajib diisi")

    is_listrik = bahan_bakar.lower().strip() == "listrik"
    if is_listrik and not kapasitas_kwh:
        return error("Kapasitas baterai (kWh) wajib diisi untuk mobil listrik")
    if not is_listrik and not kapasitas_cc:
        return error("Kapasitas mesin (cc) wajib diisi")

    try:
        tahun          = int(tahun)
        kilometer      = int(kilometer)
        kapasitas_cc   = int(kapasitas_cc or 0)
        kapasitas_kwh  = int(kapasitas_kwh or 0)
        jumlah_pemilik = int(jumlah_pemilik)
    except:
        return error("Tahun, kilometer, kapasitas, jumlah pemilik harus angka")

    teks_bersih  = re.sub(r"[^a-z0-9\s]", " ", deskripsi.lower())
    tfidf_vector = tfidf.transform([teks_bersih]).toarray()

    fitur = np.array([[
        encode_aman(enc_merek,     merek),
        encode_aman(enc_model_mob, model_mobil),
        tahun, kilometer,
        kapasitas_cc,
        kapasitas_kwh,
        jumlah_pemilik,
        encode_aman(enc_trans,  transmisi),
        encode_aman(enc_bbkar,  bahan_bakar),
        encode_aman(enc_pajak,  status_pajak),
        encode_aman(enc_servis, riwayat_servis),
        encode_aman(enc_ban,    kondisi_ban),
        encode_aman(enc_body,   kondisi_body),
    ]], dtype=float)

    X     = np.hstack([fitur, tfidf_vector])
    harga = max(int(round(float(model.predict(X)[0]) / 1_000_000) * 1_000_000), 10_000_000)

    imp    = model.feature_importances_
    labels = ["Merek","Model","Tahun","Kilometer","Kapasitas CC","Kapasitas Baterai",
              "Jumlah Pemilik","Transmisi","Bahan Bakar",
              "Status Pajak","Riwayat Servis","Kondisi Ban","Kondisi Body"]
    feat_imp = {labels[i]: round(float(imp[i])*100, 2) for i in range(len(labels))}

    shap_data = hitung_shap_breakdown(X, is_listrik)

    import json
    user_id = int(get_jwt_identity())
    log = PrediksiLog(
        user_id=user_id, deskripsi_teks=deskripsi[:500],
        merek=merek, model_mobil=model_mobil,
        tahun=tahun, kilometer=kilometer,
        transmisi=transmisi, bahan_bakar=bahan_bakar,
        kapasitas_cc=kapasitas_cc, kapasitas_baterai_kwh=kapasitas_kwh,
        jumlah_pemilik=jumlah_pemilik,
        status_pajak=status_pajak, riwayat_servis=riwayat_servis,
        kondisi_ban=kondisi_ban, kondisi_body=kondisi_body,
        foto_path=foto_path or None,
        shap_breakdown=json.dumps(shap_data),
        harga_prediksi=harga
    )
    db.session.add(log)
    db.session.commit()

    return ok({
        "harga_prediksi"    : harga,
        "harga_format"      : f"Rp {harga:,.0f}".replace(",","."),
        "feature_importance": feat_imp,
        "shap_breakdown"    : shap_data,
        "foto_url"          : f"/uploads/{foto_path}" if foto_path else None,
    })

@app.route("/api/history", methods=["GET"])
@jwt_required()
def history():
    uid  = int(get_jwt_identity())
    logs = PrediksiLog.query.filter_by(user_id=uid)\
           .order_by(PrediksiLog.created_at.desc()).limit(50).all()
    return ok({"riwayat":[{
        "id":l.id,"merek":l.merek,"model_mobil":l.model_mobil,
        "tahun":l.tahun,"kilometer":l.kilometer,
        "harga_prediksi":l.harga_prediksi,
        "foto_url": f"/uploads/{l.foto_path}" if l.foto_path else None,
        "created_at":l.created_at.isoformat() if l.created_at else None
    } for l in logs]})

@app.route("/api/history/<int:lid>", methods=["GET"])
@jwt_required()
def history_detail(lid):
    import json
    uid = int(get_jwt_identity())
    l   = PrediksiLog.query.filter_by(id=lid, user_id=uid).first()
    if not l: return error("Tidak ditemukan", 404)

    shap_data = json.loads(l.shap_breakdown) if l.shap_breakdown else None

    return ok({"detail":{
        "id":l.id,"deskripsi_teks":l.deskripsi_teks,
        "merek":l.merek,"model_mobil":l.model_mobil,
        "tahun":l.tahun,"kilometer":l.kilometer,
        "transmisi":l.transmisi,"bahan_bakar":l.bahan_bakar,
        "kapasitas_cc":l.kapasitas_cc,
        "kapasitas_baterai_kwh":l.kapasitas_baterai_kwh,
        "jumlah_pemilik":l.jumlah_pemilik,
        "status_pajak":l.status_pajak,"riwayat_servis":l.riwayat_servis,
        "kondisi_ban":l.kondisi_ban,"kondisi_body":l.kondisi_body,
        "foto_url": f"/uploads/{l.foto_path}" if l.foto_path else None,
        "shap_breakdown": shap_data,
        "harga_prediksi":l.harga_prediksi,
        "created_at":l.created_at.isoformat() if l.created_at else None
    }})

@app.route("/api/history/<int:lid>", methods=["DELETE"])
@jwt_required()
def history_delete(lid):
    uid = int(get_jwt_identity())
    l   = PrediksiLog.query.filter_by(id=lid, user_id=uid).first()
    if not l: return error("Tidak ditemukan", 404)
    db.session.delete(l)
    db.session.commit()
    return ok({"message":"Riwayat dihapus"})

# ── Routes: Admin ─────────────────────────────────────────────
@app.route("/api/admin/login", methods=["POST"])
def admin_login():
    d        = request.get_json()
    username = (d.get("username") or "").strip().lower()
    pw       = (d.get("password") or "").strip()
    adm      = Admin.query.filter_by(username=username).first()
    if not adm or not check_password_hash(adm.password, pw):
        return error("Username atau password salah", 401)
    token = create_access_token(identity=str(adm.id), additional_claims={"role": "admin"})
    return ok({"token": token, "admin": {"id": adm.id, "username": adm.username}})

@app.route("/api/admin/stats", methods=["GET"])
@admin_required
def admin_stats():
    total_user      = User.query.count()
    total_prediksi  = PrediksiLog.query.count()

    rata_rata_harga = db.session.query(db.func.avg(PrediksiLog.harga_prediksi)).scalar() or 0

    merek_terpopuler = (
        db.session.query(PrediksiLog.merek, db.func.count(PrediksiLog.id).label("jumlah"))
        .group_by(PrediksiLog.merek)
        .order_by(db.func.count(PrediksiLog.id).desc())
        .limit(5)
        .all()
    )

    return ok({
        "total_user": total_user,
        "total_prediksi": total_prediksi,
        "rata_rata_harga": int(rata_rata_harga),
        "merek_terpopuler": [{"merek": m, "jumlah": j} for m, j in merek_terpopuler],
    })

@app.route("/api/admin/users", methods=["GET"])
@admin_required
def admin_users():
    users = User.query.order_by(User.created_at.desc()).all()
    hasil = []
    for u in users:
        jumlah_prediksi = PrediksiLog.query.filter_by(user_id=u.id).count()
        hasil.append({
            "id": u.id, "nama": u.nama, "email": u.email,
            "jumlah_prediksi": jumlah_prediksi,
            "created_at": u.created_at.isoformat() if u.created_at else None
        })
    return ok({"users": hasil})

@app.route("/api/admin/predictions", methods=["GET"])
@admin_required
def admin_predictions():
    logs = PrediksiLog.query.order_by(PrediksiLog.created_at.desc()).all()

    # Ambil semua nama user sekaligus, hindari query berulang per baris
    user_ids = [l.user_id for l in logs if l.user_id]
    users_map = {u.id: u.nama for u in User.query.filter(User.id.in_(user_ids)).all()} if user_ids else {}

    hasil = []
    for l in logs:
        nama_user = users_map.get(l.user_id, "—")
        hasil.append({
            "id": l.id,
            "user_id": l.user_id,
            "user_nama": nama_user,
            "merek": l.merek, "model_mobil": l.model_mobil, "tahun": l.tahun,
            "kilometer": l.kilometer,
            "kondisi_body": l.kondisi_body,
            "harga_prediksi": l.harga_prediksi,
            "created_at": l.created_at.isoformat() if l.created_at else None
        })
    return ok({"predictions": hasil})

if __name__ == "__main__":
    with app.app_context():
        db.create_all()
        print("✓ Tabel database siap")
    app.run(debug=True, host="0.0.0.0", port=5000)