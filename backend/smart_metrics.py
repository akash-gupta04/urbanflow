import json
import requests
from groq import Groq
import os


client = Groq(
    api_key=os.getenv(
        "GROQ_API_KEY"
    )
)


def generate_city_metrics(
    city: str,
    lat: float,
    lon: float,
    hospitals: int,
    transit: int,
    shelters: int
):

    try:

        weather_url = (
            "https://api.open-meteo.com/v1/forecast"
            f"?latitude={lat}"
            f"&longitude={lon}"
            "&current=temperature_2m,"
            "precipitation"
        )

        weather_response = (
            requests.get(
                weather_url
            )
        )

        weather_data = (
            weather_response.json()
        )

        current_weather = (
            weather_data.get(
                "current",
                {}
            )
        )

        temperature = (
            current_weather.get(
                "temperature_2m",
                20
            )
        )

        precipitation = (
            current_weather.get(
                "precipitation",
                0
            )
        )

        prompt = f"""
You are an AI urban intelligence system.

Analyze this city and generate realistic urban metrics.

City: {city}

Weather:
Temperature = {temperature}°C
Precipitation = {precipitation}

Infrastructure:
Hospitals = {hospitals}
Transit Hubs = {transit}
Shelters = {shelters}

Rules:
- Use realistic values
- Scores must be between 0 and 100
- Rain lowers traffic efficiency
- More hospitals increase emergency access
- Better transit increases CO2 reduction

Return ONLY valid JSON.

Example:
{{
"co2_reduced": 34,
"traffic_reduction": 62,
"emergency_access": 88,
"transit_efficiency": 79
}}
"""

        completion = (
            client.chat.completions.create(
                model=
                "llama3-8b-8192",

                messages=[
                    {
                        "role":
                        "user",

                        "content":
                        prompt,
                    }
                ],

                temperature=0.4,
            )
        )

        response_text = (
            completion
            .choices[0]
            .message.content
            .strip()
        )

        # Remove markdown formatting
        response_text = (
            response_text
            .replace(
                "```json",
                ""
            )
            .replace(
                "```",
                ""
            )
            .strip()
        )

        try:

            metrics = json.loads(
                response_text
            )

        except Exception:

            print(
                "Bad JSON:",
                response_text
            )

            metrics = {
                "co2_reduced": 25,
                "traffic_reduction": 65,
                "emergency_access": 80,
                "transit_efficiency": 78,
            }

        return metrics

    except Exception as e:

        print(
            "Smart metrics error:",
            e
        )

        return {
            "co2_reduced": 25,
            "traffic_reduction": 65,
            "emergency_access": 80,
            "transit_efficiency": 78,
        }