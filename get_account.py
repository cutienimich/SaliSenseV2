from fastapi import FastAPI
import psycopg2
import os

app = FastAPI()

@app.get("/test-db")
def test_db():
    conn = psycopg2.connect(os.getenv("DATABASE_URL"))
    cur = conn.cursor()
    cur.execute("SELECT 1;")
    result = cur.fetchone()
    conn.close()

    return {"database": "connected", "result": result}