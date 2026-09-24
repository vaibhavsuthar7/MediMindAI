import os
import time
import random
import smtplib
import threading
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm.session import Session

from app.database import get_db
from app import models, schemas, auth

load_dotenv()

router = APIRouter(prefix="/api/auth", tags=["auth"])

# In-memory OTP storage: { email_clean: {"code": "123456", "expires_at": timestamp} }
OTP_STORE = {}
OTP_VALIDITY_SECONDS = 600  # 10 minutes


def generate_otp() -> str:
    return f"{random.randint(100000, 999999)}"


def _send_email_smtp_worker(to_email: str, otp_code: str):
    """Background worker for sending OTP email via Brevo SMTP without blocking API responses."""
    smtp_host = os.getenv("SMTP_HOST", "")
    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    smtp_user = os.getenv("SMTP_USER", "")
    smtp_password = os.getenv("SMTP_PASSWORD", "")
    from_email = os.getenv("SMTP_FROM_EMAIL", smtp_user or "havenos118@gmail.com")

    if not (smtp_host and smtp_user and smtp_password):
        print(f"[OTP Info] SMTP credentials not configured. OTP printed to terminal above.")
        return

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = f"MediMind AI Verification Code: {otp_code}"
        msg["From"] = f"MediMind AI <{from_email}>"
        msg["To"] = to_email

        text_body = f"Your MediMind AI 6-digit OTP verification code is: {otp_code}. Valid for 10 minutes."
        html_body = f"""
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 28px; background-color: #FAF6EE; border-radius: 20px; color: #231B0F; max-width: 500px; margin: auto; border: 1px solid #E6DCC8;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #E07A5F; font-size: 28px; font-weight: 800; margin: 0;">MediMind <span style="color: #231B0F;">AI</span></h1>
            <p style="color: #7C6E59; font-size: 13px; margin-top: 4px; font-weight: 600;">Smart Healthcare Assistant</p>
          </div>
          <div style="background-color: #FFFDF7; border: 1px solid #E6DCC8; border-radius: 16px; padding: 24px; text-align: center; box-shadow: 0 4px 20px rgba(0,0,0,0.04);">
            <p style="font-size: 14px; font-weight: 700; color: #594C38; margin: 0 0 16px 0;">Your 6-Digit Verification Code</p>
            <div style="font-family: 'Courier New', monospace; font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #E07A5F; background: #FAF6EE; padding: 16px 24px; border-radius: 12px; display: inline-block; border: 2px dashed #E07A5F;">
              {otp_code}
            </div>
            <p style="font-size: 12px; color: #7C6E59; margin-top: 18px; margin-bottom: 0;">Valid for 10 minutes. Do not share this code with anyone.</p>
          </div>
          <p style="font-size: 11px; color: #A89A84; text-align: center; margin-top: 20px;">If you didn't request this email, you can safely ignore it.</p>
        </div>
        """

        msg.attach(MIMEText(text_body, "plain"))
        msg.attach(MIMEText(html_body, "html"))

        with smtplib.SMTP(smtp_host, smtp_port, timeout=12) as server:
            server.starttls()
            server.login(smtp_user, smtp_password)
            server.sendmail(from_email, [to_email], msg.as_string())
        print(f"[SUCCESS] Real SMTP Email sent successfully to {to_email} with code {otp_code}!")
    except Exception as e:
        print(f"[WARNING] SMTP Send Warning (Check Brevo SMTP in backend/.env): {e}")


def send_email_otp(to_email: str, otp_code: str):
    """Logs the OTP to stdout and dispatches the SMTP email asynchronously in a background thread."""
    print("\n" + "=" * 60)
    print(f"[MediMind AI OTP CODE] Target: {to_email} | CODE: {otp_code}")
    print("=" * 60 + "\n")

    thread = threading.Thread(target=_send_email_smtp_worker, args=(to_email, otp_code), daemon=True)
    thread.start()


from sqlalchemy import func

@router.post("/send-otp")
def send_otp(payload: schemas.OTPRequest):
    email_clean = payload.email.strip().lower()
    if not email_clean.endswith("@gmail.com"):
        raise HTTPException(status_code=400, detail="email id is incorrect")
    otp_code = generate_otp()
    OTP_STORE[email_clean] = {
        "code": otp_code,
        "expires_at": time.time() + OTP_VALIDITY_SECONDS
    }
    send_email_otp(email_clean, otp_code)
    return {"message": f"6-digit OTP code sent to {email_clean}"}


