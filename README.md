# 🌾 WheatGuard — AI Wheat Disease Detection

A full-stack AI application for detecting wheat crop diseases from leaf images. Built with **FastAPI + ONNX Runtime** on the backend and **React + Vite** on the frontend.

![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=flat&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.111+-009688?style=flat&logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react&logoColor=black)
![ONNX](https://img.shields.io/badge/ONNX-Runtime-FF6F00?style=flat)

---

## 📸 Features

- **4-class disease detection** — Brown Rust, Healthy, Septoria, Yellow Rust
- **Confidence gating** — rejects non-wheat images instead of guessing
- **Batch prediction** — up to 10 images per request
- **Single & batch inference** REST API with full Swagger docs at `/docs`
- **React SPA** — 5 pages: Home, Detect, Results, Disease Guide, About
- **Docker-ready** backend
- **Scan history** saved locally in browser

---

## 🗂️ Project Structure

```
wheatguard/
├── wheat_api/                  # FastAPI backend
│   ├── app/
│   │   ├── main.py             # Routes: /, /health, /predict, /predict-batch
│   │   ├── model.py            # ONNX session wrapper + preprocessing
│   │   └── schemas.py          # Pydantic request/response models
│   ├── models/
│   │   ├── wheat_disease_model.onnx   ← place your model here (not in repo)
│   │   └── class_names.json    # ["Brown_Rust","Healthy","Septoria","Yellow_Rust"]
│   ├── requirements.txt
│   ├── Dockerfile
│   └── README.md
│
└── wheat_frontend/             # React + Vite frontend
    ├── src/
    │   ├── pages/              # Home, Detect, Results, DiseaseGuide, About
    │   ├── components/         # Navbar, Footer
    │   ├── hooks/              # useResults
    │   └── utils/              # api.js, diseaseData.js
    ├── index.html
    ├── vite.config.js
    └── package.json
```

---

## ⚙️ Prerequisites

| Tool | Version |
|------|---------|
| Python | 3.10+ |
| Node.js | 18+ |
| npm | 9+ |

---

## 🚀 Quick Start

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/wheatguard.git
cd wheatguard
```

### 2. Add your ONNX model

Place your trained model file in the backend models directory:

```
wheat_api/models/wheat_disease_model.onnx
```

> The model is **not included** in the repository due to file size. It is listed in `.gitignore`.

### 3. Run the Backend

```bash
cd wheat_api
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

API is live at → **http://localhost:8000**  
Swagger docs → **http://localhost:8000/docs**

### 4. Run the Frontend

```bash
cd wheat_frontend
npm install
npm run dev
```

Frontend is live at → **http://localhost:5173**

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | API info |
| `GET` | `/health` | Liveness + model status |
| `GET` | `/model-info` | Architecture, classes, input shape |
| `POST` | `/predict` | Single image inference |
| `POST` | `/predict-batch` | Batch inference (max 10 images) |

### Example — Single Prediction

```bash
curl -X POST http://localhost:8000/predict \
  -F "file=@wheat_leaf.jpg"
```

```json
{
  "filename": "wheat_leaf.jpg",
  "predicted_class": "Brown_Rust",
  "confidence": 0.9312,
  "probabilities": {
    "Brown_Rust": 0.9312,
    "Healthy": 0.0421,
    "Septoria": 0.0189,
    "Yellow_Rust": 0.0078
  },
  "inference_time_ms": 18.4
}
```

### Confidence Threshold

Predictions below **55% confidence** are rejected with a `422` error:

```json
{
  "error": "low_confidence",
  "message": "The model is not confident this is a wheat leaf image...",
  "confidence": 0.38,
  "threshold": 0.55
}
```

---

## 🤖 Model Details

| Property | Value |
|----------|-------|
| Architecture | MobileNetV2 (best of 3 compared) |
| Input size | 224 × 224 × 3 (RGB) |
| Preprocessing | ImageNet normalization (`÷255 → subtract mean → divide std`) |
| Export format | ONNX |
| Classes | Brown Rust, Healthy, Septoria, Yellow Rust |
| Training split | 80% Train · 10% Val · 10% Test (stratified) |

**Preprocessing (must match exactly):**
```python
mean = [0.485, 0.456, 0.406]
std  = [0.229, 0.224, 0.225]
img  = (img / 255.0 - mean) / std
```

---

## 🐳 Docker (Backend)

```bash
cd wheat_api
docker build -t wheatguard-api .
docker run -p 8000:8000 -v $(pwd)/models:/app/models wheatguard-api
```

---

## 🌐 Single-Server Deployment

Build the frontend and serve it from FastAPI:

```bash
cd wheat_frontend
npm run build
```

Then add to the **end** of `wheat_api/app/main.py`:

```python
from fastapi.staticfiles import StaticFiles
app.mount("/", StaticFiles(directory="../wheat_frontend/dist", html=True), name="static")
```

Install aiofiles: `pip install aiofiles`

Now everything runs on `http://localhost:8000`.

---

## 🗒️ Frontend Pages

| Page | Route | Description |
|------|-------|-------------|
| Home | `/` | Landing page with features overview |
| Detect | `/detect` | Upload image and get diagnosis |
| Results | `/results` | Scan history dashboard |
| Disease Guide | `/diseases` | Reference guide for all 4 diseases |
| About | `/about` | Project and model information |

---

## 📦 Tech Stack

**Backend**
- [FastAPI](https://fastapi.tiangolo.com/) — async Python REST framework
- [ONNX Runtime](https://onnxruntime.ai/) — cross-platform inference engine
- [Pillow](https://python-pillow.org/) — image processing
- [Pydantic v2](https://docs.pydantic.dev/) — request/response validation

**Frontend**
- [React 18](https://react.dev/) — UI library
- [React Router v6](https://reactrouter.com/) — client-side routing
- [Vite](https://vitejs.dev/) — build tool
- [Axios](https://axios-http.com/) — HTTP client

---

## ⚠️ Disclaimer

WheatGuard is developed as a Final Year Project for research and educational purposes. Always consult a qualified agronomist before making critical field management decisions based on AI diagnosis results.

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.
