import { create } from 'zustand';
import { supabase } from '../lib/supabase';

// Một số dữ liệu module cũ bị mã hóa UTF-8 sai nhiều lớp
// (ví dụ: "Cháº¥m cÃ´ng"). Sửa khi đọc để giao diện hiển thị đúng tiếng Việt.
const MOJIBAKE_MARKERS = /[ÃÂÄÅÆâð�]|á(?:º|»)/;

const repairMojibake = (value?: string): string => {
  let current = value || '';

  for (let pass = 0; pass < 4 && MOJIBAKE_MARKERS.test(current); pass += 1) {
    try {
      const bytes = Uint8Array.from(Array.from(current).map((char) => char.charCodeAt(0) & 0xff));
      const repaired = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
      if (!repaired || repaired === current || repaired.includes('�')) break;
      current = repaired;
    } catch {
      break;
    }
  }

  return current;
};

const CANONICAL_MODULE_COPY = [
  ['Chấm công & Nghỉ phép', 'Quy chế chấm công, ngày nghỉ phép và duyệt phép của nhân viên.'],
  ['Nhắn tin Nội bộ', 'Trao đổi theo dự án, nhóm và thông báo nội bộ công ty.'],
  ['Thiết bị & Kỹ thuật', 'Quản lý máy móc, thiết bị, trạm biến áp và hồ sơ kỹ thuật.'],
  ['Hồ sơ pháp lý & Chứng từ', 'Quản lý biên bản, hợp đồng, hồ sơ pháp lý và chứng từ.'],
  ['Chi phí & Quỹ dự án', 'Quản lý chi phí công trình, vốn phần ứng và quyết toán quỹ.'],
  ['Nhật ký Hiện trường', 'Hành trình thực tế, chấm công GPS và ghi nhận sự cố.'],
  ['Kho Dự án', 'Quản lý xuất nhập tồn vật tư theo từng công trình.'],
  ['Lương công nhật', 'Quản lý chấm công và chi trả nhân công nhật tại công trình.'],
  ['Kế hoạch Vật tư', 'Bảng bóc tách khối lượng và chủng loại vật tư.'],
  ['Quản lý Nhân sự', 'Danh sách nhân viên, thông tin liên lạc và cấp bậc.'],
  ['Quản lý Dự án', 'Danh sách dự án, cấu hình thành viên và ngân sách.'],
  ['Mua sắm & Đặt hàng', 'Theo dõi đặt hàng, đánh giá, nhà cung cấp và thanh toán.'],
  ['Quản lý Tiến độ', 'Bảng phân công công việc, WBS và tiến độ thi công.'],
] as const;

export interface CompanyTenant {
  id: string;
  code: string;
  name: string;
  slogan?: string;
  logo?: string;
  plan: 'trial' | 'standard' | 'professional' | 'enterprise';
  status: 'active' | 'suspended' | 'expired';
  adminEmail: string;
  adminPhone?: string;
  maxUsers: number;
  maxStorageGb: number;
  startDate: string;
  expiryDate: string;
  notes?: string;
  enabledModuleIds?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface SystemModule {
  id: string;
  name: string;
  description?: string;
  category?: string;
  isCore?: boolean;
}

export interface SystemSecurityConfig {
  sessionTimeoutMinutes: number;
  minPasswordLength: number;
  requireSpecialChar: boolean;
  maxLoginAttempts: number;
  allowMobileAppLogin: boolean;
}

export interface MasterCategoryConfig {
  projectCategories: string[];
  taskProgressStatuses: string[];
  expenseCategories: string[];
}

export interface IntegrationAlertConfig {
  telegramBotEnabled: boolean;
  telegramBotToken?: string;
  telegramChatId?: string;
  zaloZnsEnabled: boolean;
  zaloTemplateId?: string;
  alertOnFundRequest: boolean;
  alertOnTaskOverdue: boolean;
  alertOnSecurityAnomaly: boolean;
}

interface PlatformAdminStoreState {
  companies: CompanyTenant[];
  modules: SystemModule[];
  companyModules: Record<string, string[]>;
  securityConfig: SystemSecurityConfig;
  masterCategories: MasterCategoryConfig;
  integrationConfig: IntegrationAlertConfig;
  isLoading: boolean;

