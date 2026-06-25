'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, CheckCircle2, ClipboardCheck, ExternalLink, RefreshCw, Rocket, ShieldCheck } from 'lucide-react';
import type { AuditReport, BackupOverview } from '@/lib/adminBackup';

type LaunchCheck = {
  id: string;
  group: string;
  title: string;
  description: string;
  href?: string;
  adminHref?: string;
  critical?: boolean;
};

const launchChecks: LaunchCheck[] = [
  {
    id: 'home-open',
    group: 'Публичный сайт',
    title: 'Главная открывается',
    description: 'Открой главную, проверь hero, преимущества, популярные товары, баннеры и футер.',
    href: '/',
    adminHref: '/admin/homepage',
    critical: true
  },
  {
    id: 'catalog-open',
    group: 'Публичный сайт',
    title: 'Каталог открывается',
    description: 'Проверь фильтры, категории, карточки, цены, рейтинг, корзину и отсутствие скрытых категорий.',
    href: '/catalog',
    adminHref: '/admin/categories',
    critical: true
  },
  {
    id: 'product-open',
    group: 'Публичный сайт',
    title: 'Карточка товара открывается',
    description: 'Открой любой товар из каталога: фото, миниатюры, цена, отзывы, покупка и мобильная панель.',
    href: '/catalog',
    adminHref: '/admin/products',
    critical: true
  },
  {
    id: 'cart-order',
    group: 'Заказ',
    title: 'Тестовый заказ из корзины',
    description: 'Добавь товар в корзину, оформи тестовый заказ и проверь, что он появился в /admin/orders.',
    href: '/cart',
    adminHref: '/admin/orders',
    critical: true
  },
  {
    id: 'quick-order',
    group: 'Заказ',
    title: 'Быстрый заказ / Купить в 1 клик',
    description: 'Проверь быстрый заказ с карточки товара и появление обращения в заявках или заказах.',
    href: '/catalog',
    adminHref: '/admin/requests'
  },
  {
    id: 'service-request',
    group: 'Заявки',
    title: 'Заявка на расчет',
    description: 'Если услуги включены, отправь заявку с формы и проверь, что она пришла в админку.',
    href: '/services',
    adminHref: '/admin/requests'
  },
  {
    id: 'review-submit',
    group: 'Отзывы',
    title: 'Отзыв на товар',
    description: 'Оставь тестовый отзыв, проверь автопубликацию, фото и возможность скрыть отзыв в админке.',
    href: '/catalog',
    adminHref: '/admin/reviews'
  },
  {
    id: 'media-upload',
    group: 'Контент',
    title: 'Загрузка фото в медиатеку',
    description: 'Загрузи тестовое изображение в /admin/media и скопируй ссылку.',
    adminHref: '/admin/media'
  },
  {
    id: 'banner-check',
    group: 'Контент',
    title: 'Баннеры и акции',
    description: 'Включи тестовый баннер, проверь отображение на главной, затем выключи если акция не нужна.',
    href: '/',
    adminHref: '/admin/banners'
  },
  {
    id: 'seo-robots',
    group: 'SEO',
    title: 'robots.txt',
    description: 'Открой robots.txt, проверь, что /admin закрыт, а нужные публичные страницы доступны.',
    href: '/robots.txt',
    adminHref: '/admin/settings',
    critical: true
  },
  {
    id: 'seo-sitemap',
    group: 'SEO',
    title: 'sitemap.xml',
    description: 'Открой sitemap.xml, проверь, что скрытые услуги и категории туда не попали.',
    href: '/sitemap.xml',
    adminHref: '/admin/categories',
    critical: true
  },
  {
    id: 'roles-manager',
    group: 'Доступы',
    title: 'Роль manager',
    description: 'Проверь, что manager видит только заказы, заявки, отзывы, покупателей, статистику и отчеты.',
    adminHref: '/admin/users'
  },
  {
    id: 'roles-content',
    group: 'Доступы',
    title: 'Роль content_manager',
    description: 'Проверь, что content_manager видит контентные разделы и не видит пользователей/настройки.',
    adminHref: '/admin/users'
  },
  {
    id: 'backup-export',
    group: 'Безопасность',
    title: 'Резервная копия',
    description: 'Скачай полный JSON и отдельно товары/заказы в CSV перед реальным запуском.',
    adminHref: '/admin/backup',
    critical: true
  },
  {
    id: 'mobile-check',
    group: 'Мобильная версия',
    title: 'Проверка с телефона',
    description: 'Проверь главную, каталог, карточку товара, корзину и админку на мобильной ширине.',
    href: '/',
    critical: true
  }
];

function readStoredState() {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(window.localStorage.getItem('bullmet_launch_checks') || '{}') as Record<string, boolean>;
  } catch {
    return {};
  }
}

function statusIcon(done: boolean, critical?: boolean) {
  if (done) return <CheckCircle2 size={19} />;
  if (critical) return <AlertTriangle size={19} />;
  return <ClipboardCheck size={19} />;
}

