import os
from pathlib import Path
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

MONGO_URL = os.environ["MONGO_URL"]
DB_NAME = os.environ["DB_NAME"]
JWT_SECRET = os.environ["JWT_SECRET"]
ADMIN_EMAIL = os.environ.get("ADMIN_EMAIL", "admin@twinstone.com").lower().strip()
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "")
SITE_URL = os.environ.get("SITE_URL", "").rstrip("/")

client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]
