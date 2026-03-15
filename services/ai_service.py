import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))


def generate_question_summary(question_text: str, responses: list) -> str:
    if not responses:
        return "Wala pang mga sagot para sa tanong na ito."

    responses_text = "\n".join([
        f"{i+1}. \"{r['text']}\" (Emosyon: {r['emotion']}, Sentiment: {r['sentiment']})"
        for i, r in enumerate(responses)
    ])

    completion = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {
                "role": "user",
                "content": f"""Ikaw ay isang survey analyzer. Suriin ang mga sagot sa tanong na ito at gumawa ng maikling Tagalog summary (3-4 sentences) tungkol sa kabuuang emosyon at sentiment ng mga respondent.

Tanong: "{question_text}"

Mga Sagot:
{responses_text}

Gumawa ng natural na Tagalog summary na nagpapaliwanag ng kabuuang nararamdaman ng mga respondent at kung ano ang pangkalahatang tema ng kanilang mga sagot. Huwag mag-number, prose lang."""
            }
        ],
        max_tokens=500
    )

    return completion.choices[0].message.content