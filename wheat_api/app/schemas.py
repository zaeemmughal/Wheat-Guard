"""
Pydantic schemas for request validation and response serialization.
"""

from typing import Optional
from pydantic import BaseModel, Field


class PredictionResponse(BaseModel):
    filename: str = Field(..., description="Original uploaded filename")
    predicted_class: str = Field(..., description="Top predicted disease class")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Confidence score (0–1)")
    probabilities: dict[str, float] = Field(
        ..., description="Softmax probability for each class"
    )
    inference_time_ms: float = Field(..., description="Inference latency in milliseconds")
    error: Optional[str] = Field(None, description="Error message (batch only, on per-file failure)")

    model_config = {
        "json_schema_extra": {
            "example": {
                "filename": "wheat_leaf.jpg",
                "predicted_class": "Brown_Rust",
                "confidence": 0.9231,
                "probabilities": {
                    "Brown_Rust": 0.9231,
                    "Healthy": 0.0412,
                    "Septoria": 0.0218,
                    "Yellow_Rust": 0.0139,
                },
                "inference_time_ms": 38.5,
                "error": None,
            }
        }
    }


class BatchPredictionResponse(BaseModel):
    total_images: int = Field(..., description="Number of images in the batch")
    total_inference_time_ms: float = Field(..., description="Total batch latency in ms")
    predictions: list[PredictionResponse]


class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
    classes: list[str]
    input_shape: list[int]

    model_config = {
        "json_schema_extra": {
            "example": {
                "status": "ok",
                "model_loaded": True,
                "classes": ["Brown_Rust", "Healthy", "Septoria", "Yellow_Rust"],
                "input_shape": [224, 224, 3],
            }
        }
    }


class ModelInfoResponse(BaseModel):
    architecture: str
    framework: str
    num_classes: int
    classes: list[str]
    input_shape: list[int]
    input_dtype: str
    preprocessing: str
