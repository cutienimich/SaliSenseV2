import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

MAIL_USERNAME = os.getenv("MAIL_USERNAME")
MAIL_PASSWORD = os.getenv("MAIL_PASSWORD")
MAIL_FROM = os.getenv("MAIL_FROM")
BASE_URL = os.getenv("BASE_URL", "https://salisensev2.onrender.com")
FRONTEND_URL = os.getenv("FRONTEND_URL", "https://salisense15.vercel.app")


def send_verification_email(to_email: str, token: str):
    verification_link = f"{BASE_URL}/auth/verify?token={token}"

    message = MIMEMultipart("alternative")
    message["Subject"] = "Verify your account"
    message["From"] = MAIL_FROM
    message["To"] = to_email

    html_content = f"""
    <html>
        <body>
            <h2>Welcome to SaliSense!</h2>
            <p>Please verify your email by clicking the link below:</p>
            <p><a href="{verification_link}">{verification_link}</a></p>
            <p>This link will expire in <strong>24 hours</strong>.</p>
            <p>If you did not register, ignore this email.</p>
        </body>
    </html>
    """

    message.attach(MIMEText(html_content, "html"))

    try:
        with smtplib.SMTP("smtp.gmail.com", 587) as server:
            server.ehlo()
            server.starttls()
            server.login(MAIL_USERNAME, MAIL_PASSWORD)
            server.sendmail(MAIL_FROM, to_email, message.as_string())
        return True
    except Exception as e:
        print(f"Email sending failed: {e}")
        return False


def send_reset_email(email: str, token: str):
    reset_link = f"{FRONTEND_URL}/reset-password?token={token}"

    message = MIMEMultipart("alternative")
    message["Subject"] = "SaliSense - I-reset ang iyong Password"
    message["From"] = MAIL_FROM
    message["To"] = email

    html_content = f"""
    <html>
        <body style="font-family: Arial, sans-serif;">
            <h2>Reset ng Password</h2>
            <p>Nag-request ka ng password reset para sa iyong SaliSense account.</p>
            <p>I-click ang link sa ibaba para mag-reset ng password:</p>
            <p><a href="{reset_link}">{reset_link}</a></p>
            <p>Mag-e-expire ang link sa loob ng <strong>1 oras</strong>.</p>
            <p>Kung hindi ikaw ang nag-request nito, balewalain ang email na ito.</p>
        </body>
    </html>
    """

    message.attach(MIMEText(html_content, "html"))

    try:
        with smtplib.SMTP("smtp.gmail.com", 587) as server:
            server.ehlo()
            server.starttls()
            server.login(MAIL_USERNAME, MAIL_PASSWORD)
            server.sendmail(MAIL_FROM, email, message.as_string())
        return True
    except Exception as e:
        print(f"Reset email sending failed: {e}")
        return False
