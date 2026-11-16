import React from 'react';
import { Layers, ShieldCheck, CheckCircle2, Sparkles } from 'lucide-react';
import { usePlatformStore } from '../store/platformStore';

export const ModulesOverview: React.FC = () => {
  const { modules, companies } = usePlatformStore();

  const planPresets = [
    {
      name: 'Trial (Dùng thử)',
      desc: 'Dành cho doanh nghiệp mới trải nghiệm trong 14 ngày',
      price: 'Miễn phí',
      limit: 'Tối đa 5 nhân sự, 2 GB dung lượng',
      features: ['Quản lý dự án cơ bản', 'Tiến độ công việc', 'Nhật ký công trình'],
    },
    {
      name: 'Standard (Tiêu chuẩn)',
      desc: 'Phù hợp doanh nghiệp xây dựng / quản lý vừa và nhỏ',
      price: '1.200.000 đ / tháng',
      limit: 'Tối đa 25 nhân sự, 20 GB dung lượng',
      features: ['Toàn bộ gói Trial', 'Vật tư & Mua hàng', 'Chi phí & Tạm ứng', 'Hồ sơ pháp lý'],
    },
    {
      name: 'Professional (Chuyên nghiệp)',
      desc: 'Doanh nghiệp đa dự án, yêu cầu kiểm soát tài chính sâu',
      price: '2.800.000 đ / tháng',
      limit: 'Tối đa 60 nhân sự, 50 GB dung lượng',
      features: ['Toàn bộ gói Standard', 'Duyệt quỹ nhiều cấp', 'Chấm công & Nhân sự', 'Sơ đồ cây công việc WBS'],
    },
    {
      name: 'Enterprise (Doanh nghiệp lớn)',
      desc: 'Giải pháp tổng thể, hỗ trợ tùy biến và phân quyền chi tiết',
      price: 'Thương lượng',
      limit: 'Không giới hạn nhân sự, 200 GB+ dung lượng',
      features: ['Mở toàn bộ 13+ module', 'Nhãn trắng (White-label riêng)', 'Hỗ trợ SLA 24/7', 'Tích hợp Zalo/Telegram'],
    },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800">
        <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
          <Layers className="w-6 h-6 text-sky-400" />
          Danh mục Modules & Gói Dịch Vụ SaaS
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Hệ thống module chuẩn hóa cho phép bạn đóng/mở tính năng độc lập cho từng công ty khách hàng theo hợp đồng thuê bao.
        </p>
      </div>

      {/* Plan Presets */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {planPresets.map((p, idx) => (
          <div key={idx} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between hover:border-slate-700 transition-all shadow-md">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">{p.name}</span>
                {idx === 2 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-sky-500/10 text-sky-400 border border-sky-500/20 font-bold flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Phổ biến
                  </span>
                )}
              </div>
              <div className="text-lg font-extrabold text-white mt-2">{p.price}</div>
              <div className="text-[11px] text-slate-400 mt-1">{p.desc}</div>
              <div className="text-[11px] font-semibold text-slate-300 mt-2 p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                {p.limit}
              </div>

              <div className="mt-4 space-y-2 border-t border-slate-800/80 pt-3">
                {p.features.map((f, i) => (
                  <div key={i} className="text-xs text-slate-300 flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* System Modules List */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl p-5">
        <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-sky-400" />
          Danh sách 13 Module nghiệp vụ chuẩn trên hệ thống
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {modules.map((m) => (
            <div key={m.id} className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/50 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-sky-400">{m.id}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                    {m.category || 'Nghiệp vụ'}
                  </span>
                </div>
                <div className="text-sm font-bold text-slate-100 mt-1">{m.name}</div>
                <div className="text-xs text-slate-400 mt-1 line-clamp-2">{m.description}</div>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500">
                <span>{m.isCore ? 'Cốt lõi (Bắt buộc)' : 'Tùy chọn theo gói'}</span>
                <span className="text-emerald-400">Sẵn sàng</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
