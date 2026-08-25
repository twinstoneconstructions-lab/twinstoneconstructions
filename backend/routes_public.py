import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Request, Response
from pydantic import BaseModel, EmailStr, Field
from config import db, SITE_URL
from security import audit, client_ip, rate_limit
from storage import get_object

router = APIRouter(prefix="/api", tags=["public"])


@router.get("/health")
async def health():
    return {"status": "ok", "service": "twinstone-constructions"}


@router.get("/projects")
async def list_projects(status: str = None, featured: bool = None):
    query = {"published": True}
    if status in ("ongoing", "completed"):
        query["status"] = status
    if featured:
        query["featured"] = True
    return await db.projects.find(query, {"_id": 0}).sort("order", 1).to_list(300)


@router.get("/projects/{slug}")
async def project_detail(slug: str):
    project = await db.projects.find_one({"slug": slug, "published": True}, {"_id": 0})
    if not project:
        raise HTTPException(404, "Project not found")
    return project


@router.get("/brochures")
async def list_brochures():
    return await db.brochures.find({"published": True}, {"_id": 0}).sort("publish_date", -1).to_list(100)


@router.get("/settings/public")
async def public_settings():
    settings = await db.settings.find_one({"id": "site"}, {"_id": 0})
    return settings or {}


class ContactIn(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    phone: str = Field(default="", max_length=40)
    project_type: str = Field(default="", max_length=60)
    location: str = Field(default="", max_length=160)
    budget: str = Field(default="", max_length=60)
    message: str = Field(min_length=10, max_length=4000)


@router.post("/contact", status_code=201)
async def submit_contact(body: ContactIn, request: Request):
    ip = client_ip(request)
    await rate_limit(f"contact:{ip}", 5, 3600)
    doc = {
        "id": str(uuid.uuid4()),
        **body.model_dump(),
        "status": "new",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.inquiries.insert_one(dict(doc))
    await audit("public", "contact_submit", body.email, "success", request)
    return {"ok": True, "id": doc["id"]}


@router.api_route("/files/{path:path}", methods=["GET", "HEAD"])
async def serve_file(request: Request, path: str, w: int = None, fmt: str = None):
    if ".." in path or path.startswith("/"):
        raise HTTPException(404, "File not found")
    record = await db.media.find_one({"storage_path": path, "is_deleted": False}, {"_id": 0})
    if not record and not (w or fmt):
        record = await db.brochures.find_one({"file_path": path}, {"_id": 0})
        if record:
            record.setdefault("content_type", "application/pdf")
    if not record:
        raise HTTPException(404, "File not found")
    target, ctype = path, record.get("content_type")
    if w and fmt and fmt in ("webp", "avif"):
        match = next((d for d in (record.get("derivatives") or []) if d["width"] == w and d["format"] == fmt), None)
        if match:
            target, ctype = match["storage_path"], f"image/{fmt}"
    if request.method == "HEAD":
        headers = {
            "Cache-Control": "public, max-age=86400",
            "Accept-Ranges": "bytes",
        }
        if not (w or fmt) and record.get("size"):
            headers["Content-Length"] = str(record["size"])
        return Response(status_code=200, media_type=ctype or "application/octet-stream", headers=headers)
    try:
        data, stored_type = get_object(target)
    except Exception:
        raise HTTPException(404, "File not found")
    media_type = ctype or stored_type
    headers = {"Cache-Control": "public, max-age=86400", "Accept-Ranges": "bytes"}
    range_header = request.headers.get("range", "")
    if range_header.startswith("bytes="):
        try:
            start_s, _, end_s = range_header[6:].split(",")[0].partition("-")
            start = int(start_s) if start_s else 0
            end = min(int(end_s) if end_s else len(data) - 1, len(data) - 1)
            chunk = data[start : end + 1]
            headers["Content-Range"] = f"bytes {start}-{end}/{len(data)}"
            headers["Content-Length"] = str(len(chunk))
            return Response(content=chunk, status_code=206, media_type=media_type, headers=headers)
        except ValueError:
            pass
    return Response(content=data, media_type=media_type, headers=headers)


@router.get("/sitemap.xml")
async def sitemap():
    base = SITE_URL or "https://twinstone-preview.preview.emergentagent.com"
    static_pages = ["", "about", "services", "projects/ongoing", "projects/completed", "process", "download", "contact"]
    projects = await db.projects.find({"published": True}, {"_id": 0, "slug": 1, "updated_at": 1}).to_list(500)
    urls = [f"  <url><loc>{base}/{p}</loc><changefreq>weekly</changefreq></url>" for p in static_pages]
    for p in projects:
        lastmod = (p.get("updated_at") or "")[:10]
        urls.append(
            f"  <url><loc>{base}/projects/{p['slug']}</loc>"
            + (f"<lastmod>{lastmod}</lastmod>" if lastmod else "")
            + "<changefreq>monthly</changefreq></url>"
        )
    xml = (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        + "\n".join(urls)
        + "\n</urlset>"
    )
    return Response(content=xml, media_type="application/xml")


@router.get("/robots.txt")
async def robots():
    base = SITE_URL or "https://twinstone-preview.preview.emergentagent.com"
    lines = [
        "User-agent: *",
        "Allow: /",
        "Disallow: /admin",
        "Disallow: /api/",
        "",
        f"Sitemap: {base}/api/sitemap.xml",
    ]
    return Response(content="\n".join(lines), media_type="text/plain")
