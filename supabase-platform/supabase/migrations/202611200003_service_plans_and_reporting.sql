-- Chuẩn hóa gói dịch vụ và module SaaS ở Platform DB.
-- Product DB không được tham chiếu từ các bảng này.
CREATE TABLE IF NOT EXISTS service_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  max_users integer NOT NULL DEFAULT 20,
  max_storage_gb integer NOT NULL DEFAULT 10,
  max_projects integer,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS service_plan_modules (
  plan_id uuid NOT NULL REFERENCES service_plans(id) ON DELETE CASCADE,
  module_id uuid NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  is_enabled boolean NOT NULL DEFAULT true,
  PRIMARY KEY (plan_id, module_id)
);

INSERT INTO service_plans (code, name, description, max_users, max_storage_gb, max_projects)
VALUES
  ('trial', 'Dùng thử', 'Gói dùng thử giới hạn chức năng.', 5, 2, 3),
  ('standard', 'Tiêu chuẩn', 'Các module quản lý công việc cơ bản.', 20, 10, 20),
  ('professional', 'Chuyên nghiệp', 'Mở rộng vật tư, kho, hồ sơ và báo cáo.', 50, 50, 100),
  ('enterprise', 'Doanh nghiệp', 'Đầy đủ module và hạn mức theo hợp đồng.', 999999, 100, NULL)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  max_users = EXCLUDED.max_users,
  max_storage_gb = EXCLUDED.max_storage_gb,
  max_projects = EXCLUDED.max_projects,
  updated_at = now();

INSERT INTO modules (code, name, description)
VALUES ('reporting', 'Báo cáo & Phân tích', 'Báo cáo tiến độ, chi phí, vật tư, nhân sự và xuất Excel/PDF.')
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;

-- Gán module mặc định theo gói; Super Admin vẫn có thể override ở company_modules.
INSERT INTO service_plan_modules (plan_id, module_id)
SELECT p.id, m.id
FROM service_plans p
JOIN modules m ON (
  p.code = 'enterprise'
  OR (p.code = 'professional' AND m.code IN ('project-management','project-progress','field-journal','material-planning','project-inventory','legal-documents','project-expenses','reporting','attendance-leave','human-resources'))
  OR (p.code = 'standard' AND m.code IN ('project-management','project-progress','legal-documents','attendance-leave','human-resources'))
  OR (p.code = 'trial' AND m.code IN ('project-management','project-progress'))
)
ON CONFLICT DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_service_plan_modules_module ON service_plan_modules(module_id);
