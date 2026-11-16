import React, { useEffect, useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { DashboardOverview } from './components/DashboardOverview';
import { TenantsManagement } from './components/TenantsManagement';
import { ModulesOverview } from './components/ModulesOverview';
import { usePlatformStore } from './store/platformStore';
import { RefreshCw, Bell, Shield, ExternalLink } from 'lucide-react';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { fetchData, isLoading, error } = usePlatformStore();

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-14 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Khu vực:</span>
            <span className="text-xs font-extrabold text-white bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg">
              {activeTab === 'dashboard' && 'Tổng quan Hệ thống'}
              {activeTab === 'tenants' && 'Quản lý Công ty Khách hàng'}
              {activeTab === 'modules' && 'Gói Dịch Vụ & Modules'}
              {activeTab === 'subscriptions' && 'Hợp đồng & Thuê bao'}
              {activeTab === 'admins' && 'Company Admins'}
              {activeTab === 'security' && 'Bảo mật Nền tảng'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {error && (
              <span className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2.5 py-1 rounded-lg">
                {error}
              </span>
            )}
            <button
              onClick={() => fetchData()}
              disabled={isLoading}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-900 rounded-lg transition-colors cursor-pointer"
              title="Làm mới dữ liệu"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-sky-400' : ''}`} />
            </button>
          </div>
        </header>

        {/* Dynamic Body */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'dashboard' && <DashboardOverview onNavigateToTenants={() => setActiveTab('tenants')} />}
            {activeTab === 'tenants' && <TenantsManagement />}
            {activeTab === 'modules' && <ModulesOverview />}
            {activeTab === 'subscriptions' && <TenantsManagement />}
            {activeTab === 'admins' && <TenantsManagement />}
            {activeTab === 'security' && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-sky-400" />
                  Cấu hình Bảo mật Nền tảng SaaS
                </h3>
                <p className="text-xs text-slate-400">
                  Toàn bộ các quy tắc RLS (Row Level Security) và cô lập database theo company_id được kiểm soát tự động tại Supabase Backend.
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
