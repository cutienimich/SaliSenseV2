from groq import Groq
import os

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def classify_text_and_sentiment(question: str, answer: str):
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{
            "role": "user",
            "content": f"""Analyze the emotion and sentiment of this survey response.

Question: "{question}"
Answer: "{answer}"

Respond ONLY in this exact JSON format, nothing else:
{{
    "emotion": "joy|sadness|anger|fear|surprise|disgust|neutral|optimism|disappointment|approval|disapproval|caring|desire|excitement|gratitude|pride|relief|confusion|curiosity|annoyance|embarrassment|nervousness|remorse",
    "sentiment": "positive|negative|neutral",
    "emotion_score": 0.95,
    "sentiment_score": 0.95
}}"""
        }],
        max_tokens=100
    )
    
    import json
    result = json.loads(response.choices[0].message.content)
    return result