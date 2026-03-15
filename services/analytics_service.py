from services.db_service import execute_query, get_db_connection
from services.ai_service import generate_question_summary


def get_or_generate_summary(question_id: int, regenerate: bool = False) -> str:
    if not regenerate:
        existing = execute_query("""
            SELECT ai_summary FROM questions WHERE id = %s
        """, (question_id,), fetchone=True)

        if existing and existing[0]:
            return existing[0]

    rows = execute_query("""
        SELECT original_text, emotion_label, sentiment_label
        FROM responses WHERE question_id = %s
    """, (question_id,), fetch=True)

    if not rows:
        return "Wala pang mga sagot para sa tanong na ito."

    responses = [
        {"text": row[0], "emotion": row[1], "sentiment": row[2]}
        for row in rows
    ]

    question = execute_query("""
        SELECT question_text FROM questions WHERE id = %s
    """, (question_id,), fetchone=True)

    question_text = question[0] if question else ""

    summary = generate_question_summary(question_text, responses)

    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            UPDATE questions SET ai_summary = %s WHERE id = %s
        """, (summary, question_id))
        conn.commit()
    finally:
        cursor.close()
        conn.close()

    return summary


def get_emotion_distribution_by_survey(survey_id: int):

    survey = execute_query(
        "SELECT id, title FROM surveys WHERE id = %s",
        (survey_id,),
        fetchone=True
    )

    if not survey:
        return None

    total = execute_query("""
        SELECT COUNT(*) FROM responses
        WHERE question_id IN (
            SELECT id FROM questions WHERE survey_id = %s
        )
    """, (survey_id,), fetchone=True)[0]

    # Count unique respondents
    total_respondents = execute_query("""
        SELECT COUNT(DISTINCT respondent_email) FROM responses
        WHERE question_id IN (
            SELECT id FROM questions WHERE survey_id = %s
        )
    """, (survey_id,), fetchone=True)[0]

    if total == 0:
        return {
            "survey_id": survey_id,
            "title": survey[1],
            "total_responses": 0,
            "total_respondents": 0,
            "sentiment_distribution": {},
            "emotion_distribution": {},
            "per_question": []
        }

    sentiment_rows = execute_query("""
        SELECT sentiment_label, COUNT(*) FROM responses
        WHERE question_id IN (
            SELECT id FROM questions WHERE survey_id = %s
        )
        GROUP BY sentiment_label
        ORDER BY COUNT(*) DESC
    """, (survey_id,), fetch=True)

    overall_sentiment = {}
    for sentiment, count in sentiment_rows:
        overall_sentiment[sentiment] = {
            "count": count,
            "percentage": round((count / total) * 100, 2)
        }

    emotion_rows = execute_query("""
        SELECT emotion_label, COUNT(*) FROM responses
        WHERE question_id IN (
            SELECT id FROM questions WHERE survey_id = %s
        )
        GROUP BY emotion_label
        ORDER BY COUNT(*) DESC
    """, (survey_id,), fetch=True)

    overall_emotion = {}
    for emotion, count in emotion_rows:
        overall_emotion[emotion] = {
            "count": count,
            "percentage": round((count / total) * 100, 2)
        }

    questions = execute_query("""
        SELECT id, question_text FROM questions WHERE survey_id = %s
    """, (survey_id,), fetch=True)

    per_question = []
    for q_id, q_text in questions:

        q_total = execute_query("""
            SELECT COUNT(*) FROM responses WHERE question_id = %s
        """, (q_id,), fetchone=True)[0]

        if q_total == 0:
            continue

        q_sentiments = execute_query("""
            SELECT sentiment_label, COUNT(*) FROM responses
            WHERE question_id = %s
            GROUP BY sentiment_label
            ORDER BY COUNT(*) DESC
        """, (q_id,), fetch=True)

        q_sentiment_distribution = {}
        for sentiment, count in q_sentiments:
            q_sentiment_distribution[sentiment] = {
                "count": count,
                "percentage": round((count / q_total) * 100, 2)
            }

        q_emotions = execute_query("""
            SELECT emotion_label, COUNT(*) FROM responses
            WHERE question_id = %s
            GROUP BY emotion_label
            ORDER BY COUNT(*) DESC
        """, (q_id,), fetch=True)

        q_emotion_distribution = {}
        for emotion, count in q_emotions:
            q_emotion_distribution[emotion] = {
                "count": count,
                "percentage": round((count / q_total) * 100, 2)
            }

        # Sa per_question loop, palitan yung ai_summary section
        ai_summary_row = execute_query("""
            SELECT ai_summary FROM questions WHERE id = %s
        """, (q_id,), fetchone=True)

        existing_summary = ai_summary_row[0] if ai_summary_row else None

        # Auto-generate if wala pang summary
        if not existing_summary:
            try:
                existing_summary = get_or_generate_summary(q_id)
            except Exception:
                existing_summary = None

        per_question.append({
            "question_id": q_id,
            "question_text": q_text,
            "total_responses": q_total,
            "sentiment_distribution": q_sentiment_distribution,
            "emotion_distribution": q_emotion_distribution,
            "ai_summary": existing_summary
        })

    return {
        "survey_id": survey_id,
        "title": survey[1],
        "total_responses": total,
        "total_respondents": total_respondents,
        "sentiment_distribution": overall_sentiment,
        "emotion_distribution": overall_emotion,
        "per_question": per_question
    }


def get_responses_text_by_question(question_id: int):
    rows = execute_query("""
        SELECT original_text, emotion_label, sentiment_label
        FROM responses WHERE question_id = %s
    """, (question_id,), fetch=True)

    return [
        {"text": row[0], "emotion": row[1], "sentiment": row[2]}
        for row in rows
    ]
    
