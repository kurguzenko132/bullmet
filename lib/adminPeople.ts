import { serverSupabase } from './serverSupabase';
import { getAllAdminRows } from './adminPagination';
export { adminRoles, type AdminRole, roleLabel, roleClass, actionLabel, isStaffRole } from './adminAccess';

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

export type AdminCustomerRecord = {
  id: string;
  user_id?: string | null;
  full_name: string;
  phone?: string | null;
  normalized_phone?: string | null;
  email?: string | null;
  city?: string | null;
  address?: string | null;
  status?: 'new' | 'active' | 'inactive' | 'blocked' | string | null;
  source?: string | null;
  tags?: string[] | null;
  created_at?: string;
  updated_at?: string;
};

export type AdminCustomerNote = {
  id: string;
  customer_id: string;
  text: string;
  created_by?: string | null;
  created_at?: string;
  updated_at?: string;
};

export async function getAdminProfiles() {
  if (!serverSupabase) return [] as AdminProfile[];

  try {
    return await getAllAdminRows<AdminProfile>('profiles', 'id, email, full_name, phone, role, status, created_at, updated_at');
  } catch (error) {
    console.error('Admin profiles load error:', error instanceof Error ? error.message : error);
    return [];
  }
}

export async function getAdminCustomerRecords() {
  if (!serverSupabase) return [] as AdminCustomerRecord[];
  try {
    return await getAllAdminRows<AdminCustomerRecord>('crm_customers', 'id, user_id, full_name, phone, normalized_phone, email, city, address, status, source, tags, created_at, updated_at', 'updated_at');
  } catch (error) {
    console.error('Admin customer records load error:', error instanceof Error ? error.message : error);
    return [];
  }
}

export async function getAdminActivityLog() {
  if (!serverSupabase) return [] as AdminActivityItem[];

  try {
    return await getAllAdminRows<AdminActivityItem>('admin_activity_log', 'id, created_at, actor_email, action, entity, entity_id, payload');
  } catch (error) {
    console.error('Admin activity log load error:', error instanceof Error ? error.message : error);
    return [];
  }
}
