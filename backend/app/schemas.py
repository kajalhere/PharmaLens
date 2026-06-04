from pydantic import BaseModel
from typing import Optional
from uuid import UUID


class MedicineCreate(BaseModel):
    name: str
    brand_name: Optional[str] = None
    generic_name: Optional[str] = None
    dosage_form: Optional[str] = None
    strength: Optional[str] = None
    manufacturer: Optional[str] = None
    salt_composition: Optional[str] = None
    is_generic: bool = False
    price: Optional[float] = None


class MedicineOut(MedicineCreate):
    id: UUID

    class Config:
        from_attributes = True  # pydantic v2