@router.post("/verify-otp", response_model=schemas.Token)
def verify_otp_code(payload: schemas.OTPVerify, db: Session = Depends(get_db)):
    email_clean = payload.email.strip().lower()
    code_entered = payload.code.strip()

    record = OTP_STORE.get(email_clean)

    if not record:
        raise HTTPException(status_code=400, detail="No active OTP found. Please click Resend Code.")

    if time.time() > record["expires_at"]:
        OTP_STORE.pop(email_clean, None)
        raise HTTPException(status_code=400, detail="OTP code has expired. Please click Resend Code.")

    if record["code"] != code_entered:
        raise HTTPException(status_code=400, detail="Invalid 6-digit OTP code. Please check and try again.")

    OTP_STORE.pop(email_clean, None)

    # Find or auto-create user in DB
    user = db.query(models.User).filter(func.lower(models.User.email) == email_clean).first()
    if not user:
        user = models.User(
            name=email_clean.split("@")[0],
            email=email_clean,
            hashed_password=auth.hash_password("otp_authenticated_user"),
            age=None,
            sex=None,
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    token = auth.create_access_token({"sub": str(user.id), "email": user.email, "name": user.name})
    return schemas.Token(access_token=token, user=schemas.UserOut.model_validate(user))


@router.post("/forgot-password")
def forgot_password(payload: schemas.OTPRequest, db: Session = Depends(get_db)):
    email_clean = payload.email.strip().lower()
    if not email_clean.endswith("@gmail.com"):
        raise HTTPException(status_code=400, detail="email id is incorrect")

    user = db.query(models.User).filter(func.lower(models.User.email) == email_clean).first()
    if not user:
        raise HTTPException(status_code=404, detail="No account found with this email address. Please check your email or Sign Up.")

    otp_code = generate_otp()
    OTP_STORE[email_clean] = {
        "code": otp_code,
        "expires_at": time.time() + OTP_VALIDITY_SECONDS
    }
    send_email_otp(email_clean, otp_code)
    return {"message": f"Password reset OTP code sent to {email_clean}"}


@router.post("/reset-password")
def reset_password(payload: schemas.PasswordResetRequest, db: Session = Depends(get_db)):
    import re
    email_clean = payload.email.strip().lower()
    code_entered = payload.code.strip()
    new_password = payload.new_password

    # Comprehensive strong password validation
    if len(new_password) < 8:
        raise HTTPException(status_code=400, detail="New password must be at least 8 characters long.")
    if not re.search(r"[A-Z]", new_password):
        raise HTTPException(status_code=400, detail="New password must contain at least 1 uppercase letter.")
    if not re.search(r"[a-z]", new_password):
        raise HTTPException(status_code=400, detail="New password must contain at least 1 lowercase letter.")
    if not re.search(r"[0-9]", new_password):
        raise HTTPException(status_code=400, detail="New password must contain at least 1 number.")
    if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", new_password):
        raise HTTPException(status_code=400, detail="New password must contain at least 1 special character (!@#$%^&*).")

    user = db.query(models.User).filter(func.lower(models.User.email) == email_clean).first()
    if not user:
        raise HTTPException(status_code=404, detail="User account not found.")

    record = OTP_STORE.get(email_clean)

    if not record:
        raise HTTPException(status_code=400, detail="No active reset request found. Please request a new OTP code.")

    if time.time() > record["expires_at"]:
        OTP_STORE.pop(email_clean, None)
        raise HTTPException(status_code=400, detail="OTP code has expired. Please request a new code.")

    if record["code"] != code_entered:
        raise HTTPException(status_code=400, detail="Invalid 6-digit OTP code. Please check and try again.")

    OTP_STORE.pop(email_clean, None)

    user.hashed_password = auth.hash_password(new_password)
    db.commit()

    return {"message": "Password reset successful! You can now log in with your new password."}


@router.post("/signup", response_model=schemas.Token)
def signup(payload: schemas.UserCreate, db: Session = Depends(get_db)):
    clean_email = payload.email.strip().lower()
    if not clean_email.endswith("@gmail.com"):
        raise HTTPException(status_code=400, detail="email id is incorrect")

    existing = db.query(models.User).filter(func.lower(models.User.email) == clean_email).first()
    if existing:
        raise HTTPException(
            status_code=400,
            detail="This email is already registered! Please sign in with your password."
        )

    user = models.User(
        name=payload.name,
        email=clean_email,
        hashed_password=auth.hash_password(payload.password),
        age=payload.age,
        sex=payload.sex,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Generate and send 6-digit OTP for signup (10 min validity)
    otp_code = generate_otp()
    OTP_STORE[clean_email] = {
        "code": otp_code,
        "expires_at": time.time() + OTP_VALIDITY_SECONDS
    }
    send_email_otp(clean_email, otp_code)

    token = auth.create_access_token({"sub": str(user.id), "email": user.email, "name": user.name})
    return schemas.Token(
        access_token=token,
        user=schemas.UserOut.model_validate(user),
    )


@router.post("/login", response_model=schemas.Token)
def login(payload: schemas.UserLogin, db: Session = Depends(get_db)):
    clean_email = payload.email.strip().lower()
    # Exact case-insensitive match without SQL wildcards
    user = db.query(models.User).filter(func.lower(models.User.email) == clean_email).first()
    if not user or not auth.verify_password(payload.password.strip(), user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password"
        )
    token = auth.create_access_token({"sub": str(user.id), "email": user.email, "name": user.name})
    return schemas.Token(access_token=token, user=schemas.UserOut.model_validate(user))


@router.get("/check-email")
def check_email(email: str, db: Session = Depends(get_db)):
    clean_email = email.strip().lower()
    if not clean_email.endswith("@gmail.com"):
        return {"exists": False, "valid_domain": False, "detail": "email id is incorrect"}
    existing = db.query(models.User).filter(models.User.email == clean_email).first()
    return {"exists": existing is not None, "valid_domain": True}


@router.get("/me", response_model=schemas.UserOut)
def me(current_user: models.User = Depends(auth.get_current_user)):
    return current_user

