import csv
from pathlib import Path
import sys

# --- Make backend/app importable when running from scripts/ ---
PROJECT_ROOT = Path(__file__).resolve().parents[1]
BACKEND_DIR = PROJECT_ROOT / "backend"
sys.path.insert(0, str(BACKEND_DIR))

from app.database import SessionLocal  # noqa: E402
from app.models import Medicine  # noqa: E402

CSV_PATH = Path(__file__).parent / "sample_medicines.csv"


def seed():
    if not CSV_PATH.exists():
        raise FileNotFoundError(f"CSV not found: {CSV_PATH}")

    db = SessionLocal()
    try:
        with CSV_PATH.open("r", encoding="utf-8", newline="") as f:
            reader = csv.DictReader(f)

            required_cols = {
                "name",
                "brand_name",
                "generic_name",
                "dosage_form",
                "strength",
                "manufacturer",
                "salt_composition",
                "is_generic",
            }
            missing = required_cols - set(reader.fieldnames or [])
            if missing:
                raise ValueError(
                    f"CSV header missing columns: {missing}. "
                    f"Found columns: {reader.fieldnames}"
                )

            count = 0
            for row in reader:
                # Skip blank lines
                if not row.get("name"):
                    continue

                med = Medicine(
                    name=row["name"].strip(),
                    brand_name=(row.get("brand_name") or "").strip() or None,
                    generic_name=(row.get("generic_name") or "").strip() or None,
                    dosage_form=(row.get("dosage_form") or "").strip() or None,
                    strength=(row.get("strength") or "").strip() or None,
                    manufacturer=(row.get("manufacturer") or "").strip() or None,
                    salt_composition=(row.get("salt_composition") or "").strip() or None,
                    is_generic=str(row.get("is_generic", "false")).strip().lower()
                    in {"true", "1", "yes", "y"},
                )
                db.add(med)
                count += 1

            db.commit()
            print(f"✅ Seeded {count} medicines into the database.")
    finally:
        db.close()


if __name__ == "__main__":
    seed()