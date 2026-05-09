from fastapi import FastAPI
from pydantic import BaseModel
from dotenv import load_dotenv
from google import genai
import os

load_dotenv()

app = FastAPI()

client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)

class ChatRequest(BaseModel):
    message: str

@app.get("/")
def root():
    return {"message": "UrbanFlow Backend Running"}

@app.post("/chat")
def chat(request: ChatRequest):

    prompt = f"""
    You are UrbanFlow AI, an intelligent smart city assistant focused on:
    - sustainable transportation
    - emergency response
    - climate resilience
    - accessibility
    - smart urban infrastructure
    - sustainable city development

    Provide concise, practical and useful responses.

    User Question:
    {request.message}
    """

    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=prompt
    )

    return {
        "response": response.text
    }