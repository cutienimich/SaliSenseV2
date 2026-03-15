from services.db_service import get_db_connection
from utils.security import generate_verification_token


def create_survey(title: str, description: str, creator_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        survey_token = generate_verification_token()

        cursor.execute("""
            INSERT INTO surveys (title, description, created_by, is_active, survey_token)
            VALUES (%s, %s, %s, %s, %s)
            RETURNING id
        """, (title, description, creator_id, True, survey_token))

        survey_id = cursor.fetchone()[0]
        conn.commit()

        return {
            "survey_id": survey_id,
            "survey_token": survey_token,
            "survey_link": f"/survey/{survey_token}"
        }

    except Exception as e:
        conn.rollback()
        raise e
    finally:
        cursor.close()
        conn.close()


def get_survey_by_token(token: str):
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            SELECT id, title, description, is_active 
            FROM surveys WHERE survey_token = %s
        """, (token,))
        survey = cursor.fetchone()

        if not survey:
            return None

        return {
            "survey_id": survey[0],
            "title": survey[1],
            "description": survey[2],
            "is_active": survey[3]
        }

    finally:
        cursor.close()
        conn.close()


def get_surveys_by_creator(creator_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            SELECT s.id, s.title, s.description, s.is_active, s.survey_token, s.created_at,
                   COUNT(DISTINCT r.respondent_email) as respondent_count
            FROM surveys s
            LEFT JOIN questions q ON q.survey_id = s.id
            LEFT JOIN responses r ON r.question_id = q.id
            WHERE s.created_by = %s
            GROUP BY s.id, s.title, s.description, s.is_active, s.survey_token, s.created_at
            ORDER BY s.created_at DESC
        """, (creator_id,))
        surveys = cursor.fetchall()

        return [
            {
                "survey_id": s[0],
                "title": s[1],
                "description": s[2],
                "is_active": s[3],
                "survey_link": f"/survey/{s[4]}",
                "created_at": s[5],
                "respondent_count": s[6]
            }
            for s in surveys
        ]

    finally:
        cursor.close()
        conn.close()
        

def toggle_survey_status(survey_id: int, creator_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        # Check if survey exists and belongs to creator
        cursor.execute("""
            SELECT id, is_active FROM surveys 
            WHERE id = %s AND created_by = %s
        """, (survey_id, creator_id))
        survey = cursor.fetchone()

        if not survey:
            return {"error": "Survey not found or unauthorized"}

        # Toggle status
        new_status = not survey[1]
        cursor.execute("""
            UPDATE surveys SET is_active = %s, updated_at = NOW()
            WHERE id = %s
        """, (new_status, survey_id))
        conn.commit()

        return {
            "survey_id": survey_id,
            "is_active": new_status,
            "message": "Survey activated" if new_status else "Survey deactivated"
        }

    except Exception as e:
        conn.rollback()
        raise e
    finally:
        cursor.close()
        conn.close()

def update_survey(survey_id: int, title: str, description: str, creator_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            SELECT id FROM surveys WHERE id = %s AND created_by = %s
        """, (survey_id, creator_id))

        if not cursor.fetchone():
            return {"error": "Survey not found or unauthorized"}

        cursor.execute("""
            UPDATE surveys SET title = %s, description = %s, updated_at = NOW()
            WHERE id = %s
        """, (title, description, survey_id))
        conn.commit()

        return {"message": "Survey updated successfully"}

    except Exception as e:
        conn.rollback()
        raise e
    finally:
        cursor.close()
        conn.close()
        
def delete_survey(survey_id: int, creator_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            SELECT id FROM surveys WHERE id = %s AND created_by = %s
        """, (survey_id, creator_id))

        if not cursor.fetchone():
            return {"error": "Survey not found or unauthorized"}

        # Delete responses first (FK constraint)
        cursor.execute("""
            DELETE FROM responses WHERE question_id IN (
                SELECT id FROM questions WHERE survey_id = %s
            )
        """, (survey_id,))

        # Delete questions
        cursor.execute("DELETE FROM questions WHERE survey_id = %s", (survey_id,))

        # Delete survey
        cursor.execute("DELETE FROM surveys WHERE id = %s", (survey_id,))

        conn.commit()
        return {"message": "Survey deleted successfully"}

    except Exception as e:
        conn.rollback()
        raise e
    finally:
        cursor.close()
        conn.close()