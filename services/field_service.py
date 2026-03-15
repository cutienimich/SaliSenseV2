from services.db_service import get_db_connection


def create_survey_field(survey_id: int, field_label: str, field_type: str, is_required: bool = True):
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            INSERT INTO survey_fields (survey_id, field_label, field_type, is_required)
            VALUES (%s, %s, %s, %s)
            RETURNING id;
        """, (survey_id, field_label, field_type, is_required))

        field_id = cursor.fetchone()[0]
        conn.commit()
        return field_id

    except Exception as e:
        conn.rollback()
        raise e
    finally:
        cursor.close()
        conn.close()


def get_fields_by_survey(survey_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            SELECT id, field_label, field_type, is_required
            FROM survey_fields
            WHERE survey_id = %s
            ORDER BY id ASC
        """, (survey_id,))

        rows = cursor.fetchall()
        return [
            {
                "field_id": row[0],
                "field_label": row[1],
                "field_type": row[2],
                "is_required": row[3]
            }
            for row in rows
        ]

    finally:
        cursor.close()
        conn.close()


def delete_survey_field(field_id: int, creator_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            SELECT sf.id FROM survey_fields sf
            JOIN surveys s ON sf.survey_id = s.id
            WHERE sf.id = %s AND s.created_by = %s
        """, (field_id, creator_id))

        if not cursor.fetchone():
            return {"error": "Field not found or unauthorized"}

        cursor.execute("DELETE FROM survey_fields WHERE id = %s", (field_id,))
        conn.commit()
        return {"message": "Field deleted successfully"}

    except Exception as e:
        conn.rollback()
        raise e
    finally:
        cursor.close()
        conn.close()


def save_field_responses(survey_id: int, respondent_email: str, field_answers: list):
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        for answer in field_answers:
            cursor.execute("""
                INSERT INTO field_responses (survey_id, field_id, respondent_email, field_value)
                VALUES (%s, %s, %s, %s)
            """, (survey_id, answer["field_id"], respondent_email, answer["field_value"]))

        conn.commit()
        return {"message": "Field responses saved"}

    except Exception as e:
        conn.rollback()
        raise e
    finally:
        cursor.close()
        conn.close()


def get_field_responses_by_survey(survey_id: int, creator_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            SELECT id FROM surveys WHERE id = %s AND created_by = %s
        """, (survey_id, creator_id))

        if not cursor.fetchone():
            return {"error": "Survey not found or unauthorized"}

        cursor.execute("""
            SELECT fr.respondent_email, sf.field_label, fr.field_value
            FROM field_responses fr
            JOIN survey_fields sf ON fr.field_id = sf.id
            WHERE fr.survey_id = %s
            ORDER BY fr.respondent_email, sf.id
        """, (survey_id,))

        rows = cursor.fetchall()

        # Group by respondent
        respondents = {}
        for email, label, value in rows:
            if email not in respondents:
                respondents[email] = {"respondent_email": email, "fields": {}}
            respondents[email]["fields"][label] = value

        return list(respondents.values())

    finally:
        cursor.close()
        conn.close()