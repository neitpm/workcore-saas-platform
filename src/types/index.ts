export interface CompanyTenant {
  id: string;
  code: string;
  name: string;
  taxCode?: string;
  slogan?: string;
  logoUrl?: string;
  plan: 'trial' | 'standard' | 'professional' | 'enterprise';
  status: 'active' | 'suspended' | 'expired';
  adminEmail: string;
  adminPhone?: string;
  maxUsers: number;
  maxStorageGb: number;
  startDate: string;
  expiryDate?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface SystemModule {
  id: string;
  name: string;
  description: string;
  category: string;
  isCore: boolean;
}

export interface CompanyModuleAssignment {
  id: string;
  companyId: string;
  moduleId: string;
  isEnabled: boolean;
  startDate: string;
  expiryDate?: string;
}

export interface PlatformUser {
  id: string;
  email: string;
  name: string;
  role: 'super_admin' | 'platform_operator';
}
