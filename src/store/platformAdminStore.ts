import { create } from 'zustand';
import { supabase } from '../lib/supabase';

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
  createdAt?: string;
  updatedAt?: string;
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
        const moduleRows = allModules.map((m: any) => ({
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

      await supabase.from('engineers').insert({
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
      });

      // 4. Tạo quan hệ trong bảng company_users
      await supabase.from('company_users').insert({
        company_id: newCompanyId,
        email: comp.adminEmail.trim().toLowerCase(),
        username: adminUsername,
        company_role: 'company_admin',
        status: 'active',
      });

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
}));
