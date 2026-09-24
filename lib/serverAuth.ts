import { canAccessAdminPath, normalizeAdminRole, type AdminRole } from '@/lib/adminAccess';

export const serverSessionCookie = 'bullmet_server_session';

type AuthUser = { id: string; email?: string };

export type ServerAdminAccess = {
  user: AuthUser;
  role: AdminRole;
  status: 'active' | 'blocked';
};

function getToken(request: Request) {
  const authorization = request.headers.get('authorization') || '';
  const bearer = authorization.match(/^Bearer\s+(.+)$/i)?.[1];
  if (bearer) return bearer;

  const cookie = request.headers.get('cookie') || '';
  return cookie.split(';').map((item) => item.trim()).find((item) => item.startsWith(`${serverSessionCookie}=`))?.slice(serverSessionCookie.length + 1);
}

function config() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  return url && key ? { url: url.replace(/\/$/, ''), key } : null;
}

export async function getAuthenticatedUser(request: Request): Promise<AuthUser | null> {
  const token = getToken(request);
  const supabase = config();
  if (!token || !supabase) return null;

  const response = await fetch(`${supabase.url}/auth/v1/user`, {
    headers: { apikey: supabase.key, authorization: `Bearer ${token}` },
    cache: 'no-store'
  });
  if (!response.ok) return null;

  const user = await response.json().catch(() => null);
  return typeof user?.id === 'string' ? { id: user.id, email: typeof user.email === 'string' ? user.email : undefined } : null;
}

export async function getServerAdminAccess(request: Request): Promise<ServerAdminAccess | null> {
  const user = await getAuthenticatedUser(request);
  const supabase = config();
  if (!user || !supabase) return null;

  const query = new URLSearchParams({ select: 'role,status', id: `eq.${user.id}` });
  const response = await fetch(`${supabase.url}/rest/v1/profiles?${query}`, {
    headers: { apikey: supabase.key, authorization: request.headers.get('authorization') || `Bearer ${getToken(request)}` },
    cache: 'no-store'
  });
  if (!response.ok) return null;

  const [profile] = await response.json().catch(() => []);
  if (!profile || profile.status === 'blocked') return null;
  return { user, role: normalizeAdminRole(profile.role), status: 'active' };
}

export function canAccessAdminApi(role: AdminRole, pathname: string) {
  if (role === 'admin') return true;
  const suffix = pathname.replace(/^\/api/, '');
  const managerPaths = ['/admin/orders', '/admin/requests', '/admin/reviews', '/admin/customers', '/admin/stats', '/admin/reports', '/admin/search'];
  const contentPaths = ['/admin/homepage-control', '/admin/pages', '/admin/categories', '/admin/services-control', '/admin/production-control', '/admin/media', '/admin/banners', '/admin/products'];
  const pagePath = managerPaths.find((path) => suffix === path || suffix.startsWith(`${path}/`))
    || contentPaths.find((path) => suffix === path || suffix.startsWith(`${path}/`));
  return Boolean(pagePath && canAccessAdminPath(role, pagePath));
}
