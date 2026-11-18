INSERT INTO modules (code, name, description)
VALUES
  ('attendance-leave', 'Chấm công & Nghỉ phép', 'Quy chế chấm công, ngày nghỉ phép và duyệt phép của nhân viên.'),
  ('internal-messaging', 'Nhắn tin Nội bộ', 'Trao đổi theo dự án, nhóm và thông báo nội bộ công ty.'),
  ('technical-equipment', 'Thiết bị & Kỹ thuật', 'Quản lý máy móc, thiết bị, trạm biến áp và hồ sơ kỹ thuật.'),
  ('legal-documents', 'Hồ sơ pháp lý & Chứng từ', 'Quản lý biên bản, hợp đồng, hồ sơ pháp lý và chứng từ.'),
  ('project-expenses', 'Chi phí & Quỹ dự án', 'Quản lý chi phí công trình, vốn phần ứng và quyết toán quỹ.'),
  ('field-journal', 'Nhật ký Hiện trường', 'Hành trình thực tế, chấm công GPS và ghi nhận sự cố.'),
  ('project-inventory', 'Kho Dự án', 'Quản lý xuất nhập tồn vật tư theo từng công trình.'),
  ('daily-labor', 'Lương công nhật', 'Quản lý chấm công và chi trả nhân công nhật tại công trình.'),
  ('material-planning', 'Kế hoạch Vật tư', 'Bảng bóc tách khối lượng và chủng loại vật tư.'),
  ('human-resources', 'Quản lý Nhân sự', 'Danh sách nhân viên, thông tin liên lạc và cấp bậc.'),
  ('project-management', 'Quản lý Dự án', 'Danh sách dự án, cấu hình thành viên và ngân sách.'),
  ('procurement', 'Mua sắm & Đặt hàng', 'Theo dõi đặt hàng, đánh giá, nhà cung cấp và thanh toán.'),
  ('project-progress', 'Quản lý Tiến độ', 'Bảng phân công công việc, WBS và tiến độ thi công.')
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;
