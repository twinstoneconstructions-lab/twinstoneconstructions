import logging
import re
import uuid
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, File, HTTPException, Request, UploadFile
from pydantic import BaseModel, Field
from starlette.concurrency import run_in_threadpool
from config import db
from security import audit, get_admin, rate_limit, client_ip
from storage import put_object

logger = logging.getLogger("twinstone.admin")

router = APIRouter(prefix="/api/admin", tags=["admin"])

ALLOWED = {
    "image": ({"jpg", "jpeg", "png", "webp", "avif"}, 15 * 1024 * 1024),
    "video": ({"mp4", "webm"}, 250 * 1024 * 1024),
    "pano": ({"jpg", "jpeg", "webp", "png"}, 25 * 1024 * 1024),
    "model": ({"glb", "gltf"}, 60 * 1024 * 1024),
    "pdf": ({"pdf"}, 25 * 1024 * 1024),
}

MIME = {
    "jpg": "image/jpeg", "jpeg": "image/jpeg", "png": "image/png", "webp": "image/webp",
    "avif": "image/avif", "mp4": "video/mp4", "webm": "video/webm", "pdf": "application/pdf",
    "glb": "model/gltf-binary", "gltf": "model/gltf+json",
}


def sniff_ok(ext: str, head: bytes) -> bool:
    if ext in ("jpg", "jpeg"):
        return head[:3] == b"\xff\xd8\xff"
    if ext == "png":
        return head[:4] == b"\x89PNG"
    if ext == "webp":
        return head[:4] == b"RIFF" and head[8:12] == b"WEBP"
    if ext == "avif":
        return head[4:8] == b"ftyp"
    if ext == "pdf":
        return head[:4] == b"%PDF"
    if ext == "mp4":
        return head[4:8] == b"ftyp"
    if ext == "webm":
        return head[:4] == b"\x1a\x45\xdf\xa3"
    if ext == "glb":
        return head[:4] == b"glTF"
    if ext == "gltf":
        return head[:1] == b"{"
    return False


