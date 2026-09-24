import datetime as dt
from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
import bcrypt
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app import models

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")


def hash_password(password: str) -> str:
    pwd_bytes = password.encode("utf-8")[:72]
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pwd_bytes, salt).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    try:
        plain_bytes = plain.encode("utf-8")[:72]
        hashed_bytes = hashed.encode("utf-8")
        return bcrypt.checkpw(plain_bytes, hashed_bytes)
    except Exception:
        return False


def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = dt.datetime.utcnow() + dt.timedelta(minutes=settings.access_token_expire_minutes)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.jwt_secret, algorithm=settings.jwt_algorithm)


def get_current_user(
    token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)
) -> models.User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    sub: Optional[str] = None
    email: Optional[str] = None
    name: Optional[str] = None

    # Strict cryptographic signature verification
    try:
        payload = jwt.decode(
            token,
            settings.jwt_secret,
            algorithms=[settings.jwt_algorithm]
        )
        sub = str(payload.get("sub")) if payload.get("sub") is not None else None
        email = payload.get("email")
        name = payload.get("name")
    except JWTError:
        raise credentials_exception

    if not sub and not email:
        raise credentials_exception

    user = None
    if sub and sub.isdigit():
        user = db.query(models.User).filter(models.User.id == int(sub)).first()

    if not user and email:
        user = db.query(models.User).filter(models.User.email == email).first()

    if not user and sub and not sub.isdigit():
        user = db.query(models.User).filter(models.User.email == f"{sub}@supabase.user").first()

    # Step 3: Auto-create user record in DB if authenticated via Supabase / External Auth
    if not user:
        user_email = email if email else f"{sub}@supabase.user"
        user_name = name if name else user_email.split("@")[0]
        user = models.User(
            name=user_name,
            email=user_email,
            hashed_password=hash_password("supabase_external_auth_account"),
            age=None,
            sex=None,
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    return user
