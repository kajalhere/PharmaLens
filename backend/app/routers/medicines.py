from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, func, desc

from app.database import get_db
from app.models import Medicine
from app.schemas import MedicineCreate, MedicineOut

router = APIRouter(prefix="/medicines", tags=["Medicines"])


@router.post("", response_model=MedicineOut)
def create_medicine(payload: MedicineCreate, db: Session = Depends(get_db)):
    med = Medicine(**payload.model_dump())
    db.add(med)
    db.commit()
    db.refresh(med)
    return med

@router.get("/search", response_model=list[MedicineOut])
def search_medicines(
    q: str = Query(..., min_length=1, description="Search text"),
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
):
    pattern = f"%{q}%"

    results = (
        db.query(Medicine)
        .filter(
            or_(
                Medicine.name.ilike(pattern),
                Medicine.brand_name.ilike(pattern),
                Medicine.generic_name.ilike(pattern),
                Medicine.salt_composition.ilike(pattern),
                func.similarity(Medicine.name, q) > 0.2,
                func.similarity(Medicine.brand_name, q) > 0.2,
                func.similarity(Medicine.generic_name, q) > 0.2,
                func.similarity(Medicine.salt_composition, q) > 0.2,
            )
        )
        .order_by(
            desc(func.similarity(Medicine.name, q)),
            desc(func.similarity(Medicine.brand_name, q)),
        )
        .limit(limit)
        .all()
    )

    return results


@router.get("/{medicine_id}/alternatives")
def get_alternatives(medicine_id: str, limit: int = 10, db: Session = Depends(get_db)):
    # Find the medicine
    med = db.query(Medicine).filter(Medicine.id == medicine_id).first()

    if not med:
        return {"error": "Medicine not found"}

    # Find medicines with the same salt composition (excluding itself)
    alternatives = (
        db.query(Medicine)
        .filter(Medicine.id != med.id)
        .filter(func.lower(Medicine.salt_composition) == func.lower(med.salt_composition))
        .limit(limit)
        .all()
    )

    return {
        "medicine": med.name,
        "salt_composition": med.salt_composition,
        "alternatives": alternatives
    }

@router.get("/{medicine_id}/compare")
def compare_medicine(medicine_id: str, db: Session = Depends(get_db)):
    med = db.query(Medicine).filter(Medicine.id == medicine_id).first()

    if not med:
        return {"error": "Medicine not found"}

    alternatives = (
        db.query(Medicine)
        .filter(Medicine.id != med.id)
        .filter(func.lower(Medicine.salt_composition) == func.lower(med.salt_composition))
        .filter(Medicine.strength == med.strength)
        .filter(Medicine.dosage_form == med.dosage_form)
        .all()
    )

    cheapest = None
    if alternatives:
        priced = [a for a in alternatives if a.price is not None]
        if priced:
            cheapest = min(priced, key=lambda x: x.price)

    savings = None
    savings_percent = None

    # Only calculate savings if alternative is actually cheaper
    if (
        med.price is not None
        and cheapest is not None
        and cheapest.price is not None
        and float(cheapest.price) < float(med.price)
    ):
        savings = float(med.price) - float(cheapest.price)
        savings_percent = round((savings / float(med.price)) * 100, 2)
    else:
        cheapest = None

    return {
        "brand_medicine": {
            "name": med.name,
            "price": float(med.price) if med.price is not None else None,
            "salt": med.salt_composition,
            "strength": med.strength
        },
        "cheapest_alternative": {
            "name": cheapest.name,
            "price": float(cheapest.price)
        } if cheapest else None,
        "savings": savings,
        "savings_percent": savings_percent
    }