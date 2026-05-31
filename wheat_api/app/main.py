import io
import time
import logging
from contextlib import asynccontextmanager
from pathlib import Path

import numpy as np
from PIL import Image
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.model import WheatDiseaseModel
from app.schemas import (
    PredictionResponse,
    BatchPredictionResponse,
    HealthResponse,
    ModelInfoResponse,
)

# ── Logging ──────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s │ %(levelname)-8s │ %(name)s │ %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("wheat_api")

# ── Global model instance ─────────────────────────────────────────────────────
_model: WheatDiseaseModel | None = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load model on startup, release on shutdown."""
    global _model
    logger.info("Loading ONNX model …")
    _model = WheatDiseaseModel()
    logger.info("Model ready ✅  classes=%s", _model.class_names)
    yield
    logger.info("Shutting down — releasing model resources.")
    _model = None


# ── App ───────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="🌾 Wheat Disease Detection API",
    description=(
        "Detect wheat leaf diseases from images using a MobileNetV2 model "
        "trained on 4 classes: Brown Rust, Healthy, Septoria, Yellow Rust."
    ),
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Constants ─────────────────────────────────────────────────────────────────
ALLOWED_TYPES        = {"image/jpeg", "image/png", "image/webp", "image/bmp"}
MAX_FILE_SIZE        = 10 * 1024 * 1024   # 10 MB
CONFIDENCE_THRESHOLD = 0.55               # reject anything below 60%


def _get_model() -> WheatDiseaseModel:
    if _model is None:
        raise HTTPException(status_code=503, detail="Model not loaded yet. Try again shortly.")
    return _model


async def _read_image(file: UploadFile) -> Image.Image:
    """Validate and decode an uploaded image file."""
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=415,
            detail=f"Unsupported file type '{file.content_type}'. Allowed: {sorted(ALLOWED_TYPES)}",
        )
    raw = await file.read()
    if len(raw) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail=f"File too large ({len(raw)/1024/1024:.1f} MB). Max allowed: 10 MB.",
        )
    try:
        img = Image.open(io.BytesIO(raw)).convert("RGB")
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Could not decode image: {exc}") from exc
    return img


# ── Routes ────────────────────────────────────────────────────────────────────

@app.get("/", tags=["General"])
async def root():
    return {
        "message": "🌾 Wheat Disease Detection API",
        "docs": "/docs",
        "health": "/health",
        "predict": "POST /predict",
    }


@app.get("/health", response_model=HealthResponse, tags=["General"])
async def health():
    """Liveness + readiness probe."""
    model = _get_model()
    return HealthResponse(
        status="ok",
        model_loaded=True,
        classes=model.class_names,
        input_shape=list(model.input_shape),
    )


@app.get("/model-info", response_model=ModelInfoResponse, tags=["General"])
async def model_info():
    """Return model metadata."""
    model = _get_model()
    return ModelInfoResponse(
        architecture="MobileNetV2",
        framework="ONNX Runtime",
        num_classes=len(model.class_names),
        classes=model.class_names,
        input_shape=list(model.input_shape),
        input_dtype="float32",
        preprocessing="ImageNet normalization (mean=[0.485,0.456,0.406], std=[0.229,0.224,0.225])",
    )


@app.post("/predict", response_model=PredictionResponse, tags=["Inference"])
async def predict(file: UploadFile = File(..., description="Wheat leaf image (JPEG/PNG/WebP/BMP)")):
    """
    Run inference on a single wheat leaf image.

    Returns the predicted disease class, confidence score,
    and probability distribution across all 4 classes.
    """
    model   = _get_model()
    img     = await _read_image(file)

    t0      = time.perf_counter()
    result  = model.predict(img)
    latency = round((time.perf_counter() - t0) * 1000, 2)

    # ── Confidence gate ───────────────────────────────────────────────────────
    if result["confidence"] < CONFIDENCE_THRESHOLD:
        raise HTTPException(
            status_code=422,
            detail={
                "error": "low_confidence",
                "message": (
                    f"The model is not confident this is a wheat leaf image. "
                    f"Best guess was '{result['predicted_class']}' at "
                    f"{result['confidence']*100:.1f}% confidence "
                    f"(minimum required: {CONFIDENCE_THRESHOLD*100:.0f}%). "
                    f"Please upload a clear, close-up photo of a wheat leaf."
                ),
                "confidence": result["confidence"],
                "threshold": CONFIDENCE_THRESHOLD,
                "probabilities": result["probabilities"],
            }
        )
    # ─────────────────────────────────────────────────────────────────────────

    logger.info(
        "predict │ file=%s │ pred=%s │ conf=%.4f │ latency=%.1fms",
        file.filename, result["predicted_class"], result["confidence"], latency,
    )

    return PredictionResponse(
        filename=file.filename or "unknown",
        predicted_class=result["predicted_class"],
        confidence=result["confidence"],
        probabilities=result["probabilities"],
        inference_time_ms=latency,
    )


@app.post("/predict-batch", response_model=BatchPredictionResponse, tags=["Inference"])
async def predict_batch(
    files: list[UploadFile] = File(..., description="Up to 10 wheat leaf images"),
):
    """
    Run inference on multiple images in one request (max 10).

    Useful for batch processing without multiple round-trips.
    """
    if len(files) > 10:
        raise HTTPException(status_code=400, detail="Maximum 10 images per batch request.")

    model   = _get_model()
    results = []
    t0      = time.perf_counter()

    for file in files:
        try:
            img    = await _read_image(file)
            result = model.predict(img)

            # ── Confidence gate (per file in batch) ───────────────────────────
            if result["confidence"] < CONFIDENCE_THRESHOLD:
                results.append(
                    PredictionResponse(
                        filename=file.filename or "unknown",
                        predicted_class="rejected",
                        confidence=result["confidence"],
                        probabilities=result["probabilities"],
                        inference_time_ms=0,
                        error=(
                            f"Low confidence ({result['confidence']*100:.1f}%). "
                            f"Not recognised as a wheat leaf image."
                        ),
                    )
                )
                continue
            # ─────────────────────────────────────────────────────────────────

            results.append(
                PredictionResponse(
                    filename=file.filename or "unknown",
                    predicted_class=result["predicted_class"],
                    confidence=result["confidence"],
                    probabilities=result["probabilities"],
                    inference_time_ms=0,
                )
            )
        except HTTPException as exc:
            results.append(
                PredictionResponse(
                    filename=file.filename or "unknown",
                    predicted_class="error",
                    confidence=0.0,
                    probabilities={},
                    inference_time_ms=0,
                    error=exc.detail,
                )
            )

    total_ms = round((time.perf_counter() - t0) * 1000, 2)
    logger.info("predict_batch │ n=%d │ total_latency=%.1fms", len(files), total_ms)

    return BatchPredictionResponse(
        total_images=len(files),
        total_inference_time_ms=total_ms,
        predictions=results,
    )