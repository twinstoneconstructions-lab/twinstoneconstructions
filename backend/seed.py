import uuid
import logging
from datetime import datetime, timezone
from config import db, ADMIN_EMAIL, ADMIN_PASSWORD
from security import hash_password
from storage import put_object

logger = logging.getLogger("twinstone.seed")

IMG = {
    "exterior": "https://images.unsplash.com/photo-1721815693498-cc28507c0ba2?crop=entropy&cs=srgb&fm=jpg&q=85",
    "villa": "https://images.pexels.com/photos/23947751/pexels-photo-23947751.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "structure": "https://images.unsplash.com/photo-1622396481322-3b83d186701b?crop=entropy&cs=srgb&fm=jpg&q=85",
    "courtyard": "https://images.unsplash.com/photo-1522061405958-6332b642520d?crop=entropy&cs=srgb&fm=jpg&q=85",
    "concrete": "https://images.unsplash.com/photo-1453586857165-eb78d44460ca?crop=entropy&cs=srgb&fm=jpg&q=85",
    "render": "https://images.pexels.com/photos/13203188/pexels-photo-13203188.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "interior": "https://images.unsplash.com/photo-1776362355123-ca966d36e29c?crop=entropy&cs=srgb&fm=jpg&q=85",
    "penthouse": "https://images.unsplash.com/photo-1760611655987-d348d6d28174?crop=entropy&cs=srgb&fm=jpg&q=85",
    "dining": "https://images.pexels.com/photos/27562206/pexels-photo-27562206.png?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "studio": "https://images.pexels.com/photos/9618125/pexels-photo-9618125.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
}


def media(url, kind="image", caption="", alt=""):
    return {"id": str(uuid.uuid4()), "kind": kind, "storage_path": None, "external_url": url, "caption": caption, "alt": alt}


def build_pdf(title: str, lines: list) -> bytes:
    def esc(s):
        return s.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")

    content = ["BT", "/F1 24 Tf", "72 740 Td", f"({esc(title)}) Tj", "/F1 11 Tf"]
    for ln in lines:
        content.append("0 -30 Td")
        content.append(f"({esc(ln)}) Tj")
    content.append("ET")
    stream = "\n".join(content).encode("latin-1", "replace")
    objects = [
        b"<< /Type /Catalog /Pages 2 0 R >>",
        b"<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
        b"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
        b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
        b"<< /Length %d >>\nstream\n" % len(stream) + stream + b"\nendstream",
    ]
    out = b"%PDF-1.4\n"
    offsets = []
    for i, obj in enumerate(objects, start=1):
        offsets.append(len(out))
        out += b"%d 0 obj\n" % i + obj + b"\nendobj\n"
    xref = len(out)
    out += b"xref\n0 %d\n" % (len(objects) + 1)
    out += b"0000000000 65535 f \n"
    for off in offsets:
        out += b"%010d 00000 n \n" % off
    out += b"trailer\n<< /Size %d /Root 1 0 R >>\nstartxref\n%d\n%%%%EOF" % (len(objects) + 1, xref)
    return out


DEFAULT_SETTINGS = {
    "id": "site",
    "company": {
        "name": "TwinStone Constructions",
        "phone": "+1 (555) 013-2200",
        "email": "build@twinstoneconstructions.com",
        "whatsapp": "",
        "address": "Stonegate Business District",
        "hours": "Mon - Sat, 8:00 - 18:00",
        "socials": {"instagram": "", "linkedin": "", "facebook": ""},
    },
    "branding": {"logo_dark": None, "logo_light": None, "favicon": None, "og_image": ""},
    "hero": {
        "overline": "TwinStone Constructions",
        "line1": "Building With Purpose.",
        "line2": "Built To Last.",
        "subtitle": "Professional construction solutions designed around quality, precision, engineering excellence and long-term value.",
    },
    "seo": {
        "default_title": "TwinStone Constructions — Building With Purpose. Built To Last.",
        "default_description": "Premium residential, commercial and renovation construction delivered with engineering precision, transparency and long-term value.",
        "og_image": "",
    },
    "footer": {
        "description": "A premium construction practice delivering residential, commercial and renovation projects with precision, transparency and long-term value."
    },
}

