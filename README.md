# WORKCORE SaaS Platform 🌐

**WORKCORE SaaS Platform** là bảng điều khiển quản trị trung tâm độc lập (Central SaaS Administration Console) dành riêng cho Quản trị viên nền tảng (**Platform Super Admin**) để phát hành và quản lý các công ty khách hàng thuê phần mềm.

## 🚀 Chức năng chính:
- **Quản lý đa công ty (Tenants):** Tạo mới, chỉnh sửa thông tin doanh nghiệp, mã công ty (`code`), mã số thuế, slogan, số lượng user và dung lượng lưu trữ tối đa.
- **Tự động cấp tài khoản Company Admin:** Khi tạo công ty mới, hệ thống tự động sinh tài khoản Giám đốc / Admin riêng cho công ty đó trong cơ sở dữ liệu.
- **Phân bổ gói thuê bao:** Cấu hình 4 gói cước tiêu chuẩn (`trial`, `standard`, `professional`, `enterprise`) kèm ngày bắt đầu và ngày hết hạn.
- **Bật / Tắt Module theo hợp đồng:** Cấp phép linh hoạt từng module nghiệp vụ trong số 13 module cốt lõi cho từng khách hàng.
- **Cô lập bảo mật:** Kết nối an toàn vào Supabase Backend qua bảng `companies`, `modules`, `company_modules`.

## 🛠️ Cài đặt & Chạy ứng dụng:
```bash
# Cài đặt dependencies
npm install

# Khởi chạy chế độ phát triển
npm run dev

# Build kiểm tra production
npm run build
```
