import { NextRequest, NextResponse } from 'next/server';
import { canAccessAdminApi, getServerAdminAccess } from '@/lib/serverAuth';
import { canAccessAdminPath } from '@/lib/adminAccess';
import { getSiteControlSettings } from '@/lib/siteControl';

function denied(request: NextRequest, status: 401 | 403) {
  if (request.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.json({ ok: false, message: status === 401 ? 'Требуется авторизация.' : 'Недостаточно прав.' }, { status });
  }
  const login = new URL('/login', request.url);
  login.searchParams.set('next', `${request.nextUrl.pathname}${request.nextUrl.search}`);
  return NextResponse.redirect(login);
}

function nextWithRobots(pathname: string) {
  const response = NextResponse.next();
  if (/^\/(admin|account|login|forgot-password|reset-password|auth|profile|cabinet|lk|order-success|checkout|cart)(?:\/|$)/.test(pathname)) response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  return response;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAdminPath = pathname.startsWith('/admin/') || pathname === '/admin' || pathname.startsWith('/api/admin/');
  if (isAdminPath) {
    const access = await getServerAdminAccess(request);
    if (!access) return denied(request, 401);

    const allowed = pathname.startsWith('/api/admin/')
      ? canAccessAdminApi(access.role, pathname)
      : canAccessAdminPath(access.role, pathname);
    return allowed ? NextResponse.next() : denied(request, 403);
  }

  if (pathname === '/maintenance' || pathname.startsWith('/studio') || pathname.startsWith('/login') || pathname.startsWith('/auth/') || pathname.startsWith('/reset-password')) return nextWithRobots(pathname);

  const settings = await getSiteControlSettings();
  if (!settings.adminSettings.site.maintenance) return nextWithRobots(pathname);
  if (pathname === '/api/orders' || pathname === '/api/requests') {
    return NextResponse.json({ ok: false, message: 'Сайт находится на техническом обслуживании. Новые обращения временно не принимаются.' }, { status: 503 });
  }
  if (pathname.startsWith('/api/')) return NextResponse.next();
  return NextResponse.rewrite(new URL('/maintenance', request.url));
}

export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico|assets/).*)'] };