SAMPLE_PROJECTS = [
    {
        "name": "The Meridian Residence", "slug": "the-meridian-residence",
        "category": "Residential", "status": "completed", "published": True, "featured": True, "order": 1,
        "location": "Stonegate Hills", "year": "2025", "area": "12,400 sq ft", "client": "",
        "scope": "Full structural build, interior finishing and landscape integration",
        "description": "A private residence conceived as a study in stone, light and proportion. TwinStone delivered the complete build — from structural frame to hand-finished interiors — with material palettes selected for longevity and quiet luxury.",
        "progress": 100,
        "media": [
            media(IMG["villa"], caption="Principal facade at dusk", alt="Luxury residence facade by TwinStone Constructions"),
            media(IMG["interior"], caption="Double-height living space", alt="Finished living interior with natural stone"),
            media(IMG["dining"], caption="Dining gallery", alt="Marble dining interior"),
            media(IMG["courtyard"], caption="Central courtyard", alt="Minimalist architectural courtyard"),
        ],
        "cover_index": 0,
        "specs": [
            {"label": "Structure", "value": "Reinforced concrete frame"},
            {"label": "Facade", "value": "Natural stone cladding"},
            {"label": "Timeline", "value": "22 months"},
            {"label": "Status", "value": "Handed over"},
        ],
    },
    {
        "name": "Atlas Corporate Tower", "slug": "atlas-corporate-tower",
        "category": "Commercial", "status": "completed", "published": True, "featured": True, "order": 2,
        "location": "Central Business District", "year": "2024", "area": "86,000 sq ft", "client": "",
        "scope": "Core and shell construction, facade engineering, fit-out management",
        "description": "A commercial tower engineered around a high-performance concrete core and a precision-installed unitised facade. Delivered on a compressed programme with full quality documentation at every milestone.",
        "progress": 100,
        "media": [
            media(IMG["structure"], caption="Structural frame, level 18", alt="High-rise structural frame"),
            media(IMG["concrete"], caption="Facade curvature detail", alt="Curved modern concrete facade"),
            media(IMG["exterior"], caption="Completed elevation", alt="Completed commercial tower exterior"),
            media(IMG["penthouse"], caption="Executive level lounge", alt="Penthouse lounge interior view"),
        ],
        "cover_index": 0,
        "specs": [
            {"label": "Structure", "value": "High-performance concrete core"},
            {"label": "Facade", "value": "Unitised curtain wall"},
            {"label": "Timeline", "value": "30 months"},
            {"label": "Status", "value": "Handed over"},
        ],
    },
    {
        "name": "Stonebridge Pavilion", "slug": "stonebridge-pavilion",
        "category": "Renovation", "status": "completed", "published": True, "featured": False, "order": 3,
        "location": "Old Mill Quarter", "year": "2024", "area": "6,800 sq ft", "client": "",
        "scope": "Heritage-sensitive renovation, structural reinforcement, interior renewal",
        "description": "A careful renovation balancing preservation with contemporary performance. Structural reinforcement was threaded through the existing fabric while interiors were renewed around light, air and craft.",
        "progress": 100,
        "media": [
            media(IMG["courtyard"], caption="Restored courtyard", alt="Renovated courtyard space"),
            media(IMG["interior"], caption="Renewed interior volume", alt="Renovated interior space"),
            media(IMG["dining"], caption="Material palette detail", alt="Interior material detail"),
        ],
        "cover_index": 0,
        "specs": [
            {"label": "Scope", "value": "Structural + interior renewal"},
            {"label": "Approach", "value": "Heritage-sensitive"},
            {"label": "Timeline", "value": "14 months"},
            {"label": "Status", "value": "Handed over"},
        ],
    },
    {
        "name": "The Copperhouse", "slug": "the-copperhouse",
        "category": "Residential", "status": "ongoing", "published": True, "featured": True, "order": 4,
        "location": "Ridgeline Enclave", "year": "2026", "area": "9,200 sq ft", "client": "",
        "scope": "Design-build residence with copper-accented facade system",
        "description": "Currently rising above the Ridgeline Enclave, The Copperhouse pairs a monolithic stone base with a warm metal crown. Structural works are complete; facade installation and interior fit-out are underway.",
        "progress": 68,
        "media": [
            media(IMG["render"], caption="Architectural visualisation", alt="3D architectural rendering of residence"),
            media(IMG["studio"], caption="Design coordination", alt="Architect working on 3D model"),
            media(IMG["exterior"], caption="Site context", alt="Construction site context"),
        ],
        "cover_index": 0,
        "specs": [
            {"label": "Stage", "value": "Facade + fit-out"},
            {"label": "Structure", "value": "Complete"},
            {"label": "Target", "value": "2026 handover"},
            {"label": "Status", "value": "Under construction"},
        ],
    },
    {
        "name": "Northgate Exchange", "slug": "northgate-exchange",
        "category": "Commercial", "status": "ongoing", "published": True, "featured": False, "order": 5,
        "location": "Northgate District", "year": "2027", "area": "120,000 sq ft", "client": "",
        "scope": "Mixed-use commercial structure, civil works and core construction",
        "description": "A mixed-use commercial development in its structural phase. TwinStone is delivering civil works, core construction and envelope coordination with staged handover planning already in place.",
        "progress": 35,
        "media": [
            media(IMG["concrete"], caption="Core works in progress", alt="Concrete structure under construction"),
            media(IMG["structure"], caption="Frame assembly", alt="Structural frame assembly"),
            media(IMG["studio"], caption="BIM coordination", alt="Digital construction coordination"),
        ],
        "cover_index": 0,
        "specs": [
            {"label": "Stage", "value": "Structural works"},
            {"label": "Civil", "value": "Complete"},
            {"label": "Target", "value": "2027 handover"},
            {"label": "Status", "value": "Under construction"},
        ],
    },
    {
        "name": "Villa Serena", "slug": "villa-serena",
        "category": "Renovation", "status": "ongoing", "published": True, "featured": False, "order": 6,
        "location": "Lakeside Terrace", "year": "2026", "area": "7,500 sq ft", "client": "",
        "scope": "Full villa renovation with structural opening and interior reconstruction",
        "description": "A lakeside villa in the final stages of transformation. Structural openings now frame the water; interior reconstruction and finishing are progressing toward a 2026 handover.",
        "progress": 82,
        "media": [
            media(IMG["interior"], caption="Reconstructed living level", alt="Renovated villa living space"),
            media(IMG["dining"], caption="Dining space finishes", alt="Finished dining interior"),
            media(IMG["penthouse"], caption="Upper level outlook", alt="Upper level interior view"),
        ],
        "cover_index": 0,
        "specs": [
            {"label": "Stage", "value": "Finishing works"},
            {"label": "Structure", "value": "Complete"},
            {"label": "Target", "value": "2026 handover"},
            {"label": "Status", "value": "Under construction"},
        ],
    },
]


