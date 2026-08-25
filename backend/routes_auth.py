import base64
import io
import pyotp
import qrcode
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, EmailStr, Field
from config import db
from security import (
    audit,
    check_lockout,
    clear_failures,
    client_ip,
    create_token,
    decode_token,
    get_admin,
    hash_password,
    public_user,
    rate_limit,
    record_failure,
    verify_password,
)

router = APIRouter(prefix="/api/auth", tags=["auth"])


class LoginIn(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=200)


class MfaVerifyIn(BaseModel):
    mfa_token: str
    code: str = Field(min_length=6, max_length=8)


class CodeIn(BaseModel):
    code: str = Field(min_length=6, max_length=8)


class ChangePasswordIn(BaseModel):
    current_password: str = Field(min_length=1, max_length=200)
    new_password: str = Field(min_length=12, max_length=200)


@router.post("/login")
async def login(body: LoginIn, request: Request):
    ip = client_ip(request)
    await rate_limit(f"login:{ip}", 20, 900)
    email = body.email.lower()
    identifier = f"{ip}:{email}"
    await check_lockout(identifier)
    user = await db.admin_users.find_one({"email": email}, {"_id": 0})
    if not user or not verify_password(body.password, user["password_hash"]):
        await record_failure(identifier)
        await audit(email, "admin_login", "auth", "failure", request)
        raise HTTPException(401, "Invalid email or password")
    if user.get("mfa_enabled"):
        return {"mfa_required": True, "mfa_token": create_token(user["id"], "mfa_pending", 5)}
    await clear_failures(identifier)
    await audit(email, "admin_login", "auth", "success", request)
    return {
        "mfa_required": False,
        "access_token": create_token(user["id"], "admin_access", 720),
        "user": public_user(user),
    }


@router.post("/mfa/verify")
async def mfa_verify(body: MfaVerifyIn, request: Request):
    payload = decode_token(body.mfa_token, "mfa_pending")
    user = await db.admin_users.find_one({"id": payload["sub"]}, {"_id": 0})
    if not user or not user.get("mfa_enabled"):
        raise HTTPException(401, "Invalid MFA session")
    ip = client_ip(request)
    identifier = f"{ip}:{user['email']}:mfa"
    await check_lockout(identifier)
    if not pyotp.TOTP(user["mfa_secret"]).verify(body.code.strip(), valid_window=1):
        await record_failure(identifier)
        await audit(user["email"], "mfa_verify", "auth", "failure", request)
        raise HTTPException(401, "Invalid authentication code")
    await clear_failures(identifier)
    await clear_failures(f"{ip}:{user['email']}")
    await audit(user["email"], "admin_login_mfa", "auth", "success", request)
    return {
        "access_token": create_token(user["id"], "admin_access", 720),
        "user": public_user(user),
    }


@router.get("/me")
async def me(admin: dict = Depends(get_admin)):
    return public_user(admin)


@router.post("/mfa/setup")
async def mfa_setup(admin: dict = Depends(get_admin)):
    secret = pyotp.random_base32()
    await db.admin_users.update_one({"id": admin["id"]}, {"$set": {"mfa_secret_pending": secret}})
    uri = pyotp.TOTP(secret).provisioning_uri(name=admin["email"], issuer_name="TwinStone Constructions")
    img = qrcode.make(uri)
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    qr_b64 = "data:image/png;base64," + base64.b64encode(buf.getvalue()).decode()
    return {"secret": secret, "otpauth_url": uri, "qr_code": qr_b64}


@router.post("/mfa/enable")
async def mfa_enable(body: CodeIn, admin: dict = Depends(get_admin)):
    fresh = await db.admin_users.find_one({"id": admin["id"]}, {"_id": 0})
    secret = (fresh or {}).get("mfa_secret_pending")
    if not secret:
        raise HTTPException(400, "Start MFA setup first")
    if not pyotp.TOTP(secret).verify(body.code.strip(), valid_window=1):
        raise HTTPException(400, "Invalid code. Check your authenticator and try again.")
    await db.admin_users.update_one(
        {"id": admin["id"]},
        {"$set": {"mfa_enabled": True, "mfa_secret": secret}, "$unset": {"mfa_secret_pending": ""}},
    )
    await audit(admin["email"], "mfa_enabled", "security", "success")
    return {"mfa_enabled": True}


@router.post("/change-password")
async def change_password(body: ChangePasswordIn, request: Request, admin: dict = Depends(get_admin)):
    await rate_limit(f"change-password:{admin['id']}", 5, 900)
    fresh = await db.admin_users.find_one({"id": admin["id"]}, {"_id": 0})
    if not fresh or not verify_password(body.current_password, fresh["password_hash"]):
        await audit(admin["email"], "password_change", "auth", "failure", request)
        raise HTTPException(400, "Current password is incorrect")
    if body.new_password == body.current_password:
        raise HTTPException(400, "New password must be different from the current one")
    await db.admin_users.update_one(
        {"id": admin["id"]}, {"$set": {"password_hash": hash_password(body.new_password)}}
    )
    await audit(admin["email"], "password_change", "auth", "success", request)
    return {"ok": True}


@router.post("/logout")
async def logout(request: Request, admin: dict = Depends(get_admin)):
    await audit(admin["email"], "admin_logout", "auth", "success", request)
    return {"ok": True}
