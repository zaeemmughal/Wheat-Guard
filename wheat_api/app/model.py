"""
Model loading and inference logic.
Wraps the ONNX Runtime session so main.py stays clean.
"""

import json
import logging
from pathlib import Path

import numpy as np
from PIL import Image

try:
    import onnxruntime as ort
except ImportError as e:
    raise ImportError("onnxruntime is required. Run: pip install onnxruntime") from e

logger = logging.getLogger("wheat_api.model")

# ── ImageNet normalization (must match training) ───────────────────────────────
MEAN = np.array([0.485, 0.456, 0.406], dtype=np.float32)
STD  = np.array([0.229, 0.224, 0.225], dtype=np.float32)

# ── Default paths (relative to project root) ─────────────────────────────────
DEFAULT_MODEL_PATH  = Path("models/wheat_disease_model.onnx")
DEFAULT_LABELS_PATH = Path("models/class_names.json")

# Fallback class names if class_names.json is missing
FALLBACK_CLASSES = ["Brown_Rust", "Healthy", "Septoria", "Yellow_Rust"]


class WheatDiseaseModel:
    """
    Thin wrapper around an ONNX Runtime inference session.

    Usage:
        model  = WheatDiseaseModel()
        result = model.predict(pil_image)
        # result = {
        #   "predicted_class": "Brown_Rust",
        #   "confidence": 0.923,
        #   "probabilities": {"Brown_Rust": 0.923, "Healthy": 0.04, ...}
        # }
    """

    def __init__(
        self,
        model_path: str | Path = DEFAULT_MODEL_PATH,
        labels_path: str | Path = DEFAULT_LABELS_PATH,
    ):
        self.model_path  = Path(model_path)
        self.labels_path = Path(labels_path)

        self.class_names = self._load_class_names()
        self.session, self.input_name, self.output_name = self._load_session()
        self.input_shape = (224, 224, 3)   # H × W × C

        logger.info(
            "WheatDiseaseModel loaded │ classes=%s │ model=%s",
            self.class_names, self.model_path,
        )

    # ── Private helpers ───────────────────────────────────────────────────────

    def _load_class_names(self) -> list[str]:
        if self.labels_path.exists():
            with open(self.labels_path) as f:
                names = json.load(f)
            logger.info("Class names loaded from %s: %s", self.labels_path, names)
            return names
        else:
            logger.warning(
                "class_names.json not found at %s — using fallback: %s",
                self.labels_path, FALLBACK_CLASSES,
            )
            return FALLBACK_CLASSES

    def _load_session(self):
        if not self.model_path.exists():
            raise FileNotFoundError(
                f"ONNX model not found at '{self.model_path}'. "
                "Place wheat_disease_model.onnx in the models/ directory."
            )

        providers = ["CUDAExecutionProvider", "CPUExecutionProvider"]
        session   = ort.InferenceSession(str(self.model_path), providers=providers)

        active = session.get_providers()
        logger.info("ONNX Runtime providers active: %s", active)

        input_name  = session.get_inputs()[0].name
        output_name = session.get_outputs()[0].name
        logger.info("Model I/O │ input='%s' │ output='%s'", input_name, output_name)

        return session, input_name, output_name

    def _preprocess(self, img: Image.Image) -> np.ndarray:
        """
        Resize → float32 → ImageNet normalize → add batch dim.
        Matches exactly what was used during training.
        """
        img  = img.resize((224, 224), Image.BILINEAR)
        arr  = np.array(img, dtype=np.float32) / 255.0
        arr  = (arr - MEAN) / STD
        return np.expand_dims(arr, axis=0)  # (1, 224, 224, 3)

    # ── Public API ────────────────────────────────────────────────────────────

    def predict(self, img: Image.Image) -> dict:
        """
        Run inference on a PIL Image.

        Returns:
            {
                "predicted_class": str,
                "confidence":      float,   # 0–1
                "probabilities":   dict[str, float],
            }
        """
        tensor = self._preprocess(img)
        raw    = self.session.run([self.output_name], {self.input_name: tensor})[0][0]
        probs  = raw.astype(float)          # softmax already applied in model

        pred_idx    = int(np.argmax(probs))
        pred_class  = self.class_names[pred_idx]
        confidence  = float(probs[pred_idx])

        prob_dict = {
            cls: round(float(p), 6)
            for cls, p in zip(self.class_names, probs)
        }

        return {
            "predicted_class": pred_class,
            "confidence":      round(confidence, 6),
            "probabilities":   prob_dict,
        }

    def predict_batch(self, images: list[Image.Image]) -> list[dict]:
        """Run inference on a list of PIL Images."""
        return [self.predict(img) for img in images]
