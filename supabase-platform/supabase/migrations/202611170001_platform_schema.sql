CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  status text NOT NULL DEFAULT 'active',
  plan text NOT NULL DEFAULT 'standard',
  admin_email text NOT NULL,
  max_users integer NOT NULL DEFAULT 20,
  max_storage_gb integer NOT NULL DEFAULT 10,
  start_date date NOT NULL DEFAULT CURRENT_DATE,
  expiry_date date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS company_modules (
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  module_id uuid NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  is_enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (company_id, module_id)
);

CREATE TABLE IF NOT EXISTS company_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  auth_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  email text NOT NULL,
  role text NOT NULL DEFAULT 'company_admin',
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (company_id, email)
);

CREATE TABLE IF NOT EXISTS company_databases (
  company_id uuid PRIMARY KEY REFERENCES companies(id) ON DELETE CASCADE,
  database_name text NOT NULL UNIQUE,
  database_host text NOT NULL DEFAULT '127.0.0.1',
  database_port integer NOT NULL,
  storage_limit_gb integer NOT NULL DEFAULT 10,
  status text NOT NULL DEFAULT 'provisioning',
  created_at timestamptz NOT NULL DEFAULT now()
);