  fetchPlatformData: () => Promise<void>;
  addCompany: (comp: Omit<CompanyTenant, 'id' | 'createdAt'> & { adminPassword?: string }) => Promise<CompanyTenant>;
  updateCompany: (id: string, patch: Partial<CompanyTenant>) => Promise<void>;
  deleteCompany: (id: string) => Promise<void>;
  saveSecurityConfig: (cfg: Partial<SystemSecurityConfig>) => Promise<void>;
  saveMasterCategories: (cats: Partial<MasterCategoryConfig>) => Promise<void>;
  saveIntegrationConfig: (integ: Partial<IntegrationAlertConfig>) => Promise<void>;
  setCompanyModules: (companyId: string, moduleIds: string[], startDate: string, expiryDate: string) => Promise<void>;
}

export const DEFAULT_SECURITY: SystemSecurityConfig = {
  sessionTimeoutMinutes: 60,
  minPasswordLength: 8,
  requireSpecialChar: true,
  maxLoginAttempts: 5,
  allowMobileAppLogin: true,
};

export const DEFAULT_MASTER_CATEGORIES: MasterCategoryConfig = {
  projectCategories: [
    'Trạm biến áp 110kV / 220kV / 500kV',
    'Đường dây truyền tải điện',
    'Nhà máy Điện mặt trời / Điện gió',
    'Tự động hóa & SCADA trạm',
    'Hạ tầng cơ điện M&E',
    'Phần mềm & CNTT Doanh nghiệp',
    'Chi phí quản lý Văn phòng',
  ],
  taskProgressStatuses: [
    'Chưa thực hiện',
    'Đang triển khai',
    'Chờ kiểm tra / Nghiệm thu',
    'Đã hoàn thành',
    'Tạm ngưng / Chậm tiến độ',
  ],
  expenseCategories: [
    'Mua sắm vật tư chính',
    'Thiết bị phụ trợ & phụ tùng',
    'Nhân công thuê ngoài / Thầu phụ',
    'Thuê máy móc, cẩu & thiết bị',
    'Chi phí lưu trú & công tác phí',
    'Tiếp khách & quan hệ đối tác',
    'Vận chuyển & logistics',
    'Chi phí hành chính văn phòng',
  ],
};

export const DEFAULT_INTEGRATION: IntegrationAlertConfig = {
  telegramBotEnabled: false,
  telegramBotToken: '',
  telegramChatId: '',
  zaloZnsEnabled: false,
  zaloTemplateId: '',
  alertOnFundRequest: true,
  alertOnTaskOverdue: true,
  alertOnSecurityAnomaly: true,
};

export const usePlatformAdminStore = create<PlatformAdminStoreState>((set, get) => ({
  companies: [],
  modules: [],
  companyModules: {},
  securityConfig: DEFAULT_SECURITY,
  masterCategories: DEFAULT_MASTER_CATEGORIES,
  integrationConfig: DEFAULT_INTEGRATION,
  isLoading: false,

  fetchPlatformData: async () => {
    set({ isLoading: true });
    try {
      // 1. Lấy trực tiếp danh sách công ty từ bảng companies trong Database
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data && Array.isArray(data)) {
        const mapped: CompanyTenant[] = data.map((c: any) => ({
          id: c.id,
          code: c.code,
          name: c.name,
          slogan: c.slogan || '',
          logo: c.logo_url || '',
          plan: c.plan || 'standard',
          status: c.status || 'active',
          adminEmail: c.admin_email || '',
          adminPhone: c.admin_phone || c.hotline || '',
          maxUsers: c.max_users || 20,
          maxStorageGb: c.max_storage_gb || 20,
          startDate: c.start_date || new Date().toISOString().slice(0, 10),
          expiryDate: c.expiry_date || '2030-12-31',
          notes: c.address || '',
          createdAt: c.created_at,
          updatedAt: c.updated_at,
        }));
        set({ companies: mapped });
      }
      const [{ data: moduleRows }, { data: assignmentRows }] = await Promise.all([
        supabase.from('modules').select('*').order('id'),
        supabase.from('company_modules').select('company_id,module_id,is_enabled').eq('is_enabled', true),
      ]);
      const moduleMap: Record<string, string[]> = {};
      (assignmentRows || []).forEach((row: any) => {
        if (!moduleMap[row.company_id]) moduleMap[row.company_id] = [];
        moduleMap[row.company_id].push(row.module_id);
      });
      set({
        modules: (moduleRows || []).map((m: any, index: number) => ({
          id: m.id,
          name: CANONICAL_MODULE_COPY[index]?.[0] || repairMojibake(m.name),
          description: CANONICAL_MODULE_COPY[index]?.[1] || repairMojibake(m.description),
          category: repairMojibake(m.category),
          isCore: Boolean(m.is_core),
        })),
        companyModules: moduleMap,
      });
    } catch (err) {
      console.error('[PlatformAdminStore] fetchPlatformData DB error:', err);
    } finally {
      set({ isLoading: false });
    }
  },

  addCompany: async (comp) => {
    set({ isLoading: true });
    try {
      // 1. Thêm công ty trực tiếp vào bảng companies trong PostgreSQL Database
      const { data: insertedComp, error: compErr } = await supabase
        .from('companies')
        .insert({
          code: comp.code.trim().toUpperCase(),
          name: comp.name.trim(),
          slogan: comp.slogan?.trim() || null,
          logo_url: comp.logo?.trim() || null,
          plan: comp.plan,
          status: comp.status,
          admin_email: comp.adminEmail.trim().toLowerCase(),
          admin_phone: comp.adminPhone?.trim() || null,
          max_users: comp.maxUsers,
          max_storage_gb: comp.maxStorageGb,
          start_date: comp.startDate || new Date().toISOString().slice(0, 10),
          expiry_date: comp.expiryDate || '2030-12-31',
        })
        .select()
        .single();

      if (compErr) throw compErr;

      const newCompanyId = insertedComp.id;

      // 2. Tự động gán các module chuẩn hệ thống vào bảng company_modules
      const { data: allModules } = await supabase.from('modules').select('id');
      if (allModules && allModules.length > 0) {
        const enabledIds = comp.enabledModuleIds || allModules.map((m: any) => m.id);
        const moduleRows = allModules.filter((m: any) => enabledIds.includes(m.id)).map((m: any) => ({
          company_id: newCompanyId,
          module_id: m.id,
          is_enabled: true,
          start_date: comp.startDate || new Date().toISOString().slice(0, 10),
          expiry_date: comp.expiryDate || '2030-12-31',
        }));
        await supabase.from('company_modules').insert(moduleRows);
      }

      // 3. Tự động tạo tài khoản Company Admin trong bảng engineers
      const adminUsername = comp.adminEmail.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
      const defaultPassword = comp.adminPassword || '123456';

      const { data: engData, error: engError } = await supabase.from('engineers').insert({
        company_id: newCompanyId,
        username: adminUsername,
        name: `Admin - ${comp.name}`,
        email: comp.adminEmail.trim().toLowerCase(),
        phone: comp.adminPhone || '',
        title: 'Giám đốc / Quản trị công ty',
        role: 'admin',
        company_role: 'company_admin',
        platform_role: 'user',
        password: defaultPassword,
        account_status: 'ACTIVE',
        is_active: true,
      }).select().single();

      if (engError) {
        console.warn('[PlatformAdminStore] engineers profile insert skipped:', engError.message);
      }

      // Đồng bộ vào auth.users để đăng nhập ngay qua Platform Auth
      {
        try {
          const response = await fetch('http://127.0.0.1:55400/provision-company-admin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              companyId: newCompanyId,
              email: comp.adminEmail.trim().toLowerCase(),
              password: defaultPassword,
              name: `Admin - ${comp.name}`,
            }),
          });
          const result = await response.json();
          if (!response.ok || !result.ok) throw new Error(result.error || 'Không thể tạo tài khoản Auth');
        } catch (authError) {
          throw new Error(`Công ty đã tạo nhưng chưa tạo được tài khoản Admin Auth: ${authError instanceof Error ? authError.message : 'lỗi không xác định'}`);
        }
      }

      // Tự động tạo hồ sơ nhận diện công ty trong company_branding
      await supabase.from('company_branding').upsert({
        company_id: newCompanyId,
        company_name: comp.name.trim(),
        company_slogan: comp.slogan?.trim() || '',
        company_logo: comp.logo?.trim() || null,
        hotline: comp.adminPhone?.trim() || null,
        email: comp.adminEmail.trim().toLowerCase(),
        address: comp.notes?.trim() || '',
        updated_at: new Date().toISOString()
      }, { onConflict: 'company_id' });

      // 4. Tạo quan hệ trong bảng company_users
      const { error: companyUserError } = await supabase.from('company_users').upsert({
        company_id: newCompanyId,
        email: comp.adminEmail.trim().toLowerCase(),
        username: adminUsername,
        company_role: 'company_admin',
        role: 'company_admin',
        status: 'active',
      }, { onConflict: 'company_id,email' });
      if (companyUserError) throw companyUserError;

      // 5. Làm mới danh sách công ty
      await get().fetchPlatformData();

      return {
        ...comp,
        id: newCompanyId,
        createdAt: insertedComp.created_at,
      };
    } finally {
      set({ isLoading: false });
    }
  },

  updateCompany: async (id, patch) => {
    set({ isLoading: true });
    try {
      const dbPatch: any = {};
      if (patch.name !== undefined) dbPatch.name = patch.name;
      if (patch.slogan !== undefined) dbPatch.slogan = patch.slogan;
      if (patch.logo !== undefined) dbPatch.logo_url = patch.logo;
      if (patch.plan !== undefined) dbPatch.plan = patch.plan;
      if (patch.status !== undefined) dbPatch.status = patch.status;
      if (patch.adminEmail !== undefined) dbPatch.admin_email = patch.adminEmail;
      if (patch.adminPhone !== undefined) dbPatch.admin_phone = patch.adminPhone;
      if (patch.maxUsers !== undefined) dbPatch.max_users = patch.maxUsers;
      if (patch.maxStorageGb !== undefined) dbPatch.max_storage_gb = patch.maxStorageGb;
      if (patch.expiryDate !== undefined) dbPatch.expiry_date = patch.expiryDate;
      dbPatch.updated_at = new Date().toISOString();

      const { error } = await supabase.from('companies').update(dbPatch).eq('id', id);
      if (error) throw error;

      if (patch.enabledModuleIds !== undefined) {
        await get().setCompanyModules(id, patch.enabledModuleIds, patch.startDate || '', patch.expiryDate || '');
      }

      // Đồng bộ sang bảng company_branding nếu cập nhật name, slogan hoặc logo
      if (patch.name !== undefined || patch.slogan !== undefined || patch.logo !== undefined) {
        try {
          const brandPatch: any = { updated_at: new Date().toISOString() };
          if (patch.name !== undefined) brandPatch.company_name = patch.name;
          if (patch.slogan !== undefined) brandPatch.company_slogan = patch.slogan;
          if (patch.logo !== undefined) brandPatch.company_logo = patch.logo;
          await supabase.from('company_branding').update(brandPatch).eq('company_id', id);
        } catch {
          // Bỏ qua lỗi phụ
        }
      }

      await get().fetchPlatformData();
    } finally {
      set({ isLoading: false });
    }
  },

  deleteCompany: async (id) => {
    set({ isLoading: true });
    try {
      const { error } = await supabase.from('companies').delete().eq('id', id);
      if (error) throw error;
      await get().fetchPlatformData();
    } finally {
      set({ isLoading: false });
    }
  },

  saveSecurityConfig: async (cfg) => {
    set((state) => ({ securityConfig: { ...state.securityConfig, ...cfg } }));
  },

  saveMasterCategories: async (cats) => {
    set((state) => ({ masterCategories: { ...state.masterCategories, ...cats } }));
  },

  saveIntegrationConfig: async (integ) => {
    set((state) => ({ integrationConfig: { ...state.integrationConfig, ...integ } }));
  },

  setCompanyModules: async (companyId, moduleIds, startDate, expiryDate) => {
    const selected = new Set(moduleIds);
    const { data: existing, error: readError } = await supabase
      .from('company_modules')
      .select('module_id')
      .eq('company_id', companyId);
    if (readError) throw readError;
    const existingIds = (existing || []).map((row: any) => row.module_id);
    const allIds = Array.from(new Set([...existingIds, ...moduleIds]));
    if (allIds.length > 0) {
      const { error } = await supabase.from('company_modules').upsert(
        allIds.map((moduleId) => ({
          company_id: companyId,
          module_id: moduleId,
          is_enabled: selected.has(moduleId),
          start_date: startDate || new Date().toISOString().slice(0, 10),
          expiry_date: expiryDate || null,
          updated_at: new Date().toISOString(),
        })),
        { onConflict: 'company_id,module_id' }
      );
      if (error) throw error;
    }
    set((state) => ({
      companyModules: { ...state.companyModules, [companyId]: moduleIds },
    }));
  },
}));
