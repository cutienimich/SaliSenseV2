import psycopg2

def get_db_connection():

    return psycopg2.connect(
        host="localhost",
        dbname="demodb",
        user="postgres",
        password="123456789",
        port=5432
    )