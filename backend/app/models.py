from sqlalchemy import Column, String, Boolean, Numeric
from sqlalchemy.dialects.postgresql import UUID
import uuid

from app.database import Base


class Medicine(Base):
    __tablename__ = "medicines"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    brand_name = Column(String)
    generic_name = Column(String)
    dosage_form = Column(String)
    strength = Column(String)
    manufacturer = Column(String)
    salt_composition = Column(String)
    is_generic = Column(Boolean, default=False)
    price = Column(Numeric(10, 2), nullable=True)