ALTER TABLE company_modules
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
