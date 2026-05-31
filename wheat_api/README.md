# 🌾 Wheat Disease Detection — FastAPI Backend

MobileNetV2 ONNX inference server for detecting wheat leaf diseases.

**Classes:** Brown_Rust · Healthy · Septoria · Yellow_Rust

---

## 📁 Project Structure

```
wheat_api/
├── app/
│   ├── __init__.py
│   ├── main.py          # FastAPI app, routes, CORS
│   ├── model.py         # ONNX model wrapper + preprocessing
│   └── schemas.py       # Pydantic request/response models
├── models/
│   ├── wheat_disease_model.onnx   ← place your model here
│   └── class_names.json           ← place your labels here
├── requirements.txt
├── Dockerfile
└── README.md
```

---

## 🚀 Quick Start

### 1. Place your model files

Copy from Google Drive (`wheat_mobilenet_final/`):
```
models/wheat_disease_model.onnx
models/class_names.json
```

`class_names.json` should look like:
```json
["Brown_Rust", "Healthy", "Septoria", "Yellow_Rust"]
```

### 2. Install dependencies

```bash
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Run the server

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Open **http://localhost:8000/docs** for the interactive Swagger UI.

---

## 🐳 Docker

```bash
# Build
docker build -t wheat-api .

# Run
docker run -p 8000:8000 wheat-api
```

---

## 📡 API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/` | Welcome message |
| `GET` | `/health` | Liveness + readiness probe |
| `GET` | `/model-info` | Model metadata |
| `POST` | `/predict` | Single image inference |
| `POST` | `/predict-batch` | Batch inference (max 10 images) |

---

## 🔬 Example Requests

### Single prediction (curl)
```bash
curl -X POST http://localhost:8000/predict \
  -F "file=@wheat_leaf.jpg"
```

### Single prediction (Python)
```python
import requests

with open("wheat_leaf.jpg", "rb") as f:
    response = requests.post(
        "http://localhost:8000/predict",
        files={"file": ("wheat_leaf.jpg", f, "image/jpeg")},
    )
print(response.json())
```

### Example response
```json
{
  "filename": "wheat_leaf.jpg",
  "predicted_class": "Brown_Rust",
  "confidence": 0.9231,
  "probabilities": {
    "Brown_Rust": 0.9231,
    "Healthy":    0.0412,
    "Septoria":   0.0218,
    "Yellow_Rust": 0.0139
  },
  "inference_time_ms": 38.5,
  "error": null
}
```

### Batch prediction (Python)
```python
import requests

files = [
    ("files", ("img1.jpg", open("img1.jpg", "rb"), "image/jpeg")),
    ("files", ("img2.jpg", open("img2.jpg", "rb"), "image/jpeg")),
]
response = requests.post("http://localhost:8000/predict-batch", files=files)
print(response.json())
```

---

## ⚙️ Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| Model path | `models/wheat_disease_model.onnx` | ONNX model file |
| Labels path | `models/class_names.json` | Class names JSON |
| Max file size | 10 MB | Per-image upload limit |
| Max batch | 10 images | Images per `/predict-batch` |

To use a custom model path, edit `DEFAULT_MODEL_PATH` in `app/model.py`.

---

## 🖼️ Preprocessing

Matches the training pipeline exactly:

```python
img  = img.resize((224, 224), Image.BILINEAR)
arr  = np.array(img, dtype=np.float32) / 255.0
arr  = (arr - [0.485, 0.456, 0.406]) / [0.229, 0.224, 0.225]
```

**Important:** If your frontend does any image manipulation before sending, make sure the image is still a standard JPEG/PNG — the API handles all preprocessing internally.

---

## 🌐 CORS

CORS is set to `allow_origins=["*"]` for development. Before deploying to production, restrict this in `app/main.py`:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://your-frontend-domain.com"],
    ...
)
```
