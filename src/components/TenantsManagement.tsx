import React, { useState } from 'react';
import { 
  Building2, 
  Plus, 
  Search, 
  SlidersHorizontal, 
  Users, 
  HardDrive, 
  Calendar, 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  Edit, 
  Trash2,
  KeyRound,
  ExternalLink
} from 'lucide-react';
import { usePlatformStore } from '../store/platformStore';
import { CompanyTenant } from '../types';

export const TenantsManagement: React.FC = () => {
  const { companies, modules, companyModules, createCompany, updateCompany, deleteCompany, toggleCompanyModule } = usePlatformStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [planFilter, setPlanFilter] = useState<string>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingComp, setEditingComp] = useState<CompanyTenant | null>(null);
  const [activeModuleModalComp, setActiveModuleModalComp] = useState<CompanyTenant | null>(null);

  // Form State
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [taxCode, setTaxCode] = useState('');
  const [slogan, setSlogan] = useState('');
  const [plan, setPlan] = useState<CompanyTenant['plan']>('standard');
  const [status, setStatus] = useState<CompanyTenant['status']>('active');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPhone, setAdminPhone] = useState('');
  const [adminPassword, setAdminPassword] = useState('Password@123');
  const [maxUsers, setMaxUsers] = useState(25);
  const [maxStorageGb, setMaxStorageGb] = useState(20);
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [expiryDate, setExpiryDate] = useState('2027-12-31');

  const openCreateModal = () => {
    setEditingComp(null);
    setCode('');
    setName('');
    setTaxCode('');
    setSlogan('');
    setPlan('standard');
    setStatus('active');
    setAdminEmail('');
    setAdminPhone('');
    setAdminPassword('Password@123');
    setMaxUsers(25);
    setMaxStorageGb(20);
    setStartDate(new Date().toISOString().slice(0, 10));
    setExpiryDate('2027-12-31');
    setIsModalOpen(true);
  };

  const openEditModal = (comp: CompanyTenant) => {
    setEditingComp(comp);
    setCode(comp.code);
    setName(comp.name);
    setTaxCode(comp.taxCode || '');
    setSlogan(comp.slogan || '');
    setPlan(comp.plan);
    setStatus(comp.status);
    setAdminEmail(comp.adminEmail);
    setAdminPhone(comp.adminPhone || '');
    setMaxUsers(comp.maxUsers);
    setMaxStorageGb(comp.maxStorageGb);
    setStartDate(comp.startDate);
    setExpiryDate(comp.expiryDate || '');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !name.trim() || !adminEmail.trim()) {
      alert('Vui lòng điền đủ Mã công ty, Tên công ty và Email quản trị!');
      return;
    }

    if (editingComp) {
      const res = await updateCompany(editingComp.id, {
        code,
        name,
        taxCode,
        slogan,
        plan,
        status,
        adminEmail,
        adminPhone,
        maxUsers,
        maxStorageGb,
        startDate,
        expiryDate,
      });
      if (res.ok) setIsModalOpen(false);
      else alert(res.error || 'Cập nhật thất bại');
    } else {
      const res = await createCompany({
        code,
        name,
        taxCode,
        slogan,
        plan,
        status,
        adminEmail,
        adminPhone,
        maxUsers,
        maxStorageGb,
        startDate,
        expiryDate,
      }, adminPassword);

      if (res.ok) setIsModalOpen(false);
      else alert(res.error || 'Tạo công ty thất bại');
    }
  };

  const handleDelete = async (comp: CompanyTenant) => {
    if (confirm(`CẢNH BÁO: Bạn có chắc chắn muốn xóa toàn bộ công ty "${comp.name}"? Dữ liệu công ty sẽ bị xóa vĩnh viễn!`)) {
      const res = await deleteCompany(comp.id);
      if (!res.ok) alert(res.error || 'Lỗi khi xóa');
    }
  };

  const filteredCompanies = companies.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.adminEmail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    const matchesPlan = planFilter === 'all' || c.plan === planFilter;
    return matchesSearch && matchesStatus && matchesPlan;
  });

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-5 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
            <Building2 className="w-6 h-6 text-sky-400" />
            Danh sách Công ty Khách hàng (Tenants)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Quản trị độc lập các doanh nghiệp thuê phần mềm, cấu hình gói cước, số lượng tài khoản và phân quyền module.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-lg shadow-sky-500/20 active:scale-95 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Tạo Công Ty Mới
        </button>
      </div>

      {/* Filter and Search */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="relative md:col-span-2">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo tên công ty, mã tenant, email quản trị..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
          />
        </div>
        <div>
          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-sky-500"
          >
            <option value="all">-- Tất cả gói cước --</option>
            <option value="trial">Dùng thử (Trial)</option>
            <option value="standard">Tiêu chuẩn (Standard)</option>
            <option value="professional">Chuyên nghiệp (Professional)</option>
            <option value="enterprise">Doanh nghiệp (Enterprise)</option>
          </select>
        </div>
        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-sky-500"
          >
            <option value="all">-- Tất cả trạng thái --</option>
            <option value="active">Đang hoạt động</option>
            <option value="suspended">Tạm khóa</option>
            <option value="expired">Hết hạn thuê bao</option>
          </select>
        </div>
      </div>

      {/* Companies Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/50 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Doanh nghiệp / Mã</th>
                <th className="py-3 px-4">Gói dịch vụ</th>
                <th className="py-3 px-4">Trạng thái</th>
                <th className="py-3 px-4">Company Admin</th>
                <th className="py-3 px-4">Giới hạn</th>
                <th className="py-3 px-4">Thời hạn</th>
                <th className="py-3 px-4">Modules</th>
                <th className="py-3 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {filteredCompanies.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    Không tìm thấy công ty nào phù hợp
                  </td>
                </tr>
              ) : (
                filteredCompanies.map((comp) => {
                  const assignedCount = (companyModules[comp.id] || []).length;
                  return (
                    <tr key={comp.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-100 flex items-center gap-2">
                          {comp.name}
                        </div>
                        <div className="text-[11px] text-sky-400 font-mono mt-0.5">
                          ID: {comp.code} {comp.taxCode && `• MST: ${comp.taxCode}`}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                          comp.plan === 'enterprise' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                          comp.plan === 'professional' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
                          comp.plan === 'standard' ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20' :
                          'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                          {comp.plan}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                          comp.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                          comp.status === 'suspended' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                          'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            comp.status === 'active' ? 'bg-emerald-400' :
                            comp.status === 'suspended' ? 'bg-amber-400' : 'bg-rose-400'
                          }`}></span>
                          {comp.status === 'active' ? 'Hoạt động' : comp.status === 'suspended' ? 'Tạm khóa' : 'Hết hạn'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-slate-200 font-medium">{comp.adminEmail}</div>
                        {comp.adminPhone && <div className="text-[11px] text-slate-500">{comp.adminPhone}</div>}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3 text-slate-400 text-[11px]">
                          <span className="flex items-center gap-1" title="Số user tối đa">
                            <Users className="w-3.5 h-3.5 text-slate-400" />
                            {comp.maxUsers}
                          </span>
                          <span className="flex items-center gap-1" title="Dung lượng tối đa">
                            <HardDrive className="w-3.5 h-3.5 text-slate-400" />
                            {comp.maxStorageGb} GB
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                        <div>Bắt đầu: {comp.startDate}</div>
                        <div className="text-slate-500">Hết hạn: {comp.expiryDate || 'Vô thời hạn'}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => setActiveModuleModalComp(comp)}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-sky-400 border border-slate-700 rounded-lg text-[11px] font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <span>{assignedCount}/{modules.length} Module</span>
                          <SlidersHorizontal className="w-3 h-3" />
                        </button>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(comp)}
                            className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                            title="Chỉnh sửa cấu hình công ty"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(comp)}
                            className="p-1.5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 rounded-lg transition-colors cursor-pointer"
                            title="Xóa công ty"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Thêm / Sửa Công Ty */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-sky-400" />
                {editingComp ? 'Chỉnh Sửa Công Ty Khách Hàng' : 'Tạo Tenant / Công Ty Khách Hàng Mới'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Mã Công Ty / Code <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    disabled={Boolean(editingComp)}
                    placeholder="VD: TITSMART, HOABINH, ANPHONG"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white uppercase placeholder-slate-600 focus:outline-none focus:border-sky-500 disabled:opacity-60"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Tên Doanh Nghiệp <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Công ty Cổ phần Xây dựng ABC"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">Mã số thuế</label>
                  <input
                    type="text"
                    placeholder="VD: 0101234567"
                    value={taxCode}
                    onChange={(e) => setTaxCode(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">Khẩu hiệu / Slogan</label>
                  <input
                    type="text"
                    placeholder="VD: Vươn tầm cao mới"
                    value={slogan}
                    onChange={(e) => setSlogan(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-3">
                <div className="text-xs font-bold text-sky-400 flex items-center gap-1.5">
                  <KeyRound className="w-4 h-4" />
                  Tài khoản Quản trị Công ty (Company Admin)
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Email đại diện / Đăng nhập <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="admin@doanhnghiep.vn"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  {!editingComp && (
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Mật khẩu khởi tạo ban đầu
                      </label>
                      <input
                        type="text"
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-sky-500 font-mono"
                      />
                    </div>
                  )}
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Số điện thoại liên hệ</label>
                    <input
                      type="text"
                      placeholder="0912 345 678"
                      value={adminPhone}
                      onChange={(e) => setAdminPhone(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">Gói thuê bao</label>
                  <select
                    value={plan}
                    onChange={(e: any) => setPlan(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                  >
                    <option value="trial">Dùng thử</option>
                    <option value="standard">Tiêu chuẩn</option>
                    <option value="professional">Chuyên nghiệp</option>
                    <option value="enterprise">Doanh nghiệp</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">Trạng thái</label>
                  <select
                    value={status}
                    onChange={(e: any) => setStatus(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                  >
                    <option value="active">Đang kích hoạt</option>
                    <option value="suspended">Tạm khóa</option>
                    <option value="expired">Hết hạn</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">Giới hạn Users</label>
                  <input
                    type="number"
                    min={1}
                    value={maxUsers}
                    onChange={(e) => setMaxUsers(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">Dung lượng (GB)</label>
                  <input
                    type="number"
                    min={1}
                    value={maxStorageGb}
                    onChange={(e) => setMaxStorageGb(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">Ngày bắt đầu</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">Ngày hết hạn thuê bao</label>
                  <input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 shadow-lg shadow-sky-500/20 active:scale-95 transition-all cursor-pointer"
                >
                  {editingComp ? 'Lưu Thay Đổi' : 'Xác Nhận Tạo Công Ty'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Bật / Tắt Module Của Công Ty */}
      {activeModuleModalComp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl max-h-[85vh] overflow-y-auto shadow-2xl p-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5 text-sky-400" />
                  Cấp Phép Modules: {activeModuleModalComp.name}
                </h3>
                <div className="text-xs text-slate-400 mt-0.5">
                  Mã: <span className="font-mono text-sky-400">{activeModuleModalComp.code}</span> • Gói: {activeModuleModalComp.plan}
                </div>
              </div>
              <button 
                onClick={() => setActiveModuleModalComp(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5 my-4">
              {modules.map((mod) => {
                const isEnabled = (companyModules[activeModuleModalComp.id] || []).includes(mod.id);
                return (
                  <div
                    key={mod.id}
                    className="flex items-center justify-between p-3 rounded-xl border border-slate-800 bg-slate-950/60 hover:bg-slate-800/40 transition-colors"
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-100 flex items-center gap-2">
                        {mod.name}
                        {mod.isCore && (
                          <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.2 rounded font-normal">
                            Core
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{mod.description}</div>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        checked={isEnabled}
                        onChange={(e) => toggleCompanyModule(activeModuleModalComp.id, mod.id, e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sky-500"></div>
                    </label>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setActiveModuleModalComp(null)}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
