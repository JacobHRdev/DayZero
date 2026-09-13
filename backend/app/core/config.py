from pathlib import Path
import os

BASE_DIR = Path(__file__).resolve().parents[2]
ROOT_DIR = BASE_DIR.parent
PROJECT_ROOT = Path(__file__).resolve().parents[3]

API_KEY = os.environ.get("NESSIE_API_KEY", "67a981411a2e5c849b2c79adb24bf6a8")
BASE_URL = os.environ.get("NESSIE_BASE_URL", "https://api.nessieisreal.com")
DATASET_PATH = PROJECT_ROOT / "dataset_burnout.csv"
BURNOUT_PATH = PROJECT_ROOT / "cuentas_burnout.json"
NORMAL_PATH = PROJECT_ROOT / "cuentas_normales.json"
FALLBACK_PATH = PROJECT_ROOT / "cuentas_normales.json"

CORS_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
]
