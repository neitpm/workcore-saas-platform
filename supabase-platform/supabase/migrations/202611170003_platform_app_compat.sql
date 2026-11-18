ALTER TABLE companies
  ADD COLUMN IF NOT EXISTS slogan text,
  ADD COLUMN IF NOT EXISTS logo_url text,
  ADD COLUMN IF NOT EXISTS admin_phone text,
  ADD COLUMN IF NOT EXISTS notes text;

ALTER TABLE company_modules
  ADD COLUMN IF NOT EXISTS start_date date,
  ADD COLUMN IF NOT EXISTS expiry_date date;

CREATE TABLE IF NOT EXISTS engineers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  username text NOT NULL,
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  title text,
  role text,
  company_role text,
  platform_role text,
  account_status text NOT NULL DEFAULT 'ACTIVE',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (company_id, email)
);

CREATE TABLE IF NOT EXISTS company_branding (
  company_id uuid PRIMARY KEY REFERENCES companies(id) ON DELETE CASCADE,
  company_name text NOT NULL,
  company_slogan text,
  company_logo text,
  hotline text,
  email text,
  address text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