async def seed_admin():
    if not ADMIN_PASSWORD:
        logger.warning("ADMIN_PASSWORD not set; admin seeding skipped")
        return
    existing = await db.admin_users.find_one({"email": ADMIN_EMAIL})
    if existing is None:
        await db.admin_users.insert_one(
            {
                "id": str(uuid.uuid4()),
                "email": ADMIN_EMAIL,
                "name": "Administrator",
                "password_hash": hash_password(ADMIN_PASSWORD),
                "role": "admin",
                "mfa_enabled": False,
                "created_at": datetime.now(timezone.utc).isoformat(),
            }
        )
        logger.info("Admin account seeded")


async def seed_settings():
    existing = await db.settings.find_one({"id": "site"})
    if not existing:
        await db.settings.insert_one(dict(DEFAULT_SETTINGS))
        logger.info("Default settings seeded")


async def seed_projects():
    if await db.projects.count_documents({}) > 0:
        return
    now = datetime.now(timezone.utc).isoformat()
    for p in SAMPLE_PROJECTS:
        doc = dict(p)
        doc.update(
            {
                "id": str(uuid.uuid4()),
                "seo": {"title": "", "description": "", "og_image": ""},
                "brochure_path": None,
                "created_at": now,
                "updated_at": now,
            }
        )
        await db.projects.insert_one(doc)
    logger.info("Sample projects seeded")


async def seed_brochures():
    if await db.brochures.count_documents({}) > 0:
        return
    now = datetime.now(timezone.utc).isoformat()
    seeds = [
        (
            "TwinStone Company Profile",
            "Company",
            "An overview of TwinStone Constructions — our approach, services and delivery standards.",
            IMG["exterior"],
        ),
        (
            "The Meridian Residence — Project Brochure",
            "Project",
            "A detailed walk through The Meridian Residence: scope, materials and specifications.",
            IMG["villa"],
        ),
    ]
    for title, category, desc, thumb in seeds:
        file_path, file_size = None, 0
        try:
            pdf = build_pdf(title, [desc, "", "TwinStone Constructions", "Building With Purpose. Built To Last."])
            path = f"twinstone/brochures/{uuid.uuid4()}.pdf"
            result = put_object(path, pdf, "application/pdf")
            file_path, file_size = result["path"], result.get("size", len(pdf))
        except Exception as e:
            logger.error(f"Brochure seed upload failed: {e}")
        await db.brochures.insert_one(
            {
                "id": str(uuid.uuid4()),
                "title": title,
                "description": desc,
                "category": category,
                "file_path": file_path,
                "file_name": f"{title}.pdf",
                "file_size": file_size,
                "thumbnail": {"external_url": thumb, "storage_path": None},
                "published": True,
                "publish_date": now,
                "created_at": now,
            }
        )
    logger.info("Brochures seeded")


async def seed_all():
    await seed_admin()
    await seed_settings()
    await seed_projects()
    await seed_brochures()