def slugify(text: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")
    return slug or uuid.uuid4().hex[:8]


DERIVATIVE_WIDTHS = (480, 960, 1600)


def make_derivatives(data: bytes, ext: str, base_path: str) -> list:
    if ext not in ("jpg", "jpeg", "png", "webp"):
        return []
    try:
        import io
        from PIL import Image

        img = Image.open(io.BytesIO(data)).convert("RGB")
        original_width = img.width
        derivatives = []
        for width in DERIVATIVE_WIDTHS:
            if width >= original_width:
                continue
            resized = img.resize((width, int(img.height * width / original_width)), Image.LANCZOS)
            for fmt, params in (("webp", {"quality": 82, "method": 4}), ("avif", {"quality": 60})):
                buf = io.BytesIO()
                try:
                    resized.save(buf, format=fmt.upper(), **params)
                except Exception:
                    continue
                deriv_path = f"{base_path}_{width}w.{fmt}"
                try:
                    put_object(deriv_path, buf.getvalue(), f"image/{fmt}")
                    derivatives.append({"width": width, "format": fmt, "storage_path": deriv_path})
                except Exception:
                    continue
        return derivatives
    except Exception:
        return []


def transcode_video(data: bytes, ext: str, base_path: str) -> dict:
    """Convert to web-optimized WebM (VP9, 1280w) + extract a poster frame."""
    import os
    import subprocess
    import tempfile
    import imageio_ffmpeg

    result = {}
    ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()
    with tempfile.TemporaryDirectory() as tmp:
        src = os.path.join(tmp, f"source.{ext}")
        with open(src, "wb") as fh:
            fh.write(data)
        if ext != "webm":
            webm_out = os.path.join(tmp, "optimized.webm")
            subprocess.run(
                [ffmpeg, "-v", "error", "-i", src, "-c:v", "libvpx-vp9", "-crf", "36", "-b:v", "0",
                 "-deadline", "realtime", "-cpu-used", "8", "-row-mt", "1", "-an",
                 "-vf", "scale=1280:-2", "-y", webm_out],
                check=True, timeout=300,
            )
            with open(webm_out, "rb") as fh:
                uploaded = put_object(f"{base_path}_web.webm", fh.read(), "video/webm")
            result["webm_path"] = uploaded["path"]
        poster_out = os.path.join(tmp, "poster.jpg")
        subprocess.run(
            [ffmpeg, "-v", "error", "-ss", "1", "-i", src, "-frames:v", "1", "-q:v", "4", "-y", poster_out],
            check=True, timeout=60,
        )
        with open(poster_out, "rb") as fh:
            uploaded = put_object(f"{base_path}_poster.jpg", fh.read(), "image/jpeg")
        result["poster_path"] = uploaded["path"]
    return result


@router.post("/upload", status_code=201)
async def upload(request: Request, kind: str = "image", file: UploadFile = File(...), admin: dict = Depends(get_admin)):
    if kind not in ALLOWED:
        raise HTTPException(400, "Unsupported upload kind")
    await rate_limit(f"upload:{admin['id']}", 60, 3600)
    allowed_ext, max_size = ALLOWED[kind]
    filename = file.filename or "file"
    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    if ext not in allowed_ext:
        raise HTTPException(400, f"File type .{ext} is not allowed for {kind}")
    data = await file.read()
    if len(data) > max_size:
        raise HTTPException(413, f"File exceeds the {max_size // (1024 * 1024)}MB limit")
    if not sniff_ok(ext, data[:16]):
        raise HTTPException(400, "File content does not match its extension")
    path = f"twinstone/uploads/{admin['id']}/{uuid.uuid4()}.{ext}"
    try:
        result = put_object(path, data, MIME.get(ext, "application/octet-stream"))
    except Exception:
        raise HTTPException(502, "Storage upload failed. Please retry.")
    derivatives = []
    if kind in ("image", "pano"):
        derivatives = make_derivatives(data, ext, path.rsplit(".", 1)[0])
    record = {
        "id": str(uuid.uuid4()),
        "kind": kind,
        "storage_path": result["path"],
        "original_filename": filename,
        "content_type": MIME.get(ext, "application/octet-stream"),
        "size": result.get("size", len(data)),
        "derivatives": derivatives,
        "caption": "",
        "alt": "",
        "is_deleted": False,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    if kind == "video":
        try:
            optimized = await run_in_threadpool(transcode_video, data, ext, path.rsplit(".", 1)[0])
            record.update(optimized)
            record["optimized"] = True
        except Exception as e:
            logger.error(f"Video transcode failed for {filename}: {e}")
            record["optimized"] = False
    await db.media.insert_one(dict(record))
    await audit(admin["email"], "media_upload", filename, "success", request)
    if kind == "model" and len(data) > 15 * 1024 * 1024:
        record["optimization_hint"] = (
            "This model exceeds 15MB. Compress it before public use: "
            "npx @gltf-transform/cli optimize model.glb out.glb --compress draco --texture-compress webp"
        )
    if kind == "video" and not record.get("optimized"):
        record["optimization_hint"] = "Automatic WebM conversion was not possible for this file. The original is served as-is."
    return record


@router.get("/media")
async def list_media(kind: str = None, admin: dict = Depends(get_admin)):
    query = {"is_deleted": False}
    if kind:
        query["kind"] = kind
    return await db.media.find(query, {"_id": 0}).sort("created_at", -1).to_list(500)


@router.delete("/media/{media_id}")
async def delete_media(media_id: str, request: Request, admin: dict = Depends(get_admin)):
    result = await db.media.update_one({"id": media_id}, {"$set": {"is_deleted": True}})
    if result.matched_count == 0:
        raise HTTPException(404, "Media not found")
    await audit(admin["email"], "media_delete", media_id, "success", request)
    return {"ok": True}


class MediaItem(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    kind: str = "image"
    storage_path: Optional[str] = None
    external_url: Optional[str] = None
    caption: str = ""
    alt: str = ""


class SpecItem(BaseModel):
    label: str = ""
    value: str = ""


class SeoFields(BaseModel):
    title: str = ""
    description: str = ""
    og_image: str = ""


class ProjectIn(BaseModel):
    name: str = Field(min_length=2, max_length=160)
    slug: str = ""
    category: str = "Residential"
    status: str = "ongoing"
    published: bool = False
    featured: bool = False
    order: int = 0
    location: str = ""
    year: str = ""
    area: str = ""
    client: str = ""
    scope: str = ""
    description: str = ""
    progress: int = 0
    media: List[MediaItem] = Field(default_factory=list)
    cover_index: int = 0
    specs: List[SpecItem] = Field(default_factory=list)
    seo: SeoFields = Field(default_factory=SeoFields)
    brochure_path: Optional[str] = None
    comparisons: List[dict] = Field(default_factory=list)


async def unique_slug(base: str, exclude_id: str = None) -> str:
    slug = slugify(base)
    candidate, n = slug, 2
    while True:
        query = {"slug": candidate}
        if exclude_id:
            query["id"] = {"$ne": exclude_id}
        if not await db.projects.find_one(query):
            return candidate
        candidate = f"{slug}-{n}"
        n += 1


def serialize_project(doc: dict) -> dict:
    doc = dict(doc)
    doc.pop("_id", None)
    return doc


@router.get("/projects")
async def admin_list_projects(admin: dict = Depends(get_admin)):
    return await db.projects.find({}, {"_id": 0}).sort("order", 1).to_list(500)


@router.post("/projects", status_code=201)
async def create_project(body: ProjectIn, request: Request, admin: dict = Depends(get_admin)):
    now = datetime.now(timezone.utc).isoformat()
    doc = body.model_dump()
    doc["slug"] = await unique_slug(body.slug or body.name)
    doc.update({"id": str(uuid.uuid4()), "created_at": now, "updated_at": now})
    await db.projects.insert_one(dict(doc))
    await audit(admin["email"], "project_create", doc["name"], "success", request)
    return serialize_project(doc)


@router.put("/projects/{project_id}")
async def update_project(project_id: str, body: ProjectIn, request: Request, admin: dict = Depends(get_admin)):
    existing = await db.projects.find_one({"id": project_id})
    if not existing:
        raise HTTPException(404, "Project not found")
    doc = body.model_dump()
    doc["slug"] = await unique_slug(body.slug or body.name, exclude_id=project_id)
    doc["updated_at"] = datetime.now(timezone.utc).isoformat()
    await db.projects.update_one({"id": project_id}, {"$set": doc})
    await audit(admin["email"], "project_update", body.name, "success", request)
    updated = await db.projects.find_one({"id": project_id}, {"_id": 0})
    return updated


@router.delete("/projects/{project_id}")
async def delete_project(project_id: str, request: Request, admin: dict = Depends(get_admin)):
    existing = await db.projects.find_one({"id": project_id})
    if not existing:
        raise HTTPException(404, "Project not found")
    await db.projects.delete_one({"id": project_id})
    await audit(admin["email"], "project_delete", existing.get("name", project_id), "success", request)
    return {"ok": True}


class BrochureIn(BaseModel):
    title: str = Field(min_length=2, max_length=200)
    description: str = ""
    category: str = "Company"
    file_path: Optional[str] = None
    file_name: str = ""
    file_size: int = 0
    thumbnail: dict = Field(default_factory=dict)
    published: bool = True


@router.get("/brochures")
async def admin_list_brochures(admin: dict = Depends(get_admin)):
    return await db.brochures.find({}, {"_id": 0}).sort("publish_date", -1).to_list(200)


@router.post("/brochures", status_code=201)
async def create_brochure(body: BrochureIn, request: Request, admin: dict = Depends(get_admin)):
    now = datetime.now(timezone.utc).isoformat()
    doc = body.model_dump()
    doc.update({"id": str(uuid.uuid4()), "publish_date": now, "created_at": now})
    await db.brochures.insert_one(dict(doc))
    await audit(admin["email"], "brochure_create", body.title, "success", request)
    doc.pop("_id", None)
    return doc


@router.put("/brochures/{brochure_id}")
async def update_brochure(brochure_id: str, body: BrochureIn, request: Request, admin: dict = Depends(get_admin)):
    result = await db.brochures.update_one({"id": brochure_id}, {"$set": body.model_dump()})
    if result.matched_count == 0:
        raise HTTPException(404, "Brochure not found")
    await audit(admin["email"], "brochure_update", body.title, "success", request)
    return await db.brochures.find_one({"id": brochure_id}, {"_id": 0})


@router.delete("/brochures/{brochure_id}")
async def delete_brochure(brochure_id: str, request: Request, admin: dict = Depends(get_admin)):
    result = await db.brochures.delete_one({"id": brochure_id})
    if result.deleted_count == 0:
        raise HTTPException(404, "Brochure not found")
    await audit(admin["email"], "brochure_delete", brochure_id, "success", request)
    return {"ok": True}


@router.get("/settings")
async def get_settings(admin: dict = Depends(get_admin)):
    return await db.settings.find_one({"id": "site"}, {"_id": 0}) or {}


@router.put("/settings")
async def put_settings(request: Request, admin: dict = Depends(get_admin)):
    body = await request.json()
    body.pop("_id", None)
    body["id"] = "site"
    await db.settings.update_one({"id": "site"}, {"$set": body}, upsert=True)
    await audit(admin["email"], "settings_update", "site", "success", request)
    return body


@router.get("/inquiries")
async def list_inquiries(admin: dict = Depends(get_admin)):
    return await db.inquiries.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)


class InquiryStatusIn(BaseModel):
    status: str


@router.patch("/inquiries/{inquiry_id}")
async def update_inquiry(inquiry_id: str, body: InquiryStatusIn, request: Request, admin: dict = Depends(get_admin)):
    if body.status not in ("new", "contacted", "in-review", "closed"):
        raise HTTPException(400, "Invalid status")
    result = await db.inquiries.update_one({"id": inquiry_id}, {"$set": {"status": body.status}})
    if result.matched_count == 0:
        raise HTTPException(404, "Inquiry not found")
    await audit(admin["email"], "inquiry_status", inquiry_id, body.status, request)
    return {"ok": True}


@router.get("/audit")
async def list_audit(admin: dict = Depends(get_admin)):
    return await db.audit_logs.find({}, {"_id": 0}).sort("created_at", -1).to_list(300)
