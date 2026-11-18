import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export const CompanyAdminPortal: React.FC = () => {
  const [email, setEmail] = useState('admin@daiphuc.vn');
  const [password, setPassword] = useState('');
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);
  const [company, setCompany] = useState<any>(null);
  const [modules, setModules] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const loadCompany = async (userEmail: string) => {
    const response = await fetch(`http://127.0.0.1:55400/company-entitlements?email=${encodeURIComponent(userEmail)}`);
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || 'Không tải được cấu hình công ty');
    setCompany(payload.company);
    setModules(payload.modules || []);
  };

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      const currentEmail = data.session?.user.email;
      if (currentEmail) {
        setSessionEmail(currentEmail);
        try { await loadCompany(currentEmail); } catch (e) { setError(e instanceof Error ? e.message : 'Không tải được công ty'); }
      }
    });
  }, []);

  const signIn = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError || !data.user?.email) {
      setError(authError?.message || 'Thông tin đăng nhập không hợp lệ');
      setLoading(false);
      return;
    }
    try {
      setSessionEmail(data.user.email);
      await loadCompany(data.user.email);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Không tải được cấu hình công ty');
    } finally {
      setLoading(false);
    }
  };

  if (!sessionEmail) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <form onSubmit={signIn} className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-lg p-8">
        <div className="text-xs font-bold tracking-widest text-blue-700 uppercase">WorkCore Company Admin</div>
        <h1 className="mt-3 text-2xl font-extrabold text-slate-900">Đăng nhập quản trị công ty</h1>
        <p className="mt-2 text-sm text-slate-500">Dùng tài khoản Company Admin để cấu hình công ty.</p>
        <label className="block mt-6 text-sm font-semibold">Email</label>
        <input className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5" value={email} onChange={(e) => setEmail(e.target.value)} />
        <label className="block mt-4 text-sm font-semibold">Mật khẩu</label>
        <input type="password" className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5" value={password} onChange={(e) => setPassword(e.target.value)} />
        {error && <div className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
        <button disabled={loading} className="mt-6 w-full rounded-lg bg-blue-800 py-3 font-bold text-white disabled:opacity-60">{loading ? 'Đang đăng nhập...' : 'Đăng nhập'}</button>
      </form>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between">
          <div><div className="text-xs font-bold tracking-widest text-blue-700 uppercase">Company Admin Portal</div><h1 className="mt-2 text-3xl font-extrabold text-slate-900">{company?.name || 'Công ty'}</h1></div>
          <button onClick={() => supabase.auth.signOut().then(() => window.location.reload())} className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold">Đăng xuất</button>
        </div>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          <div className="rounded-xl bg-white p-5 shadow-sm border border-slate-200"><div className="text-sm text-slate-500">Mã công ty</div><div className="mt-2 font-bold">{company?.code}</div></div>
          <div className="rounded-xl bg-white p-5 shadow-sm border border-slate-200"><div className="text-sm text-slate-500">Gói dịch vụ</div><div className="mt-2 font-bold uppercase">{company?.plan}</div></div>
          <div className="rounded-xl bg-white p-5 shadow-sm border border-slate-200"><div className="text-sm text-slate-500">Module được cấp</div><div className="mt-2 font-bold">{modules.length}</div></div>
        </div>
        <section className="mt-6 rounded-xl bg-white p-6 shadow-sm border border-slate-200"><h2 className="text-lg font-bold">Module của công ty</h2><div className="mt-4 grid gap-3 md:grid-cols-2">{modules.map((module) => <div key={module.code} className="rounded-lg border border-slate-200 p-4"><div className="font-semibold">{module.name}</div><div className="mt-1 text-sm text-slate-500">{module.description}</div></div>)}</div></section>
        <section className="mt-6 rounded-xl bg-white p-6 shadow-sm border border-slate-200"><h2 className="text-lg font-bold">Cấu hình nội bộ</h2><p className="mt-2 text-sm text-slate-500">Khu vực này sẽ là nơi quản lý thương hiệu, nhân sự và phân quyền của công ty.</p></section>
      </div>
    </div>
  );
};
