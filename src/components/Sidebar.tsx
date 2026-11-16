import React from 'react';
import { 
  Building2, 
  Layers, 
  ShieldCheck, 
  CreditCard, 
  Users, 
  BarChart3, 
  Settings, 
  ExternalLink,
  ChevronRight
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Tổng quan SaaS', icon: BarChart3 },
    { id: 'tenants', label: 'Quản lý Công ty (Tenants)', icon: Building2 },
    { id: 'modules', label: 'Gói & Danh mục Module', icon: Layers },
    { id: 'subscriptions', label: 'Thuê bao & Hạn dùng', icon: CreditCard },
    { id: 'admins', label: 'Company Admins', icon: Users },
    { id: 'security', label: 'Bảo mật & Cấu hình', icon: ShieldCheck },
  ];

  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col justify-between shrink-0">
      <div>
        {/* Brand */}
        <div className="p-5 border-b border-slate-800/80 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/20 font-extrabold text-lg">
            W
          </div>
          <div>
            <div className="font-extrabold text-sm tracking-wide text-white uppercase flex items-center gap-1.5">
              WORKCORE
              <span className="text-[10px] bg-sky-500/10 text-sky-400 border border-sky-500/20 px-1.5 py-0.5 rounded font-mono">SAAS</span>
            </div>
            <div className="text-[11px] text-slate-400 font-medium">Platform Admin Console</div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-3 space-y-1">
          <div className="px-3 py-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Quản trị nền tảng
          </div>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-sky-600/15 text-sky-400 border border-sky-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-sky-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-sky-400" />}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/60">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-sky-400">
            SA
          </div>
          <div className="overflow-hidden">
            <div className="text-xs font-bold text-slate-200 truncate">Super Admin</div>
            <div className="text-[11px] text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Toàn quyền hệ thống
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
