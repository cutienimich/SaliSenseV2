import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()

def get_db_connection():
    database_url = os.getenv("DATABASE_URL")
    
    if database_url:
        # Render PostgreSQL
        return psycopg2.connect(database_url)
    else:
        # Local PostgreSQL
        return psycopg2.connect(
            host="localhost",
            dbname="demodb",
            user="postgres",
            password="123456789",
            port=5432
        )