import time
import uuid
import bcrypt
import jwt
from datetime import datetime, timezone, timedelta
from fastapi import HTTPException, Request
from pymongo import ReturnDocument
from config import db, JWT_SECRET

ALGORITHM = "HS256"
LOCKOUT_THRESHOLD = 5
LOCKOUT_MINUTES = 15


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        return False


def create_token(sub: str, token_type: str, minutes: int) -> str:
    now = datetime.now(timezone.utc)
    return jwt.encode(
        {"sub": sub, "type": token_type, "iat": now, "exp": now + timedelta(minutes=minutes)},
        JWT_SECRET,
        algorithm=ALGORITHM,
    )


def decode_token(token: str, token_type: str = None) -> dict:
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(401, "Session expired. Please sign in again.")
    except jwt.InvalidTokenError:
        raise HTTPException(401, "Invalid authentication token")
    if token_type and payload.get("type") != token_type:
        raise HTTPException(401, "Invalid token type")
    return payload


def public_user(user: dict) -> dict:
    return {
        "id": user["id"],
        "email": user["email"],
        "name": user.get("name", "Administrator"),
        "role": "admin",
        "mfa_enabled": bool(user.get("mfa_enabled")),
    }


async def get_admin(request: Request) -> dict:
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        raise HTTPException(401, "Not authenticated")
    payload = decode_token(auth[7:].strip(), "admin_access")
    user = await db.admin_users.find_one({"id": payload["sub"]}, {"_id": 0})
    if not user:
        raise HTTPException(401, "Account not found")
    return user


def client_ip(request: Request) -> str:
    fwd = request.headers.get("x-forwarded-for")
    if fwd:
        return fwd.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


async def check_lockout(identifier: str):
    rec = await db.login_attempts.find_one({"identifier": identifier}, {"_id": 0})
    if rec and rec.get("count", 0) >= LOCKOUT_THRESHOLD:
        locked_until = rec.get("locked_until")
        if locked_until and datetime.fromisoformat(locked_until) > datetime.now(timezone.utc):
            raise HTTPException(429, "Too many failed attempts. Temporarily locked. Try again later.")


async def record_failure(identifier: str):
    now = datetime.now(timezone.utc)
    rec = await db.login_attempts.find_one({"identifier": identifier})
    if rec:
        count = rec.get("count", 0) + 1
        update = {"count": count, "last_attempt": now.isoformat()}
        if count >= LOCKOUT_THRESHOLD:
            update["locked_until"] = (now + timedelta(minutes=LOCKOUT_MINUTES)).isoformat()
        await db.login_attempts.update_one({"identifier": identifier}, {"$set": update})
    else:
        await db.login_attempts.insert_one(
            {"identifier": identifier, "count": 1, "last_attempt": now.isoformat()}
        )


async def clear_failures(identifier: str):
    await db.login_attempts.delete_many({"identifier": identifier})


async def rate_limit(key: str, max_hits: int, window_seconds: int):
    bucket = int(time.time() // window_seconds)
    rec = await db.rate_limits.find_one_and_update(
        {"key": key, "bucket": bucket},
        {"$inc": {"count": 1}, "$setOnInsert": {"created_at": datetime.now(timezone.utc).isoformat()}},
        upsert=True,
        return_document=ReturnDocument.AFTER,
    )
    if rec and rec.get("count", 0) > max_hits:
        raise HTTPException(429, "Rate limit exceeded. Please try again later.")


async def audit(actor: str, action: str, obj: str, result: str, request: Request = None):
    await db.audit_logs.insert_one(
        {
            "id": str(uuid.uuid4()),
            "actor": actor,
            "action": action,
            "object": obj,
            "result": result,
            "ip": client_ip(request) if request else "system",
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
    )
