from transformers import pipeline

# Emotion model - SamLowe/roberta-base-go_emotions
emotion_model = pipeline(
    "text-classification",
    model="SamLowe/roberta-base-go_emotions"
)

# Sentiment model - cardiffnlp
sentiment_model = pipeline(
    "text-classification",
    model="cardiffnlp/twitter-roberta-base-sentiment-latest"
)


def classify_text(text: str):
    return emotion_model(text)


def classify_sentiment(text: str):
    result = sentiment_model(text)
    label = result[0]["label"].lower()  # positive, negative, neutral
    score = result[0]["score"]
    return {"sentiment": label, "score": score}