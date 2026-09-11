import { NextResponse } from 'next/server';
import { getCatalogProducts } from '@/lib/products';
import { getAdminOrders, getAdminRequests } from '@/lib/adminCommerce';
import { getAdminProfiles } from '@/lib/adminPeople';
import { getAdminSitePages } from '@/lib/sitePages';

export const dynamic = 'force-dynamic';

export async function GET() {
  const [products, orders, requests, users, pages] = await Promise.all([getCatalogProducts(), getAdminOrders(), getAdminRequests(), getAdminProfiles(), getAdminSitePages()]);
  const items = [
    ...products.map((product) => ({ id: `product-${product.slug}`, title: product.title, detail: `${product.category || 'Без категории'} · ${product.price} BYN`, href: `/admin/products?edit=${encodeURIComponent(product.slug)}`, type: 'Товар' })),
    ...orders.map((order) => ({ id: `order-${order.id}`, title: `Заказ #${String(order.id).slice(0, 8)}`, detail: `${order.customer?.name || order.customer?.phone || 'Клиент'} · ${order.status || 'Новый'}`, href: '/admin/orders', type: 'Заказ' })),
    ...requests.map((request) => ({ id: `request-${request.id}`, title: request.product_title || request.type || request.kind || 'Заявка', detail: `${request.customer?.name || request.customer?.phone || 'Клиент'} · ${request.status || 'Новая'}`, href: '/admin/requests', type: 'Заявка' })),
    ...users.map((user) => ({ id: `user-${user.id}`, title: user.full_name || user.email || 'Пользователь', detail: user.email || user.phone || 'Пользователь', href: '/admin/customers', type: 'Клиент' })),
    ...pages.map((page) => ({ id: `page-${page.id || page.slug}`, title: page.title || page.slug || 'Страница', detail: 'CMS-страница', href: '/admin/pages', type: 'Страница' }))
  ];
  return NextResponse.json({ items });
}
