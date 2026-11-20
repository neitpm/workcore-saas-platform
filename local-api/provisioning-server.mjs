import http from 'node:http';
import { createClient } from '@supabase/supabase-js';

const port = Number(process.env.PLATFORM_PROVISION_PORT || 55400);
const supabaseUrl = process.env.PLATFORM_SUPABASE_URL || 'http://127.0.0.1:55321';
const secretKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!secretKey) {
  console.error('Missing SUPABASE_SECRET_KEY or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const admin = createClient(supabaseUrl, secretKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const send = (res, status, body) => {
  const origin = res.req?.headers?.origin;
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': origin === 'http://localhost:3001' || origin === 'http://localhost:3002' || origin === 'http://localhost:3005' || origin === 'http://localhost:5173' || origin === 'http://localhost:5174'
      ? origin
      : 'http://localhost:3001',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'content-type, authorization',
  });
  res.end(JSON.stringify(body));
};

const readBody = (req) => new Promise((resolve, reject) => {
  let raw = '';
  req.on('data', (chunk) => { raw += chunk; });
  req.on('end', () => {
    try { resolve(JSON.parse(raw || '{}')); } catch (error) { reject(error); }
  });
  req.on('error', reject);
});

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') return send(res, 204, {});
  if (req.method === 'GET' && req.url?.startsWith('/company-entitlements')) {
    try {
      const query = new URLSearchParams((req.url || '').split('?')[1] || '');
      const companyId = query.get('companyId');
      const email = query.get('email')?.toLowerCase().trim();

      let resolvedCompanyId = companyId;
      if (!resolvedCompanyId && email) {
        const { data: user, error: userError } = await admin
          .from('company_users')
          .select('company_id')
          .eq('email', email)
          .eq('status', 'active')
          .maybeSingle();
        if (userError) throw userError;
        resolvedCompanyId = user?.company_id;
      }

      if (!resolvedCompanyId) return send(res, 400, { error: 'companyId or email is required' });

      const [{ data: company, error: companyError }, { data: assignments, error: moduleError }] = await Promise.all([
        admin.from('companies').select('*').eq('id', resolvedCompanyId).single(),
        admin.from('company_modules').select('module_id, is_enabled, start_date, expiry_date, modules(code, name, description)').eq('company_id', resolvedCompanyId).eq('is_enabled', true),
      ]);
      if (companyError) throw companyError;
      if (moduleError) throw moduleError;

      return send(res, 200, {
        companyId: resolvedCompanyId,
        company,
        modules: (assignments || []).map((item) => ({
          ...(item.modules || {}),
          isEnabled: item.is_enabled,
          startDate: item.start_date,
          expiryDate: item.expiry_date,
        })),
      });
    } catch (error) {
      return send(res, 500, { ok: false, error: error?.message || 'Entitlement lookup failed' });
    }
  }

  const settingsMatch = req.url?.match(/^\/api\/v1\/companies\/([^/]+)\/settings(?:\?.*)?$/);
  if (settingsMatch && (req.method === 'GET' || req.method === 'PUT')) {
    try {
      const companyId = settingsMatch[1];
      if (req.method === 'GET') {
        const [{ data, error }, { data: company, error: companyError }] = await Promise.all([
          admin.from('company_branding').select('*').eq('company_id', companyId).maybeSingle(),
          admin.from('companies').select('id, name, slogan, logo_url').eq('id', companyId).single(),
        ]);
        if (error) throw error;
        if (companyError) throw companyError;
        return send(res, 200, {
          company_id: companyId,
          name: company.name || data?.company_name || '',
          slogan: data?.company_slogan ?? company.slogan ?? '',
          logo_url: company.logo_url || data?.company_logo || '',
          hotline: data?.hotline || '', contact_email: data?.email || company.admin_email || '',
          address: data?.address || '', updated_at: data?.updated_at || null,
        });
      }

      const body = await readBody(req);
      const { data, error } = await admin.from('company_branding').upsert({
        company_id: companyId,
        company_name: body.name || '',
        company_slogan: body.slogan || null,
        company_logo: body.logo_url || null,
        hotline: body.hotline || null,
        email: body.contact_email || null,
        address: body.address || null,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'company_id' }).select('*').single();
      if (error) throw error;
      return send(res, 200, { settings: {
        company_id: data.company_id,
        name: data.company_name,
        slogan: data.company_slogan,
        logo_url: data.company_logo,
        hotline: data.hotline,
        contact_email: data.email,
        address: data.address,
        updated_at: data.updated_at,
      }});
    } catch (error) {
      return send(res, 500, { error: error?.message || 'Company settings failed' });
    }
  }

  const peopleMatch = req.url?.match(/^\/api\/v1\/companies\/([^/]+)\/people(?:\/([^/]+))?(?:\?.*)?$/);
  if (peopleMatch && ['GET', 'POST', 'PUT', 'DELETE'].includes(req.method || '')) {
    try {
      const companyId = peopleMatch[1];
      const personId = peopleMatch[2];
      if (req.method === 'GET') {
        const { data, error } = await admin.from('company_users').select('*').eq('company_id', companyId).order('created_at', { ascending: true });
        if (error) throw error;
        return send(res, 200, { people: (data || []).map((person) => ({ ...person, name: person.name || person.email })) });
      }
      if (req.method === 'POST') {
        const body = await readBody(req);
        if (!body.email?.trim()) return send(res, 400, { error: 'email is required' });
        const { data, error } = await admin.from('company_users').insert({
          company_id: companyId, email: body.email.toLowerCase().trim(), name: body.name || body.email,
          phone: body.phone || null, department: body.department || null, position: body.position || null,
          role: body.role || 'member', role_id: body.role_id || null, status: 'active', joined_at: body.joined_at || null,
          national_id: body.national_id || null, address: body.address || null,
          emergency_contact_name: body.emergency_contact_name || null, emergency_contact_phone: body.emergency_contact_phone || null,
          username: body.username || null,
        }).select('*').single();
        if (error) throw error;
        return send(res, 201, { ...data, name: data.name || data.email });
      }
      if (!personId) return send(res, 400, { error: 'person id is required' });
      if (req.method === 'PUT') {
        const body = await readBody(req);
        const { data, error } = await admin.from('company_users').update({ status: body.status }).eq('id', personId).eq('company_id', companyId).select('*').single();
        if (error) throw error;
        return send(res, 200, { ...data, name: data.name || data.email });
      }
      const { data: person, error: lookupError } = await admin.from('company_users').select('auth_user_id').eq('id', personId).eq('company_id', companyId).single();
      if (lookupError) throw lookupError;
      if (person?.auth_user_id) await admin.auth.admin.deleteUser(person.auth_user_id);
      const { error } = await admin.from('company_users').delete().eq('id', personId).eq('company_id', companyId);
      if (error) throw error;
      return send(res, 200, { ok: true });
    } catch (error) {
      return send(res, 500, { error: error?.message || 'People operation failed' });
    }
  }

  const auditMatch = req.url?.match(/^\/api\/v1\/companies\/([^/]+)\/audit-logs(?:\?(.*))?$/);
  if (auditMatch && (req.method === 'GET' || req.method === 'POST')) {
    try {
      const companyId = auditMatch[1];
      if (req.method === 'POST') {
        const body = await readBody(req);
        const { data, error } = await admin.from('platform_audit_logs').insert({
          company_id: companyId, action: body.action || 'unknown', resource_type: body.resource_type || null,
          resource_id: body.resource_id || null, metadata: body.metadata || {},
        }).select('*').single();
        if (error) throw error;
        return send(res, 201, { log: data });
      }
      const query = new URLSearchParams(auditMatch[2] || '');
      const limit = Math.min(Number(query.get('limit') || 20), 100);
      const offset = Math.max(Number(query.get('offset') || 0), 0);
      const { data, error } = await admin.from('platform_audit_logs').select('*', { count: 'exact' }).eq('company_id', companyId).order('created_at', { ascending: false }).range(offset, offset + limit - 1);
      if (error) throw error;
      return send(res, 200, { logs: data || [], total: data?.length || 0 });
    } catch (error) {
      return send(res, 500, { error: error?.message || 'Audit log operation failed' });
    }
  }

  if (req.method !== 'POST' || (req.url !== '/provision-company-admin' && req.url !== '/provision-company-user')) {
    return send(res, 404, { error: 'NOT_FOUND' });
  }

  try {
    const { companyId, email, password, name } = await readBody(req);
    const isCompanyUser = req.url === '/provision-company-user';
    const accountRole = isCompanyUser ? 'member' : 'company_admin';
    if (!companyId || !email || !password) {
      return send(res, 400, { error: 'companyId, email and password are required' });
    }

    let userData;
    const { data: createdUser, error: userError } = await admin.auth.admin.createUser({
      email: email.toLowerCase().trim(),
      password,
      email_confirm: true,
      user_metadata: { company_id: companyId, company_role: accountRole, name: name || email },
    });
    if (userError && userError.code !== 'email_exists' && !userError.message?.toLowerCase().includes('already been registered')) throw userError;
    if (createdUser?.user) {
      userData = createdUser;
    } else {
      const { data: users, error: listError } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
      if (listError) throw listError;
      const existing = users.users.find((user) => user.email?.toLowerCase() === email.toLowerCase().trim());
      if (!existing) throw userError || new Error('Existing Auth user could not be found');
      const { data: updated, error: updateError } = await admin.auth.admin.updateUserById(existing.id, {
        password, email_confirm: true, user_metadata: { company_id: companyId, company_role: accountRole, name: name || email },
      });
      if (updateError) throw updateError;
      userData = { user: updated.user };
    }

    const { error: linkError } = await admin.from('company_users').upsert({
      company_id: companyId,
      auth_user_id: userData.user.id,
      email: email.toLowerCase().trim(),
      role: accountRole,
      status: 'active',
    }, { onConflict: 'company_id,email' });
    if (linkError) throw linkError;

    return send(res, 200, { ok: true, userId: userData.user.id, companyId });
  } catch (error) {
    return send(res, 500, { ok: false, error: error?.message || 'Provisioning failed' });
  }
});

const host = process.env.PLATFORM_PROVISION_HOST || '0.0.0.0';
server.listen(port, host, () => {
  console.log(`Platform provisioning API listening on http://${host}:${port}`);
});
