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