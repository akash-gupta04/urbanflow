import requests,os
from fastapi import FastAPI
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
    generate_recommendation
)
from smart_metrics import (
    generate_city_metrics
)
load_dotenv()

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000"
    ],
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

@app.get("/nearby-locations")
def nearby_locations(
    city: str = "Brampton"
):

    api_key = os.getenv(
        "GEOAPIFY_API_KEY"
    )

    CITY_DATA = {
        "Brampton": {
            "lat": 43.7315,
            "lon": -79.7624,
        },

        "Toronto": {
            "lat": 43.6532,
            "lon": -79.3832,
        },

        "Mississauga": {
            "lat": 43.5890,
            "lon": -79.6441,
        },

        "Vancouver": {
            "lat": 49.2827,
            "lon": -123.1207,
        },
    }

    city_data = CITY_DATA.get(
        city,
        CITY_DATA["Brampton"]
    )

    lat = city_data["lat"]
    lon = city_data["lon"]

    url = (
        "https://api.geoapify.com/v2/places"
        "?categories="
        "healthcare.hospital,"
        "public_transport.bus,"
        "public_transport.train,"
        "education.school"
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

            place_categories = props.get(
                "categories",
                []
            )

            category = "other"

            if (
                "healthcare.hospital"
                in place_categories
            ):
                category = "hospital"

            elif any(
                "public_transport"
                in c
                for c in place_categories
            ):
                category = "transit"

            elif (
                "education.school"
                in place_categories
            ):
                category = "shelter"

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
@app.get("/city-metrics")
def city_metrics(
    city: str = "Brampton"
):

    try:

        city_coords = {
            "Brampton":
                (43.7315,
                 -79.7624),

            "Toronto":
                (43.6532,
                 -79.3832),

            "Mississauga":
                (43.5890,
                 -79.6441),

            "Vancouver":
                (49.2827,
                 -123.1207),
        }

        lat, lon = (
            city_coords.get(
                city,
                city_coords[
                    "Brampton"
                ]
            )
        )

        nearby = (
            nearby_locations(
                city=city
            )
        )

        hospitals = len([
            p for p in nearby
            if p["type"]
            == "hospital"
        ])

        transit = len([
            p for p in nearby
            if p["type"]
            == "transit"
        ])

        shelters = len([
            p for p in nearby
            if p["type"]
            == "shelter"
        ])

        # DEBUG
        print("CITY:", city)
        print("Hospitals:", hospitals)
        print("Transit:", transit)
        print("Shelters:", shelters)

        metrics = (
            generate_city_metrics(
                city=city,
                lat=lat,
                lon=lon,
                hospitals=hospitals,
                transit=transit,
                shelters=shelters,
            )
        )

        print("AI Metrics:", metrics)

        return metrics

    except Exception as e:

        print("City metrics error:", e)

        return {
            "error":
            str(e)
        }