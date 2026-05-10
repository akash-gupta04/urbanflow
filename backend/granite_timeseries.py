"""
IBM Granite time series (TTM) helpers for UrbanFlow.

Granite Time Series models expect historical **numeric** context and return forecasts.
They are served by IBM's TSFM inference container or compatible HTTP API — not the
Hugging Face chat router.

Environment:
  TSFM_INFERENCE_URL   Base URL (e.g. http://127.0.0.1:8000) for the TSFM service.
  TSFM_FORECAST_PATH   Path appended to base; default /forecast.
  TSFM_MODEL_ID        Model id registered with your TSFM deployment (see service config).
  HF_TOKEN             Optional Bearer token if your TSFM endpoint requires it.

Reference payload shape:
  https://github.com/ibm-granite/granite-tsfm/blob/main/services/inference/tests/locust/payload.json
"""

from __future__ import annotations

import hashlib
import math
import os
from datetime import datetime, timedelta, timezone
from typing import Any

import requests

DEFAULT_TTM_HF_REPO = "ibm-granite/granite-timeseries-ttm-r2"
DEFAULT_FORECAST_PATH = "/forecast"
DEFAULT_CONTEXT_LENGTH = 512
DEFAULT_PREDICTION_LENGTH = 24


def synthetic_target_series(city: str, length: int) -> list[float]:
    """
    Deterministic pseudo–mobility index in [0, 100] for demos when real sensors
    are unavailable. Same city always yields the same curve.
    """
    if length < 2:
        raise ValueError("length must be at least 2")
    digest = hashlib.sha256(city.strip().lower().encode("utf-8")).digest()
    seed_u = int.from_bytes(digest[:8], "big", signed=False) / (2**64)
    v = 35.0 + 30.0 * seed_u
    out: list[float] = []
    for i in range(length):
        noise = (digest[i % len(digest)] / 255.0 - 0.5) * 4.0
        seasonal = 12.0 * math.sin(2.0 * math.pi * i / 168.0)
        v = 0.92 * v + 0.08 * (40.0 + seasonal) + noise
        v = max(0.0, min(100.0, v))
        out.append(round(v, 4))
    return out


def hourly_iso_timestamps(n: int, start: datetime | None = None) -> list[str]:
    """UTC hourly timestamps as ISO strings (TSFM examples use this style)."""
    if n < 1:
        raise ValueError("n must be at least 1")
    t0 = start if start is not None else datetime.now(timezone.utc).replace(
        minute=0, second=0, microsecond=0
    )
    return [(t0 + timedelta(hours=i)).strftime("%Y-%m-%dT%H:%M:%S") for i in range(n)]


def build_tsfm_forecast_payload(
    *,
    model_id: str,
    target_column: str,
    context_values: list[float],
    prediction_length: int,
    timestamps: list[str] | None = None,
    timestamp_column: str = "date",
) -> dict[str, Any]:
    if len(context_values) < 2:
        raise ValueError("context_values must have at least 2 points")
    if timestamps is None:
        ts = hourly_iso_timestamps(len(context_values))
    else:
        ts = timestamps
    if len(ts) != len(context_values):
        raise ValueError("timestamps length must match context_values")
    return {
        "model_id": model_id,
        "parameters": {"prediction_length": int(prediction_length)},
        "schema": {
            "timestamp_column": timestamp_column,
            "target_columns": [target_column],
        },
        "data": {
            timestamp_column: ts,
            target_column: list(context_values),
        },
    }


def build_city_demo_payload(
    city: str,
    *,
    model_id: str | None = None,
    context_length: int = DEFAULT_CONTEXT_LENGTH,
    prediction_length: int = DEFAULT_PREDICTION_LENGTH,
    target_column: str = "mobility_index",
) -> dict[str, Any]:
    """TSFM-style JSON body using synthetic history derived from ``city``."""
    mid = model_id or os.getenv("TSFM_MODEL_ID") or DEFAULT_TTM_HF_REPO
    values = synthetic_target_series(city, context_length)
    ts = hourly_iso_timestamps(context_length)
    return build_tsfm_forecast_payload(
        model_id=mid,
        target_column=target_column,
        context_values=values,
        prediction_length=prediction_length,
        timestamps=ts,
    )


