import os
from datetime import datetime

import requests
from fastapi import FastAPI, HTTPException
from dotenv import load_dotenv
from fastapi.middleware.cors import (
    CORSMiddleware
)

from database import (
    SessionLocal,
    Base,
    engine
)

from models import (
    EmergencyAlert,
    CityMetrics
)

from ai_service import (
    PredictCityError,
    generate_recommendation,
    predict_city_response,
)

from trip_route import (
    build_trip_route
)

from granite_timeseries import (
    city_tsfm_api_bundle,
)

load_dotenv()

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create tables
Base.metadata.create_all(bind=engine)


@app.get("/")
def root():
    return {
        "message":
        "UrbanFlow Backend Running"
    }


# Emergency Alerts
@app.get("/alerts")
def get_alerts():

    db = SessionLocal()

    alerts = db.query(
        EmergencyAlert
    ).all()

    return [
        {
            "id": alert.id,
            "title": alert.title,
            "severity": alert.severity,
            "location": alert.location,
        }
        for alert in alerts
    ]


# Metrics
@app.get("/metrics")
def get_metrics():

    db = SessionLocal()

    metrics = (
        db.query(CityMetrics)
        .first()
    )

    if not metrics:
        return {
            "co2_reduced": 0,
            "traffic_reduction": 0,
            "emergency_access": 0,
            "transit_efficiency": 0,
        }

    return {
        "co2_reduced":
            metrics.co2_reduced,

        "traffic_reduction":
            metrics.traffic_reduction,

        "emergency_access":
            metrics.emergency_access,

        "transit_efficiency":
            metrics.transit_efficiency,
    }


# AI Recommendation
@app.get("/ai-recommendation")
def ai_recommendation(
    alert: str
):

    recommendation = (
        generate_recommendation(
            alert
        )
    )

    return {
        "alert": alert,
        "recommendation":
            recommendation
    }


@app.get("/predict-city")
def predict_city(city: str = "Brampton"):
    """LLM JSON outlook (Granite instruct on HF if configured, else Groq) — not time-series TTM."""
    try:
        return predict_city_response(city)
    except PredictCityError as exc:
        raise HTTPException(
            status_code=exc.status_code,
            detail=exc.detail,
        ) from exc


@app.get("/predict-city-tsfm")
def predict_city_tsfm(
    city: str = "Brampton",
    context_length: int = 512,
    prediction_length: int = 24,
    history_tail: int = 48,
):
    """IBM Granite time series (TTM) via TSFM service + synthetic history preview for demos."""
    ctx = max(32, min(int(context_length), 2048))
    pred = max(1, min(int(prediction_length), 512))
    tail = max(8, min(int(history_tail), ctx))
    return city_tsfm_api_bundle(
        city,
        context_length=ctx,
        prediction_length=pred,
        history_tail=tail,
    )


@app.get("/trip-route")
def trip_route(
    from_place: str,
    to_place: str,
    leave_at: str | None = None,
):
    departure_unix = None
    if leave_at and str(leave_at).strip():
        raw = str(leave_at).strip()
        try:
            if raw.endswith("Z"):
                dt = datetime.fromisoformat(raw.replace("Z", "+00:00"))
            else:
                dt = datetime.fromisoformat(raw)
            departure_unix = int(dt.timestamp())
        except ValueError:
            departure_unix = None

    return build_trip_route(
        from_place,
        to_place,
        departure_unix,
    )


@app.get("/nearby-locations")
def nearby_locations():

    api_key = os.getenv(
        "GEOAPIFY_API_KEY"
    )

    lat = 43.7315
    lon = -79.7624

    categories_query = (
        "healthcare.hospital,"
        "public_transport,"
        "service.community_centre"
    )

    url = (
        "https://api.geoapify.com/v2/places"
        f"?categories={categories_query}"
        f"&filter=circle:{lon},{lat},5000"
        "&limit=20"
        f"&apiKey={api_key}"
    )

    try:

        response = requests.get(
            url,
            timeout=10
        )

        response.raise_for_status()

        data = response.json()

        places = []

        for place in data.get(
            "features", []
        ):

            props = place.get(
                "properties",
                {}
            )

            place_categories = (
                props.get(
                    "categories",
                    []
                )
            )

            category = "other"

            if (
                "healthcare.hospital"
                in place_categories
            ):
                category = (
                    "hospital"
                )

            elif any(
                "public_transport"
                in c
                for c in place_categories
            ):
                category = (
                    "transit"
                )

            elif any(
                "community"
                in c
                for c in place_categories
            ):
                category = (
                    "shelter"
                )

            coordinates = (
                place["geometry"]
                ["coordinates"]
            )

            places.append({
                "name":
                    props.get(
                        "name",
                        "Unknown Place"
                    ),

                "type":
                    category,

                "lat":
                    coordinates[1],

                "lon":
                    coordinates[0],
            })

        return places

    except Exception as e:

        return {
            "error":
            str(e)
        }       
