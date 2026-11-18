import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { CompanyTenant, SystemModule, CompanyModuleAssignment } from '../types';

// Dữ liệu module cũ có thể bị mã hóa UTF-8 sai nhiều lớp.
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

interface PlatformStoreState {
  companies: CompanyTenant[];
  modules: SystemModule[];
  companyModules: Record<string, string[]>; // companyId -> array of enabled moduleIds
  isLoading: boolean;
  error: string | null;

  fetchData: () => Promise<void>;
  createCompany: (
    data: Omit<CompanyTenant, 'id' | 'createdAt' | 'updatedAt'>,
    adminPassword?: string,
    initialModuleIds?: string[]
  ) => Promise<{ ok: boolean; error?: string }>;
  updateCompany: (id: string, patch: Partial<CompanyTenant>) => Promise<{ ok: boolean; error?: string }>;
  deleteCompany: (id: string) => Promise<{ ok: boolean; error?: string }>;
  toggleCompanyModule: (companyId: string, moduleId: string, enabled: boolean) => Promise<void>;
}

export const usePlatformStore = create<PlatformStoreState>((set, get) => ({
  companies: [],
  modules: [],
  companyModules: {},
  isLoading: false,
  error: null,

  fetchData: async () => {
    set({ isLoading: true, error: null });
    try {
      // 1. Fetch companies
      const { data: compData, error: compErr } = await supabase
        .from('companies')
        .select('*')
        .order('created_at', { ascending: false });

      if (compErr) throw compErr;

      // 2. Fetch all modules
      const { data: modData, error: modErr } = await supabase
        .from('modules')
        .select('*')
        .order('id', { ascending: true });

      if (modErr) throw modErr;

      // 3. Fetch module assignments
      const { data: assignData, error: assignErr } = await supabase
        .from('company_modules')
        .select('*')
        .eq('is_enabled', true);

      if (assignErr) throw assignErr;

      const mapping: Record<string, string[]> = {};
      (assignData || []).forEach((row: any) => {
        if (!mapping[row.company_id]) mapping[row.company_id] = [];
        mapping[row.company_id].push(row.module_id);
      });

      const formattedCompanies: CompanyTenant[] = (compData || []).map((c: any) => ({
        id: c.id,
        code: c.code,
        name: c.name,
        taxCode: c.tax_code,
        slogan: c.slogan,
        logoUrl: c.logo_url,
        plan: c.plan || 'standard',
        status: c.status || 'active',
        adminEmail: c.admin_email,
        adminPhone: c.admin_phone,
        maxUsers: c.max_users || 20,
        maxStorageGb: c.max_storage_gb || 10,
        startDate: c.start_date || '',
        expiryDate: c.expiry_date || '',
        createdAt: c.created_at,
        updatedAt: c.updated_at,
      }));

      const formattedModules: SystemModule[] = (modData || []).map((m: any) => ({
        id: m.id,
        name: repairMojibake(m.name),
        description: repairMojibake(m.description),
        category: repairMojibake(m.category),
        isCore: Boolean(m.is_core),
      }));

      set({
        companies: formattedCompanies,
        modules: formattedModules,
        companyModules: mapping,
        isLoading: false,
      });
    } catch (err: any) {
      console.error('Fetch SaaS Platform Data Error:', err);
      set({ error: err.message || 'Lỗi kết nối cơ sở dữ liệu', isLoading: false });
    }
  },

  createCompany: async (data, adminPassword = 'Password@123', initialModuleIds) => {
    try {
      // 1. Insert company into companies table
      const { data: insertedComp, error: compErr } = await supabase
        .from('companies')
        .insert({
          code: data.code.toUpperCase().trim(),
          name: data.name.trim(),
          tax_code: data.taxCode?.trim() || null,
          slogan: data.slogan?.trim() || null,
          plan: data.plan,
          status: data.status,
          admin_email: data.adminEmail.trim().toLowerCase(),
          admin_phone: data.adminPhone?.trim() || null,
          max_users: data.maxUsers,
          max_storage_gb: data.maxStorageGb,
          start_date: data.startDate || new Date().toISOString().slice(0, 10),
          expiry_date: data.expiryDate || null,
        })
        .select()
        .single();

      if (compErr) throw compErr;

      const newCompanyId = insertedComp.id;

      // 2. Assign modules
      const modulesToEnable = initialModuleIds && initialModuleIds.length > 0 
        ? initialModuleIds 
        : get().modules.map(m => m.id);

      if (modulesToEnable.length > 0) {
        const moduleRows = modulesToEnable.map(modId => ({
          company_id: newCompanyId,
          module_id: modId,
          is_enabled: true,
          start_date: data.startDate || new Date().toISOString().slice(0, 10),
          expiry_date: data.expiryDate || null,
        }));

        await supabase.from('company_modules').insert(moduleRows);
      }

      // 3. Create initial Company Admin user in engineers table
      const adminUsername = data.adminEmail.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
      await supabase.from('engineers').insert({
        company_id: newCompanyId,
        username: adminUsername,
        name: `Admin - ${data.name}`,
        email: data.adminEmail.trim().toLowerCase(),
        phone: data.adminPhone || '',
        title: 'Giám đốc / Quản trị công ty',
        role: 'Quản trị viên',
        company_role: 'company_admin',
        platform_role: 'user',
        password: adminPassword,
        account_status: 'ACTIVE',
        is_active: true,
      });

      await get().fetchData();
      return { ok: true };
    } catch (err: any) {
      console.error('Create company error:', err);
      return { ok: false, error: err.message || 'Không thể tạo công ty' };
    }
  },

  updateCompany: async (id, patch) => {
    try {
      const dbPatch: any = {
        updated_at: new Date().toISOString(),
      };
      if (patch.code) dbPatch.code = patch.code.toUpperCase().trim();
      if (patch.name) dbPatch.name = patch.name.trim();
      if (patch.taxCode !== undefined) dbPatch.tax_code = patch.taxCode;
      if (patch.slogan !== undefined) dbPatch.slogan = patch.slogan;
      if (patch.plan) dbPatch.plan = patch.plan;
      if (patch.status) dbPatch.status = patch.status;
      if (patch.adminEmail) dbPatch.admin_email = patch.adminEmail.trim().toLowerCase();
      if (patch.adminPhone !== undefined) dbPatch.admin_phone = patch.adminPhone;
      if (patch.maxUsers) dbPatch.max_users = patch.maxUsers;
      if (patch.maxStorageGb) dbPatch.max_storage_gb = patch.maxStorageGb;
      if (patch.startDate) dbPatch.start_date = patch.startDate;
      if (patch.expiryDate !== undefined) dbPatch.expiry_date = patch.expiryDate;

      const { error } = await supabase.from('companies').update(dbPatch).eq('id', id);
      if (error) throw error;

      await get().fetchData();
      return { ok: true };
    } catch (err: any) {
      console.error('Update company error:', err);
      return { ok: false, error: err.message };
    }
  },

  deleteCompany: async (id) => {
    try {
      const { error } = await supabase.from('companies').delete().eq('id', id);
      if (error) throw error;

      await get().fetchData();
      return { ok: true };
    } catch (err: any) {
      console.error('Delete company error:', err);
      return { ok: false, error: err.message };
    }
  },

  toggleCompanyModule: async (companyId, moduleId, enabled) => {
    try {
      const { error } = await supabase
        .from('company_modules')
        .upsert(
          {
            company_id: companyId,
            module_id: moduleId,
            is_enabled: enabled,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'company_id,module_id' }
        );

      if (error) throw error;

      // Update local state immediately
      set((state) => {
        const currentMods = new Set(state.companyModules[companyId] || []);
        if (enabled) currentMods.add(moduleId);
        else currentMods.delete(moduleId);

        return {
          companyModules: {
            ...state.companyModules,
            [companyId]: Array.from(currentMods),
          },
        };
      });
    } catch (err) {
      console.error('Toggle company module error:', err);
    }
  },
}));
