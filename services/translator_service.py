from deep_translator import GoogleTranslator

def translate_tagalog_to_english(text: str) -> str:
    if not text:
        return ""

    try:
        translated = GoogleTranslator(source='tl', target='en').translate(text)
        return translated
    except Exception as e:
        print(f"Translation error: {e}")
        return text