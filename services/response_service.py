from services.translator_service import translate_tagalog_to_english
from services.classifier_service import classify_text_and_sentiment
from services.db_service import get_db_connection


def process_response(question_id: int, text: str, respondent_email: str):

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        # 1️⃣ Get survey_id + question_text
        cursor.execute("""
            SELECT survey_id, question_text FROM questions WHERE id = %s
        """, (question_id,))
        question = cursor.fetchone()

        if not question:
            return None

        survey_id = question[0]
        question_text = question[1]

        # 2️⃣ Check if survey is active
        cursor.execute("""
            SELECT is_active FROM surveys WHERE id = %s
        """, (survey_id,))
        survey = cursor.fetchone()

        if not survey or not survey[0]:
            return {"error": "Survey is no longer active"}

        # 3️⃣ Check if respondent already answered THIS SPECIFIC QUESTION
        cursor.execute("""
            SELECT id FROM responses 
            WHERE question_id = %s AND respondent_email = %s
        """, (question_id, respondent_email))

        if cursor.fetchone():
            return {"error": "You have already answered this question"}

        

        # 4️⃣ Translate
        translated_text = translate_tagalog_to_english(text)

        # 5️⃣ Classify using Groq — tanggalin na yung old classify_text at classify_sentiment
        result = classify_text_and_sentiment(question_text, translated_text)

        emotion_label = result["emotion"]
        emotion_score = result["emotion_score"]
        sentiment_label = result["sentiment"]
        sentiment_score = result["sentiment_score"]

        print(f"Question: {question_text}")
        print(f"Answer: {translated_text}")
        print(f"Emotion: {emotion_label} ({emotion_score})")
        print(f"Sentiment: {sentiment_label} ({sentiment_score})")
        # 6️⃣ Save to DB
        cursor.execute("""
            INSERT INTO responses 
            (question_id, original_text, translated_text, emotion_label, emotion_score,
             sentiment_label, sentiment_score, respondent_email)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id;
        """, (
            question_id, text, translated_text,
            emotion_label, emotion_score,
            sentiment_label, sentiment_score,
            respondent_email
        ))

        response_id = cursor.fetchone()[0]
        conn.commit()

        return {
            "response_id": response_id,
            "original_text": text,
            "translated_text": translated_text,
            "emotion": emotion_label,
            "emotion_score": round(emotion_score, 4),
            "sentiment": sentiment_label,
            "sentiment_score": round(sentiment_score, 4)
        }

    except Exception as e:
        conn.rollback()
        print(f"Response error: {e}")
        raise e
    finally:
        cursor.close()
        conn.close()


def get_responses_by_survey(survey_id: int, creator_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            SELECT id FROM surveys WHERE id = %s AND created_by = %s
        """, (survey_id, creator_id))

        if not cursor.fetchone():
            return {"error": "Survey not found or unauthorized"}

        cursor.execute("""
            SELECT r.id, r.question_id, q.question_text, r.original_text,
                   r.translated_text, r.emotion_label, r.emotion_score,
                   r.sentiment_label, r.sentiment_score,
                   r.respondent_email, r.created_at
            FROM responses r
            JOIN questions q ON r.question_id = q.id
            WHERE q.survey_id = %s
            ORDER BY q.id ASC, r.respondent_email ASC
        """, (survey_id,))

        rows = cursor.fetchall()
        return [
            {
                "response_id": row[0],
                "question_id": row[1],
                "question_text": row[2],
                "original_text": row[3],
                "translated_text": row[4],
                "emotion_label": row[5],
                "emotion_score": round(row[6], 4),
                "sentiment_label": row[7],
                "sentiment_score": round(row[8], 4),
                "respondent_email": row[9],
                "created_at": row[10]
            }
            for row in rows
        ]

    finally:
        cursor.close()
        conn.close()