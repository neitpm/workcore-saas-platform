ALTER TABLE engineers
  ADD COLUMN IF NOT EXISTS password text,
  ADD COLUMN IF NOT EXISTS username text,
  ADD COLUMN IF NOT EXISTS company_role text,
  ADD COLUMN IF NOT EXISTS platform_role text;

ALTER TABLE company_users
  ADD COLUMN IF NOT EXISTS username text,
  ADD COLUMN IF NOT EXISTS company_role text;