export function AdminLaunchTestClient({ initialOverview, initialAudit }: { initialOverview: BackupOverview; initialAudit: AuditReport }) {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [overview, setOverview] = useState(initialOverview);
  const [audit, setAudit] = useState(initialAudit);
  const [activeGroup, setActiveGroup] = useState('Все');
  const [message, setMessage] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    setChecked(readStoredState());
  }, []);

  const groups = useMemo(() => ['Все', ...Array.from(new Set(launchChecks.map((item) => item.group)))], []);

  const visibleChecks = useMemo(() => {
    return launchChecks.filter((item) => activeGroup === 'Все' || item.group === activeGroup);
  }, [activeGroup]);

  const doneCount = launchChecks.filter((item) => checked[item.id]).length;
  const criticalCount = launchChecks.filter((item) => item.critical && !checked[item.id]).length;
  const progress = Math.round((doneCount / launchChecks.length) * 100);

  function toggle(id: string) {
    setChecked((current) => {
      const next = { ...current, [id]: !current[id] };
      try {
        window.localStorage.setItem('bullmet_launch_checks', JSON.stringify(next));
      } catch {}
      return next;
    });
  }

  function resetChecklist() {
    if (!confirm('Сбросить весь чек-лист запуска?')) return;
    setChecked({});
    try {
      window.localStorage.removeItem('bullmet_launch_checks');
    } catch {}
  }

  async function refreshAudit() {
    setRefreshing(true);
    setMessage('');

    try {
      const response = await fetch('/api/admin/backup', { cache: 'no-store' });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.message || 'Не удалось обновить аудит.');
      setOverview(data.overview);
      setAudit(data.audit);
      setMessage('Аудит обновлён.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Не удалось обновить аудит.');
    } finally {
      setRefreshing(false);
    }
  }

  return (
    <div className="admin-launch-page">
      <div className="admin-page-head">
        <div>
          <p>Боевой тест запуска</p>
          <h1>Проверка Bullmet перед публикацией</h1>
          <span>Пройди полный путь клиента, проверь админку, SEO, роли, заказы и резервную копию.</span>
        </div>
        <div className="admin-head-actions">
          <button type="button" onClick={refreshAudit} disabled={refreshing}><RefreshCw size={17} /> {refreshing ? 'Проверяем...' : 'Обновить аудит'}</button>
          <button type="button" onClick={resetChecklist}>Сбросить чек-лист</button>
        </div>
      </div>

      {message && <div className="admin-message">{message}</div>}

      <section className="admin-launch-scoreboard">
        <article className="admin-launch-progress-card">
          <div className={progress >= 90 && criticalCount === 0 ? 'is-ready' : progress >= 60 ? 'is-warn' : 'is-bad'}>
            <b>{progress}%</b>
            <span>чек-лист</span>
          </div>
          <section>
            <h2>{progress >= 90 && criticalCount === 0 ? 'Можно готовить запуск' : 'Ещё нужно проверить'}</h2>
            <p>Выполнено {doneCount} из {launchChecks.length}. Критичных непроверенных пунктов: {criticalCount}.</p>
          </section>
        </article>

        <article>
          <Rocket size={24} />
          <b>{audit.score}</b>
          <span>оценка аудита</span>
        </article>
        <article>
          <ShieldCheck size={24} />
          <b>{overview.products}</b>
          <span>товаров</span>
        </article>
        <article>
          <ClipboardCheck size={24} />
          <b>{overview.orders + overview.requests}</b>
          <span>заказов + заявок</span>
        </article>
      </section>

      <section className="admin-launch-warning">
        <AlertTriangle size={20} />
        <div>
          <b>Перед реальным запуском</b>
          <p>Сделай тестовый заказ, тестовую заявку, тестовый отзыв, скачай резервную копию и проверь sitemap/robots после деплоя на Vercel.</p>
        </div>
      </section>

      <section className="admin-launch-groups">
        {groups.map((group) => (
          <button key={group} type="button" className={activeGroup === group ? 'is-active' : ''} onClick={() => setActiveGroup(group)}>
            {group}
          </button>
        ))}
      </section>

      <section className="admin-launch-check-grid">
        {visibleChecks.map((item) => {
          const done = Boolean(checked[item.id]);

          return (
            <article key={item.id} className={`${done ? 'is-done' : ''} ${item.critical ? 'is-critical' : ''}`}>
              <button type="button" className="admin-launch-check-toggle" onClick={() => toggle(item.id)}>
                {statusIcon(done, item.critical)}
              </button>
              <div>
                <span>{item.group}{item.critical ? ' · критично' : ''}</span>
                <h2>{item.title}</h2>
                <p>{item.description}</p>
                <div className="admin-launch-check-actions">
                  {item.href && <Link href={item.href} target="_blank"><ExternalLink size={15} /> Открыть сайт</Link>}
                  {item.adminHref && <Link href={item.adminHref}><ExternalLink size={15} /> Открыть в админке</Link>}
                  <button type="button" onClick={() => toggle(item.id)}>{done ? 'Снять отметку' : 'Отметить выполненным'}</button>
                </div>
              </div>
            </article>
          );
        })}
      </section>

      <section className="admin-launch-final">
        <h2>Финальный порядок запуска</h2>
        <ol>
          <li>Скачать полный JSON в разделе резервного копирования.</li>
          <li>Проверить красные пункты в аудите.</li>
          <li>Сделать тестовый заказ и заявку.</li>
          <li>Проверить роли manager и content_manager.</li>
          <li>Проверить sitemap.xml и robots.txt на домене Vercel.</li>
          <li>Сделать commit, push и redeploy.</li>
          <li>После деплоя снова пройти этот чек-лист уже на production-ссылке.</li>
        </ol>
      </section>
    </div>
  );
}
