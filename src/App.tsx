import React, { useEffect, useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { DashboardOverview } from './components/DashboardOverview';
import { TenantsManagement } from './components/TenantsManagement';
import { ModulesOverview } from './components/ModulesOverview';
import { MasterCategoriesTab } from './components/MasterCategoriesTab';
import { SystemSecurityTab } from './components/SystemSecurityTab';
import { SystemIntegrationTab } from './components/SystemIntegrationTab';
import { usePlatformStore } from './store/platformStore';
import { RefreshCw, CheckCircle2, AlertTriangle, XCircle, Info } from 'lucide-react';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { fetchData, isLoading, error } = usePlatformStore();
  const [toast, setToast] = useState<{ show: boolean; msg: string; type: 'success' | 'info' | 'warning' | 'error' }>({
    show: false,
    msg: '',
    type: 'success',
  });

  const triggerToast = (msg: string, type: 'success' | 'info' | 'warning' | 'error') => {
    setToast({ show: true, msg, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 3000);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Toast popup */}
      {toast.show && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-2xl border text-xs font-bold animate-in fade-in slide-in-from-top-2 duration-200 bg-slate-900 border-slate-700 text-white">
          {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
          {toast.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-400" />}
          {toast.type === 'error' && <XCircle className="w-4 h-4 text-rose-400" />}
          {toast.type === 'info' && <Info className="w-4 h-4 text-sky-400" />}
          <span>{toast.msg}</span>
        </div>
      )}

      {/* Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-14 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Khu vực:</span>
            <span className="text-xs font-extrabold text-white bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg">
              {activeTab === 'dashboard' && 'Tổng quan Nền tảng'}
              {activeTab === 'tenants' && 'Quản lý Công ty Khách hàng'}
              {activeTab === 'modules' && 'Gói Dịch Vụ & Modules'}
              {activeTab === 'categories' && 'Danh mục chuẩn hệ thống'}
              {activeTab === 'security' && 'Chính sách Bảo mật nền tảng'}
              {activeTab === 'integrations' && 'Tích hợp & Cảnh báo toàn hệ thống'}
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
            {activeTab === 'categories' && <MasterCategoriesTab triggerToast={triggerToast} />}
            {activeTab === 'security' && <SystemSecurityTab triggerToast={triggerToast} />}
            {activeTab === 'integrations' && <SystemIntegrationTab triggerToast={triggerToast} />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
