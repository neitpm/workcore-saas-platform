import React, { useState, useEffect } from 'react';
import { usePlatformAdminStore, CompanyTenant } from '../store/platformAdminStore';
import { Modal } from './Modal';

interface PlatformTenantsTabProps {
  triggerToast: (msg: string, type: 'success' | 'info' | 'warning' | 'error') => void;
}

export const PlatformTenantsTab: React.FC<PlatformTenantsTabProps> = ({ triggerToast }) => {
  const { companies, addCompany, updateCompany, deleteCompany, fetchPlatformData } = usePlatformAdminStore();
  const [search, setSearch] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<CompanyTenant | null>(null);

  useEffect(() => {
    fetchPlatformData();
  }, [fetchPlatformData]);

  // Form state
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [slogan, setSlogan] = useState('');
  const [logo, setLogo] = useState('');
  const [plan, setPlan] = useState<CompanyTenant['plan']>('standard');
  const [status, setStatus] = useState<CompanyTenant['status']>('active');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPhone, setAdminPhone] = useState('');
  const [maxUsers, setMaxUsers] = useState(20);
  const [maxStorageGb, setMaxStorageGb] = useState(50);
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [expiryDate, setExpiryDate] = useState('2027-12-31');
  const [notes, setNotes] = useState('');

  const openCreateModal = () => {
    setEditingCompany(null);
    setCode('');
    setName('');
    setSlogan('');
    setLogo('');
    setPlan('standard');
    setStatus('active');
    setAdminEmail('');
    setAdminPhone('');
    setMaxUsers(20);
    setMaxStorageGb(50);
    setStartDate(new Date().toISOString().slice(0, 10));
    setExpiryDate('2027-12-31');
    setNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (comp: CompanyTenant) => {
    setEditingCompany(comp);
    setCode(comp.code);
    setName(comp.name);
    setSlogan(comp.slogan || '');
    setLogo(comp.logo || '');
    setPlan(comp.plan);
    setStatus(comp.status);
    setAdminEmail(comp.adminEmail);
    setAdminPhone(comp.adminPhone || '');
    setMaxUsers(comp.maxUsers || 20);
    setMaxStorageGb(comp.maxStorageGb || 50);
    setStartDate(comp.startDate);
    setExpiryDate(comp.expiryDate);
    setNotes(comp.notes || '');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !name.trim() || !adminEmail.trim()) {
      triggerToast('Vui lòng điền đầy đủ Mã, Tên công ty và Email quản trị!', 'warning');
      return;
    }

    try {
      if (editingCompany) {
        await updateCompany(editingCompany.id, {
          code: code.trim().toUpperCase(),
          name: name.trim(),
          slogan: slogan.trim(),
          logo: logo.trim(),
          plan,
          status,
          adminEmail: adminEmail.trim(),
          adminPhone: adminPhone.trim(),
          maxUsers: Number(maxUsers),
          maxStorageGb: Number(maxStorageGb),
          startDate,
          expiryDate,
          notes: notes.trim()
        });
        triggerToast(`Đã cập nhật công ty "${name}" thành công!`, 'success');
      } else {
        await addCompany({
          code: code.trim().toUpperCase(),
          name: name.trim(),
          slogan: slogan.trim(),
          logo: logo.trim(),
          plan,
          status,
          adminEmail: adminEmail.trim(),
          adminPhone: adminPhone.trim(),
          maxUsers: Number(maxUsers),
          maxStorageGb: Number(maxStorageGb),
          startDate,
          expiryDate,
          notes: notes.trim()
        });
        triggerToast(`Đã thêm công ty khách hàng "${name}" mới!`, 'success');
      }
      setIsModalOpen(false);
    } catch {
      triggerToast('Lỗi khi lưu dữ liệu công ty!', 'error');
    }
  };

  const handleDelete = async (comp: CompanyTenant) => {
    if (comp.code === 'TITSMART') {
      triggerToast('Không thể xóa công ty gốc TITSMART!', 'warning');
      return;
    }
    if (window.confirm(`Bạn có chắc chắn muốn xóa hồ sơ công ty "${comp.name}"?`)) {
      await deleteCompany(comp.id);
      triggerToast(`Đã xóa công ty "${comp.name}" khỏi hệ thống!`, 'info');
    }
  };

  const filtered = companies.filter(c => {
    const matchText = (c.name + ' ' + c.code + ' ' + c.adminEmail).toLowerCase().includes(search.toLowerCase());
    const matchPlan = selectedPlan === 'all' || c.plan === selectedPlan;
    return matchText && matchPlan;
  });

  return (
    <div className="space-y-4 animate-in fade-in duration-150">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900">Quản lý Công ty Khách hàng (SaaS Tenants)</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Quản trị các công ty thuê bao phần mềm TITSMART, gói dịch vụ, hạn mức user & thời hạn kích hoạt.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="px-5 py-2.5 rounded text-xs font-extrabold bg-blue-700 hover:bg-blue-800 text-white transition-all shadow-md flex items-center gap-2 self-start sm:self-auto cursor-pointer border border-blue-800 shrink-0"
        >
          <span className="material-symbols-outlined text-base text-white">add_business</span>
          <span className="text-white tracking-wide">Thêm thuê bao</span>
        </button>
      </div>

      {/* Toolbar lọc */}
      <div className="bg-white p-3 rounded border border-slate-200 shadow-2xs flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">search</span>
          <input
            type="text"
            placeholder="Tìm theo tên công ty, mã, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 rounded text-xs border border-slate-200 outline-none focus:bg-white focus:border-primary transition-all"
          />
        </div>
        <select
          value={selectedPlan}
          onChange={(e) => setSelectedPlan(e.target.value)}
          className="px-3 py-1.5 bg-slate-50 rounded text-xs border border-slate-200 outline-none font-bold text-slate-700 cursor-pointer"
        >
          <option value="all">Tất cả gói dịch vụ</option>
          <option value="trial">Gói Dùng thử (Trial)</option>
          <option value="standard">Gói Tiêu chuẩn (Standard)</option>
          <option value="professional">Gói Chuyên nghiệp (Pro)</option>
          <option value="enterprise">Gói Doanh nghiệp (Enterprise)</option>
        </select>
      </div>

      {/* Bảng danh sách công ty */}
      <div className="bg-white rounded border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
              <tr>
                <th className="p-3.5">Mã & Tên Công ty</th>
                <th className="p-3.5">Gói dịch vụ</th>
                <th className="p-3.5">Hạn mức (User / Dung lượng)</th>
                <th className="p-3.5">Admin liên hệ</th>
                <th className="p-3.5">Hạn thuê bao</th>
                <th className="p-3.5">Trạng thái</th>
                <th className="p-3.5 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filtered.map(comp => {
                const isExpired = new Date(comp.expiryDate) < new Date();
                return (
                  <tr key={comp.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5">
                      <div className="flex items-center gap-2.5">
                        {comp.logo ? (
                          <div className="w-8 h-8 rounded border border-slate-200 bg-white p-0.5 flex items-center justify-center shrink-0 overflow-hidden">
                            <img src={comp.logo} alt={comp.name} className="max-w-full max-h-full object-contain" onError={(e) => ((e.target as any).style.display = 'none')} />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded bg-slate-100 border border-slate-200 text-slate-500 font-bold text-xs flex items-center justify-center shrink-0">
                            {comp.code.slice(0, 2)}
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-slate-900">{comp.name}</div>
                          <div className="text-[11px] text-slate-400 font-mono">Mã: {comp.code}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5">
                      <span className="px-2.5 py-1 rounded text-[11px] font-extrabold uppercase bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {comp.plan}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <div className="font-semibold text-slate-800">{comp.maxUsers} tài khoản</div>
                      <div className="text-[11px] text-slate-400">{comp.maxStorageGb} GB Cloud Storage</div>
                    </td>
                    <td className="p-3.5">
                      <div>{comp.adminEmail}</div>
                      <div className="text-[11px] text-slate-400">{comp.adminPhone || 'Chưa có SĐT'}</div>
                    </td>
                    <td className="p-3.5">
                      <div className={isExpired ? 'text-rose-600 font-bold' : 'text-slate-800 font-semibold'}>
                        {comp.expiryDate}
                      </div>
                      {isExpired && <span className="text-[10px] text-rose-500 font-bold">Đã hết hạn</span>}
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        comp.status === 'active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        comp.status === 'suspended' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                        'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {comp.status === 'active' ? 'Đang hoạt động' : comp.status === 'suspended' ? 'Tạm ngưng' : 'Hết hạn'}
                      </span>
                    </td>
                    <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => openEditModal(comp)}
                        className="px-2.5 py-1 rounded text-slate-600 hover:text-primary hover:bg-blue-50 transition-colors font-bold"
                        title="Chỉnh sửa cấu hình"
                      >
                        Sửa
                      </button>
                      {comp.code !== 'TITSMART' && (
                        <button
                          type="button"
                          onClick={() => handleDelete(comp)}
                          className="px-2.5 py-1 rounded text-rose-600 hover:bg-rose-50 transition-colors font-bold"
                          title="Xóa công ty"
                        >
                          Xóa
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-400">
                    Không tìm thấy công ty nào phù hợp với bộ lọc.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Thêm / Sửa công ty */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCompany ? `Cập nhật công ty: ${editingCompany.name}` : 'Thêm công ty thuê bao mới'}
        icon="business"
        size="lg"
      >
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Mã định danh công ty (Code) *</label>
              <input
                type="text"
                required
                disabled={editingCompany?.code === 'TITSMART'}
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="VD: EVN, VIETTEL, CTY-ABC"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded outline-none focus:bg-white focus:border-primary font-mono font-bold"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Tên công ty / Doanh nghiệp *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="VD: Công ty TNHH Kỹ thuật Điện ABC"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded outline-none focus:bg-white focus:border-primary font-bold"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Slogan / Khẩu hiệu</label>
              <input
                type="text"
                value={slogan}
                onChange={(e) => setSlogan(e.target.value)}
                placeholder="Khẩu hiệu hiển thị dưới logo"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded outline-none focus:bg-white focus:border-primary"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-bold text-slate-700">Logo công ty / Hình ảnh</label>
                {logo && (
                  <button
                    type="button"
                    onClick={() => setLogo('')}
                    className="text-[11px] font-bold text-rose-600 hover:text-rose-700 cursor-pointer flex items-center gap-0.5"
                    title="Xóa logo này để chọn lại ảnh khác"
                  >
                    <span className="material-symbols-outlined text-xs">close</span>
                    <span>Đổi ảnh khác</span>
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={logo}
                  onChange={(e) => setLogo(e.target.value)}
                  placeholder="Dán link ảnh https://... hoặc bấm nút Tải ảnh"
                  className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded outline-none focus:bg-white focus:border-primary text-xs"
                />
                <label className="px-3 py-2 border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 rounded text-xs font-bold transition-colors cursor-pointer shrink-0 flex items-center gap-1 shadow-2xs">
                  <span className="material-symbols-outlined text-sm text-blue-700">cloud_upload</span>
                  <span>{logo ? 'Thay ảnh' : 'Tải ảnh'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          if (typeof reader.result === 'string') {
                            setLogo(reader.result);
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </label>
                {logo && (
                  <div className="w-10 h-10 border border-slate-300 rounded bg-white flex items-center justify-center p-0.5 shrink-0 overflow-hidden shadow-2xs">
                    <img src={logo} alt="Preview" className="max-w-full max-h-full object-contain" onError={(e) => ((e.target as any).style.display = 'none')} />
                  </div>
                )}
              </div>
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Gói dịch vụ</label>
              <select
                value={plan}
                onChange={(e) => setPlan(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded outline-none font-bold text-slate-700"
              >
                <option value="trial">Dùng thử (Trial)</option>
                <option value="standard">Tiêu chuẩn (Standard)</option>
                <option value="professional">Chuyên nghiệp (Pro)</option>
                <option value="enterprise">Doanh nghiệp (Enterprise)</option>
              </select>
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Email Quản trị viên (Company Admin) *</label>
              <input
                type="email"
                required
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                placeholder="admin@tencongty.vn"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded outline-none focus:bg-white focus:border-primary"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Số điện thoại liên hệ</label>
              <input
                type="text"
                value={adminPhone}
                onChange={(e) => setAdminPhone(e.target.value)}
                placeholder="09xx..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded outline-none focus:bg-white focus:border-primary"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Giới hạn số người dùng (Users)</label>
              <input
                type="number"
                min={1}
                max={1000}
                value={maxUsers}
                onChange={(e) => setMaxUsers(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded outline-none focus:bg-white focus:border-primary font-bold"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Dung lượng lưu trữ tối đa (GB)</label>
              <input
                type="number"
                min={1}
                max={5000}
                value={maxStorageGb}
                onChange={(e) => setMaxStorageGb(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded outline-none focus:bg-white focus:border-primary font-bold"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Ngày bắt đầu</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded outline-none"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Hạn kết thúc / Hết hạn thuê</label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded outline-none font-bold text-primary"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="font-bold text-slate-700 block mb-1">Trạng thái tài khoản</label>
              <div className="flex items-center gap-4 pt-1">
                <label className="flex items-center gap-1.5 cursor-pointer font-bold text-emerald-700">
                  <input
                    type="radio"
                    name="company_status"
                    checked={status === 'active'}
                    onChange={() => setStatus('active')}
                    className="accent-emerald-600"
                  />
                  Đang hoạt động (Active)
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer font-bold text-amber-700">
                  <input
                    type="radio"
                    name="company_status"
                    checked={status === 'suspended'}
                    onChange={() => setStatus('suspended')}
                    className="accent-amber-600"
                  />
                  Tạm ngưng (Suspended)
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer font-bold text-rose-700">
                  <input
                    type="radio"
                    name="company_status"
                    checked={status === 'expired'}
                    onChange={() => setStatus('expired')}
                    className="accent-rose-600"
                  />
                  Hết hạn (Expired)
                </label>
              </div>
            </div>
            <div className="sm:col-span-2">
              <label className="font-bold text-slate-700 block mb-1">Ghi chú nghiệp vụ</label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ghi chú về hợp đồng, thanh toán hoặc yêu cầu kỹ thuật riêng..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded outline-none focus:bg-white focus:border-primary"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 rounded text-xs font-bold transition-colors cursor-pointer shadow-2xs"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded text-xs font-bold bg-blue-700 hover:bg-blue-800 text-white transition-colors shadow-2xs cursor-pointer flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-sm text-white">save</span>
              <span className="text-white font-bold">Lưu công ty</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
