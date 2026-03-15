import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

MAIL_USERNAME = os.getenv("MAIL_USERNAME")
MAIL_PASSWORD = os.getenv("MAIL_PASSWORD")
MAIL_FROM = os.getenv("MAIL_FROM")
BASE_URL = os.getenv("BASE_URL", "http://localhost:8000")


def send_verification_email(to_email: str, token: str):
    verification_link = f"{BASE_URL}/auth/verify?token={token}"

    message = MIMEMultipart("alternative")
    message["Subject"] = "Verify your account"
    message["From"] = MAIL_FROM
    message["To"] = to_email

    html_content = f"""
    <html>
        <body>
            <h2>Welcome to our platform!</h2>
            <p>Please verify your email by clicking the link below:</p>
            <a href="{verification_link}" 
               style="background-color:#4CAF50; color:white; padding:10px 20px; 
                      text-decoration:none; border-radius:5px;">
                Verify Account
            </a>
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
    reset_link = f"https://salisense15.vercel.app/reset-password?token={token}"

    message = MIMEMultipart("alternative")
    message["Subject"] = "SaliSense - I-reset ang iyong Password"
    message["From"] = MAIL_FROM
    message["To"] = email

    html_content = f"""
    <html>
        <body style="font-family: Arial, sans-serif; background-color: #1a1a1a; color: #ccc; padding: 40px;">
            <div style="max-width: 480px; margin: 0 auto; background: #2a2a2a; border-radius: 16px; padding: 40px; border: 1px solid #404040;">
                <h2 style="color: #FFB300; margin-bottom: 16px;">Reset ng Password</h2>
                <p>Nag-request ka ng password reset para sa iyong <strong style="color: #FFB300;">SaliSense</strong> account.</p>
                <p>I-click ang button sa ibaba para mag-reset ng password:</p>
                <a href="{reset_link}" 
                   style="display:inline-block; background:#FFB300; color:#303030; 
                          padding:12px 28px; border-radius:8px; text-decoration:none; 
                          font-weight:bold; margin: 16px 0;">
                    I-reset ang Password
                </a>
                <p style="color: #aaa; font-size: 0.9rem;">Mag-e-expire ang link sa loob ng <strong>1 oras</strong>.</p>
                <p style="color: #aaa; font-size: 0.9rem;">Kung hindi ikaw ang nag-request nito, balewalain ang email na ito.</p>
                <hr style="border-color: #404040; margin-top: 24px;" />
                <p style="color: #666; font-size: 0.8rem;">SaliSense — Survey System with Emotion Analysis</p>
            </div>
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