-- PharmaLens DB Schema (PostgreSQL)
-- Notes:
-- 1) Uses UUID primary keys
-- 2) Includes created_at / updated_at timestamps
-- 3) Normalized: medicines (brand + generic), price observations, pharmacy optional
-- 4) Enables pg_trgm for fast search on brand/generic names

BEGIN;

-- Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";  -- gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "citext";    -- case-insensitive email
CREATE EXTENSION IF NOT EXISTS "pg_trgm";   -- fuzzy search

-- Updated-at trigger
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- USERS
CREATE TABLE IF NOT EXISTS users (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name    TEXT NOT NULL,
  email        CITEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  is_active    BOOLEAN NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- MEDICINES
-- One row per "product name" (brand OR generic product name) with composition stored separately
-- If you want stricter normalization later, move salt composition to a separate table.
CREATE TABLE IF NOT EXISTS medicines (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Examples: "Dolo 650", "Paracetamol 650 mg Tablet"
  name            TEXT NOT NULL,
  -- brand_name is optional: for generic entries keep it NULL
  brand_name      TEXT,
  -- generic_name is optional: for brand entries keep it NULL (or store both if you want)
  generic_name    TEXT,
  dosage_form     TEXT,      -- tablet/capsule/syrup
  strength        TEXT,      -- "650 mg", "10 mg/5 ml"
  manufacturer    TEXT,
  -- For MVP: store salts as text, e.g. "Paracetamol" or "Amoxicillin + Clavulanic Acid"
  salt_composition TEXT,
  is_generic      BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_medicine_name_not_empty CHECK (length(trim(name)) > 0)
);

CREATE TRIGGER trg_medicines_updated_at
BEFORE UPDATE ON medicines
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Helpful indexes for search
CREATE INDEX IF NOT EXISTS idx_medicines_name_trgm
ON medicines USING GIN (name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_medicines_brand_trgm
ON medicines USING GIN (brand_name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_medicines_generic_trgm
ON medicines USING GIN (generic_name gin_trgm_ops);

-- GENERIC ALTERNATIVES
-- Maps a branded medicine -> one or more generic medicine(s)
CREATE TABLE IF NOT EXISTS generic_alternatives (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_medicine_id   UUID NOT NULL REFERENCES medicines(id) ON DELETE CASCADE,
  generic_medicine_id UUID NOT NULL REFERENCES medicines(id) ON DELETE CASCADE,
  -- optional: confidence score if you later add matching/ML
  match_confidence    NUMERIC(5,2),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_not_same_medicine CHECK (brand_medicine_id <> generic_medicine_id),
  CONSTRAINT uq_brand_generic UNIQUE (brand_medicine_id, generic_medicine_id)
);

CREATE TRIGGER trg_generic_alternatives_updated_at
BEFORE UPDATE ON generic_alternatives
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- PHARMACIES (optional for MVP, but included)
CREATE TABLE IF NOT EXISTS pharmacies (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  address     TEXT,
  city        TEXT,
  state       TEXT,
  pincode     TEXT,
  phone       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_pharmacies_updated_at
BEFORE UPDATE ON pharmacies
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- PRICES
-- Stores observed prices of a medicine (optionally tied to a pharmacy)
CREATE TABLE IF NOT EXISTS prices (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  medicine_id   UUID NOT NULL REFERENCES medicines(id) ON DELETE CASCADE,
  pharmacy_id   UUID REFERENCES pharmacies(id) ON DELETE SET NULL,
  -- store MRP and/or selling price
  mrp           NUMERIC(10,2),
  selling_price NUMERIC(10,2) NOT NULL,
  currency      CHAR(3) NOT NULL DEFAULT 'INR',
  -- optional metadata (source)
  source        TEXT, -- e.g. "manual", "1mg", "pharmacy_upload"
  observed_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_price_positive CHECK (selling_price >= 0),
  CONSTRAINT chk_mrp_positive CHECK (mrp IS NULL OR mrp >= 0)
);

CREATE TRIGGER trg_prices_updated_at
BEFORE UPDATE ON prices
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX IF NOT EXISTS idx_prices_medicine_observed_at
ON prices (medicine_id, observed_at DESC);

COMMIT;