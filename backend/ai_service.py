from groq import Groq
import os

import requests
from dotenv import load_dotenv

load_dotenv()

client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)


class PredictCityError(Exception):
    """Raised when city prediction cannot be returned; carries HTTP status for the API."""

    def __init__(self, status_code: int, detail: str):
        self.status_code = status_code
        self.detail = detail
        super().__init__(detail)


def _city_predict_prompt(city: str) -> str:
    return f"""You are UrbanFlow, a smart-city mobility assistant. For the city below, give a plausible qualitative outlook for the NEXT 2 HOURS only (not live data — reasonable estimates).

City: {city}

Reply with ONLY valid JSON (no markdown code fences), using exactly these keys:
- "future_traffic": integer 0-100 (higher = heavier road congestion)
- "future_transit": integer 0-100 (higher = busier transit / crowding)
- "risk_level": exactly one of: "low", "moderate", "high" (combined delay / incident risk)
- "summary": one concise sentence for city operators

Use round integers; do not add other keys or prose outside the JSON object."""


def _hf_granite_predict(city: str, token: str) -> tuple[str | None, str | None, str | None]:
    """
    Granite **instruct** (chat) on Hugging Face — JSON estimates only.
    Not IBM Granite **time-series** / TTM models (no historical series input).
    Returns (prediction_text, model_id, error_note). May raise PredictCityError on auth.
    """
    model = os.getenv(
        "HF_GRANITE_MODEL",
        "ibm-granite/granite-4.0-micro",
    )
    base = os.getenv(
        "HF_ROUTER_URL",
        "https://router.huggingface.co/v1",
    ).rstrip("/")
    url = f"{base}/chat/completions"
    body = {
        "model": model,
        "messages": [
            {"role": "user", "content": _city_predict_prompt(city)},
        ],
        "max_tokens": 512,
        "temperature": 0.3,
    }
    try:
        r = requests.post(
            url,
            headers={
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json",
            },
            json=body,
            timeout=120,
        )
    except requests.RequestException as exc:
        return None, None, str(exc)

    if r.status_code in (401, 403):
        raise PredictCityError(
            r.status_code,
            "Hugging Face rejected the request. Check HF_TOKEN and that the token "
            "can call Inference Providers (fine-grained permission).",
        )

    if r.status_code != 200:
        try:
            payload = r.json()
            err = payload.get("error")
            if isinstance(err, dict):
                msg = err.get("message", r.text[:500])
            else:
                msg = str(err) if err else r.text[:500]
        except Exception:
            msg = r.text[:500]
        return None, None, f"HTTP {r.status_code}: {msg}"

    try:
        data = r.json()
        text = data["choices"][0]["message"]["content"]
    except (KeyError, IndexError, TypeError):
        return None, None, "Unexpected Hugging Face response shape"

    text = (text or "").strip()
    if not text:
        return None, None, "Empty model output"
    return text, model, None


def _groq_predict_city(city: str) -> str | None:
    if not os.getenv("GROQ_API_KEY"):
        return None
    try:
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "user", "content": _city_predict_prompt(city)},
            ],
            temperature=0.3,
            max_tokens=512,
        )
        text = response.choices[0].message.content
        out = (text or "").strip()
        return out or None
    except Exception:
        return None


def predict_city_response(city: str) -> dict:
    """
    Short-horizon city mobility **JSON** from an LLM (qualitative scores), not a
    statistical time-series model. Tries Granite **instruct** on Hugging Face router,
    then Groq Llama. Requires HF_TOKEN and/or GROQ_API_KEY.
    """
    name = (city or "").strip() or "Brampton"
    hf_notes: list[str] = []

    hf_token = os.getenv("HF_TOKEN") or os.getenv("HUGGINGFACEHUB_API_TOKEN")
    if hf_token:
        prediction, model_used, hf_err = _hf_granite_predict(name, hf_token)
        if prediction:
            return {
                "city": name,
                "prediction": prediction,
                "model_used": model_used,
                "inference_route": "huggingface",
                "note": None,
            }
        if hf_err:
            hf_notes.append(hf_err)

    groq_out = _groq_predict_city(name)
    if groq_out:
        return {
            "city": name,
            "prediction": groq_out,
            "model_used": "llama-3.1-8b-instant",
            "inference_route": "groq",
            "note": "; ".join(hf_notes) if hf_notes else None,
        }

    detail = (
        "Set HF_TOKEN (Hugging Face, Inference Providers permission) and/or "
        "GROQ_API_KEY to run city predictions."
    )
    if hf_notes:
        detail = f"{detail} Details: {'; '.join(hf_notes)}"
    raise PredictCityError(503, detail)


def generate_recommendation(alert: str):

    prompt = f"""
    You are UrbanFlow AI,
    a smart city sustainability assistant.

    Generate a short recommendation
    for this city alert:

    Alert: {alert}

    Focus on:
    - sustainability
    - safety
    - urban mobility

    Keep response under 40 words.
    """

    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ]
    )

    return (
        response.choices[0]
        .message.content
    )


def generate_bus_lines_hint(
    from_place: str,
    to_place: str,
    stop_summary: str,
):

    if not os.getenv("GROQ_API_KEY"):
        return (
            "Add GROQ_API_KEY for AI bus line hints, "
            "or check Brampton Transit / Züm / GO for your corridor."
        )

    prompt = f"""
    You help Brampton and Peel GTA transit riders.

    Trip origin (free text): {from_place}
    Trip destination (free text): {to_place}
    Nearby transit stop names along the driving corridor
    (may be incomplete): {stop_summary}

    In ONE short sentence, name bus route numbers or GO services
    riders often use for similar trips. If unsure, say to verify on
    BramptonTransit.ca or GO Transit. Max 40 words.
    """

    try:
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
        )
        text = response.choices[0].message.content
        return (text or "").strip()
    except Exception:
        return (
            "Check Brampton Transit, Züm, and GO schedules "
            "for stops along your corridor."
        )