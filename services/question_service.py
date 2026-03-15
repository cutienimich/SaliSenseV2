from services.db_service import get_db_connection


def create_question(survey_id, question_text, emotion_tag):
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            INSERT INTO questions (survey_id, question_text, emotion_tag)
            VALUES (%s, %s, %s)
            RETURNING id;
        """, (survey_id, question_text, emotion_tag))

        question_id = cursor.fetchone()[0]
        conn.commit()
        return question_id

    except Exception as e:
        conn.rollback()
        raise e
    finally:
        cursor.close()
        conn.close()

def get_questions_by_survey(survey_id):
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            SELECT id, question_text, emotion_tag
            FROM questions
            WHERE survey_id = %s;
        """, (survey_id,))

        rows = cursor.fetchall()
        return [
            {
                "question_id": row[0],
                "question_text": row[1],
                "emotion_tag": row[2]
            }
            for row in rows
        ]

    finally:
        cursor.close()
        conn.close()

def delete_question(question_id: int, creator_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        # Check if question exists and belongs to creator's survey
        cursor.execute("""
            SELECT q.id FROM questions q
            JOIN surveys s ON q.survey_id = s.id
            WHERE q.id = %s AND s.created_by = %s
        """, (question_id, creator_id))

        if not cursor.fetchone():
            return {"error": "Question not found or unauthorized"}

        cursor.execute("DELETE FROM questions WHERE id = %s", (question_id,))
        conn.commit()

        return {"message": "Question deleted successfully"}

    except Exception as e:
        conn.rollback()
        raise e
    finally:
        cursor.close()
        conn.close()