import re

def sanitize_text(text: str) -> str:
    clean = re.sub(r'<.*?>', '', text)
    clean = re.sub(r'[^\w\s.,!?\'"-]', '', clean)
    clean = re.sub(r'\s+', ' ', clean)
    return clean.strip()