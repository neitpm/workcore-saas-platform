import React, { useState } from 'react';
import { PlatformTenantsTab } from './components/PlatformTenantsTab';
import { MasterCategoriesTab } from './components/MasterCategoriesTab';
import { SystemSecurityTab } from './components/SystemSecurityTab';
import { SystemIntegrationTab } from './components/SystemIntegrationTab';
import { usePlatformAdminStore } from './store/platformAdminStore';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'tenants' | 'categories' | 'security' | 'integrations'>('tenants');
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'info' | 'warning' | 'error' } | null>(null);
  const { companies } = usePlatformAdminStore();

  const triggerToast = (msg: string, type: 'success' | 'info' | 'warning' | 'error' = 'info') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  return (
    <div className="flex flex-col flex-1 min-h-screen bg-slate-50 relative overflow-hidden font-sans">
      {/* Top Header Bar synchronized với WorkCore Client */}
      <header className="bg-white border-b border-slate-200 pl-4 pr-6 h-12 flex items-center justify-between shadow-2xs shrink-0">
        <div className="flex items-center gap-3">
          <h2 className="page-title text-base md:text-lg font-extrabold text-slate-900 border-l-4 border-primary pl-2 uppercase tracking-wide">
            CÀI ĐẶT HỆ THỐNG
          </h2>
          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-blue-100 text-primary border border-blue-200">
            WORKCORE SAAS PLATFORM
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
          <span className="w-2 h-2 rounded bg-emerald-500 animate-pulse"></span>
          <span>Platform Super Admin</span>
        </div>
      </header>

      {/* Main SaaS Settings Layout (Left Nav + Right Content) y hệt thiết kế chuẩn của WorkCore */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Settings Sidebar */}
        <aside className="w-60 md:w-64 bg-white border-r border-slate-200 p-3 flex flex-col justify-between shrink-0 overflow-y-auto custom-scrollbar">
          <div className="space-y-4">
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-1.5">
                Quản trị nền tảng SaaS
              </div>
              <nav className="space-y-1">
                <button
                  type="button"
                  onClick={() => setActiveTab('tenants')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-xs font-bold transition-all text-left cursor-pointer ${
                    activeTab === 'tenants'
                      ? 'bg-blue-50 text-primary border border-blue-200/80 shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <span className="material-symbols-outlined text-lg">corporate_fare</span>
                  <span>Công ty & Gói dịch vụ</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('categories')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-xs font-bold transition-all text-left cursor-pointer ${
                    activeTab === 'categories'
                      ? 'bg-blue-50 text-primary border border-blue-200/80 shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <span className="material-symbols-outlined text-lg">category</span>
                  <span>Danh mục chuẩn hệ thống</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('security')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-xs font-bold transition-all text-left cursor-pointer ${
                    activeTab === 'security'
                      ? 'bg-blue-50 text-primary border border-blue-200/80 shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <span className="material-symbols-outlined text-lg">security</span>
                  <span>Chính sách Bảo mật</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('integrations')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-xs font-bold transition-all text-left cursor-pointer ${
                    activeTab === 'integrations'
                      ? 'bg-blue-50 text-primary border border-blue-200/80 shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <span className="material-symbols-outlined text-lg">hub</span>
                  <span>Tích hợp & Cảnh báo</span>
                </button>
              </nav>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400">
            <div>WorkCore SaaS Platform</div>
            <div className="font-semibold text-slate-500">v3.8.411-saas</div>
          </div>
        </aside>

        {/* Right Tab Content */}
        <main className="flex-1 bg-slate-50 overflow-y-auto p-4 md:p-6 custom-scrollbar">
          <div className="max-w-6xl mx-auto">
            {activeTab === 'tenants' && (
              <PlatformTenantsTab triggerToast={triggerToast} />
            )}
            {activeTab === 'categories' && (
              <MasterCategoriesTab triggerToast={triggerToast} />
            )}
            {activeTab === 'security' && (
              <SystemSecurityTab triggerToast={triggerToast} />
            )}
            {activeTab === 'integrations' && (
              <SystemIntegrationTab triggerToast={triggerToast} />
            )}
          </div>
        </main>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded shadow-lg border text-sm font-semibold flex items-center gap-2.5 transition-all animate-bounce ${
            toast.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : toast.type === 'warning'
              ? 'bg-amber-50 text-amber-800 border-amber-200'
              : toast.type === 'error'
              ? 'bg-rose-50 text-rose-800 border-rose-200'
              : 'bg-blue-50 text-primary border-blue-200'
          }`}
        >
          <span className="material-symbols-outlined text-base">
            {toast.type === 'success' ? 'check_circle' : toast.type === 'warning' ? 'warning' : 'info'}
          </span>
          <span>{toast.msg}</span>
        </div>
      )}
    </div>
  );
};
export default App;
