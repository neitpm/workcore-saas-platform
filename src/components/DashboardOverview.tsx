import React from 'react';
import { 
  Building2, 
  Users, 
  Layers, 
  CreditCard, 
  TrendingUp, 
  Clock, 
  CheckCircle,
  HardDrive
} from 'lucide-react';
import { usePlatformStore } from '../store/platformStore';

export const DashboardOverview: React.FC<{ onNavigateToTenants: () => void }> = ({ onNavigateToTenants }) => {
  const { companies, modules } = usePlatformStore();

  const totalTenants = companies.length;
  const activeTenants = companies.filter(c => c.status === 'active').length;
  const totalMaxUsers = companies.reduce((acc, c) => acc + (c.maxUsers || 0), 0);
  const totalStorageGb = companies.reduce((acc, c) => acc + (c.maxStorageGb || 0), 0);

  const stats = [
    {
      title: 'Tổng số Doanh nghiệp (Tenants)',
      value: totalTenants,
      sub: `${activeTenants} đang hoạt động`,
      icon: Building2,
      color: 'from-sky-500 to-blue-600',
    },
    {
      title: 'Dung lượng cấp phát',
      value: `${totalStorageGb} GB`,
      sub: 'Lưu trữ tài liệu dự án',
      icon: HardDrive,
      color: 'from-indigo-500 to-purple-600',
    },
    {
      title: 'Tổng User cấp phép',
      value: totalMaxUsers,
      sub: 'Tài khoản nhân sự',
      icon: Users,
      color: 'from-emerald-500 to-teal-600',
    },
    {
      title: 'Số Modules hệ thống',
      value: modules.length,
      sub: 'Sẵn sàng triển khai',
      icon: Layers,
      color: 'from-amber-500 to-orange-600',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-sky-900/60 via-indigo-900/40 to-slate-900 border border-sky-500/20 p-6 shadow-2xl">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-sky-500/10 text-sky-400 border border-sky-500/30 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse"></span>
            WORKCORE MULTI-TENANT SAAS CORE
          </span>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Trung tâm Điều hành Nền tảng SaaS
          </h1>
          <p className="text-xs text-slate-300 mt-2 leading-relaxed">
            Hệ thống độc lập phân phối, quản lý tenant doanh nghiệp, cấp tài khoản Company Admin và phân bổ gói dịch vụ cho các công ty khách hàng.
          </p>
          <div className="mt-4 flex items-center gap-3">
            <button
              onClick={onNavigateToTenants}
              className="bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-lg shadow-sky-500/25 active:scale-95 cursor-pointer"
            >
              Xem danh sách Công ty
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, idx) => {
          const Icon = s.icon;
          return (
            <div key={idx} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex items-center justify-between">
              <div>
                <div className="text-[11px] font-semibold text-slate-400">{s.title}</div>
                <div className="text-2xl font-black text-white mt-1">{s.value}</div>
                <div className="text-[11px] text-slate-500 mt-1">{s.sub}</div>
              </div>
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center text-white shadow-md`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Companies */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-sky-400" />
            Các doanh nghiệp khách hàng mới nhất
          </h3>
          <button 
            onClick={onNavigateToTenants}
            className="text-xs font-bold text-sky-400 hover:text-sky-300 transition-colors cursor-pointer"
          >
            Xem tất cả ({companies.length}) →
          </button>
        </div>

        <div className="space-y-2.5">
          {companies.slice(0, 5).map((comp) => (
            <div
              key={comp.id}
              className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-sky-400">
                  {comp.code.slice(0, 2)}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-200">{comp.name}</div>
                  <div className="text-[11px] text-slate-400">
                    Mã: <span className="font-mono text-sky-400">{comp.code}</span> • Admin: {comp.adminEmail}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                  {comp.plan}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  comp.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                }`}>
                  {comp.status === 'active' ? 'Active' : comp.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
