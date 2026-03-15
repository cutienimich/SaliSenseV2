from core.database import get_db_connection


def execute_query(query: str, params=None, fetch=False, fetchone=False):

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute(query, params)

    result = None

    if fetch:
        result = cursor.fetchall()

    elif fetchone:
        result = cursor.fetchone()

    conn.commit()
    cursor.close()
    conn.close()

    return result