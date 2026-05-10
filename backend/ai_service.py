from groq import Groq
import os
from dotenv import load_dotenv

load_dotenv()

client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)


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