def post_tsfm_forecast(
    payload: dict[str, Any],
    *,
    base_url: str | None = None,
    path: str | None = None,
    timeout: float = 120.0,
) -> tuple[dict[str, Any] | None, str | None]:
    """
    POST a forecast request to a TSFM-compatible HTTP service.
    Returns (response_json, None) on success, or (None, error_message).
    """
    base = (base_url or os.getenv("TSFM_INFERENCE_URL") or "").strip().rstrip("/")
    if not base:
        return None, "TSFM_INFERENCE_URL is not set"

    rel = (path or os.getenv("TSFM_FORECAST_PATH") or DEFAULT_FORECAST_PATH).strip()
    if not rel.startswith("/"):
        rel = "/" + rel
    url = f"{base}{rel}"

    headers: dict[str, str] = {"Content-Type": "application/json"}
    token = os.getenv("HF_TOKEN") or os.getenv("HUGGINGFACEHUB_API_TOKEN")
    if token:
        headers["Authorization"] = f"Bearer {token}"

    try:
        r = requests.post(url, json=payload, headers=headers, timeout=timeout)
    except requests.RequestException as exc:
        return None, str(exc)

    if r.status_code >= 400:
        return None, f"HTTP {r.status_code}: {r.text[:800]}"

    try:
        return r.json(), None
    except Exception:
        return None, "Response was not valid JSON"


def forecast_city_demo(
    city: str,
    *,
    context_length: int = DEFAULT_CONTEXT_LENGTH,
    prediction_length: int = DEFAULT_PREDICTION_LENGTH,
) -> tuple[dict[str, Any] | None, str | None]:
    """
    Build a demo payload from ``city`` and call the configured TSFM endpoint.
    """
    payload = build_city_demo_payload(
        city,
        context_length=context_length,
        prediction_length=prediction_length,
    )
    return post_tsfm_forecast(payload)


def _coerce_float(x: Any) -> float | None:
    if isinstance(x, bool):
        return None
    if isinstance(x, (int, float)):
        return float(x)
    return None


def extract_forecast_numeric_series(forecast: Any) -> list[float] | None:
    """Best-effort parse of TSFM / JSON forecast blobs into a flat series."""
    if forecast is None:
        return None
    if isinstance(forecast, list):
        nums = [_coerce_float(x) for x in forecast]
        nums = [n for n in nums if n is not None]
        return nums or None
    if not isinstance(forecast, dict):
        return None
    for key in ("forecast", "predictions", "prediction", "values", "yhat", "target"):
        v = forecast.get(key)
        if isinstance(v, list):
            nums = [_coerce_float(x) for x in v]
            nums = [n for n in nums if n is not None]
            if nums:
                return nums
    data = forecast.get("data")
    if isinstance(data, dict):
        for col in data.values():
            if isinstance(col, list) and col:
                nums = [_coerce_float(x) for x in col]
                nums = [n for n in nums if n is not None]
                if nums:
                    return nums
    return None


def history_preview_for_city(
    city: str,
    *,
    context_length: int = DEFAULT_CONTEXT_LENGTH,
    tail: int = 48,
) -> dict[str, Any]:
    name = (city or "").strip() or "Brampton"
    n = max(2, min(context_length, 4096))
    t = max(2, min(tail, n))
    values = synthetic_target_series(name, n)
    ts = hourly_iso_timestamps(n)
    return {
        "timestamps": ts[-t:],
        "mobility_index": values[-t:],
    }


def city_tsfm_api_bundle(
    city: str,
    *,
    context_length: int = DEFAULT_CONTEXT_LENGTH,
    prediction_length: int = DEFAULT_PREDICTION_LENGTH,
    history_tail: int = 48,
) -> dict[str, Any]:
    """
    Payload for ``GET /predict-city-tsfm``: synthetic history preview + optional TTM forecast.
    """
    name = (city or "").strip() or "Brampton"
    preview = history_preview_for_city(
        name,
        context_length=context_length,
        tail=history_tail,
    )
    base = (os.getenv("TSFM_INFERENCE_URL") or "").strip()
    if not base:
        return {
            "city": name,
            "tsfm_configured": False,
            "history_preview": preview,
            "forecast": None,
            "forecast_values": None,
            "note": (
                "Set TSFM_INFERENCE_URL on the backend to call the IBM Granite "
                "TTM service (TSFM inference container)."
            ),
        }

    forecast, err = forecast_city_demo(
        name,
        context_length=context_length,
        prediction_length=prediction_length,
    )
    if err:
        return {
            "city": name,
            "tsfm_configured": True,
            "history_preview": preview,
            "forecast": None,
            "forecast_values": None,
            "error": err,
        }

    fvals = extract_forecast_numeric_series(forecast)
    return {
        "city": name,
        "tsfm_configured": True,
        "history_preview": preview,
        "forecast": forecast,
        "forecast_values": fvals,
    }
