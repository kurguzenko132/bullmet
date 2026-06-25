import { serverSupabase } from './serverSupabase';
export { adminRoles, type AdminRole, roleLabel, roleClass, actionLabel } from './adminAccess';

export type AdminProfile = {
  id: string;
  email?: string | null;
  full_name?: string | null;
  phone?: string | null;
  role: string;
  status?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type AdminActivityItem = {
  id: string;
  created_at?: string;
  actor_email?: string | null;
  action: string;
  entity: string;
  entity_id?: string | null;
  payload?: Record<string, unknown>;
};

export async function getAdminProfiles() {
  if (!serverSupabase) return [] as AdminProfile[];

  const { data, error } = await serverSupabase
    .from('profiles')
    .select('id, email, full_name, phone, role, status, created_at, updated_at')
    .order('created_at', { ascending: false })
    .limit(500);

  if (error) {
    console.error('Admin profiles load error:', error.message);
    return [];
  }

  return (data || []) as AdminProfile[];
}

export async function getAdminActivityLog() {
  if (!serverSupabase) return [] as AdminActivityItem[];

  const { data, error } = await serverSupabase
    .from('admin_activity_log')
    .select('id, created_at, actor_email, action, entity, entity_id, payload')
    .order('created_at', { ascending: false })
    .limit(500);

  if (error) {
    console.error('Admin activity log load error:', error.message);
    return [];
  }

  return (data || []) as AdminActivityItem[];
}
