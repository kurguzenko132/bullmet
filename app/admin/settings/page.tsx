import { AdminTelegramTestButton } from '@/components/AdminTelegramTestButton';
import { isSupabaseConfigured } from '@/lib/serverSupabase';
import { getTelegramDiagnostics } from '@/lib/notifications';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Настройки | Админка Bullmet' };

export default function AdminSettings() {
  const telegram = getTelegramDiagnostics();
  const supabaseConfigured = isSupabaseConfigured();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || '';
  const adminEmailConfigured = Boolean(process.env.NEXT_PUBLIC_ADMIN_EMAIL || process.env.NEXT_PUBLIC_ADMIN_EMAILS);

  return (
    <div className="admin-dashboard-pro admin-settings-page">
      <div className="admin-page-head">
        <div>
          <p>Настройки</p>
          <h1>Настройки и диагностика</h1>
          <span>Проверка Supabase, Telegram-уведомлений и основных переменных для production.</span>
        </div>
        <div className="admin-head-actions">
          <a href="/api/admin/diagnostics" target="_blank">JSON диагностика ↗</a>
        </div>
      </div>

      <section className="admin-settings-status-grid">
        <article className={supabaseConfigured ? 'is-ok' : 'is-bad'}>
          <span>Supabase</span>
          <b>{supabaseConfigured ? 'Подключен' : 'Не подключен'}</b>
          <em>{supabaseConfigured ? 'Заказы, заявки и товары могут сохраняться в базе' : 'Проверьте URL, anon key и service role key'}</em>
        </article>
        <article className={telegram.configured ? 'is-ok' : 'is-bad'}>
          <span>Telegram</span>
          <b>{telegram.configured ? 'Подключен' : 'Не настроен'}</b>
          <em>{telegram.configured ? `${telegram.chatIdsCount} чат(ов) для уведомлений` : 'Нужны TELEGRAM_BOT_TOKEN и TELEGRAM_CHAT_IDS'}</em>
        </article>
        <article className={adminEmailConfigured ? 'is-ok' : 'is-bad'}>
          <span>Администратор</span>
          <b>{adminEmailConfigured ? 'Email задан' : 'Email не задан'}</b>
          <em>NEXT_PUBLIC_ADMIN_EMAIL или NEXT_PUBLIC_ADMIN_EMAILS</em>
        </article>
        <article className={siteUrl ? 'is-ok' : 'is-warn'}>
          <span>Сайт</span>
          <b>{siteUrl ? 'URL задан' : 'URL не задан'}</b>
          <em>{siteUrl || 'NEXT_PUBLIC_SITE_URL нужен для SEO и ссылок'}</em>
        </article>
      </section>

      <section className="admin-dashboard-grid two">
        <div className="admin-panel-card">
          <div className="admin-card-title">
            <h2>Telegram уведомления</h2>
            <span>Проверка заказов и заявок</span>
          </div>

          <div className="admin-diagnostics-list">
            <p><b>Токен:</b> {telegram.tokenConfigured ? `задан (${telegram.maskedToken})` : 'не задан'}</p>
            <p><b>Чаты:</b> {telegram.chatIdsConfigured ? telegram.maskedChatIds.join(', ') : 'не заданы'}</p>
            <p><b>Переменная chat id:</b> {telegram.envNames.chatIds}</p>
          </div>

          <AdminTelegramTestButton />

          <div className="admin-help-note">
            <b>Как проверить:</b>
            <span>Нажмите кнопку теста. Если сообщение пришло в Telegram, новые заказы и заявки тоже будут приходить.</span>
          </div>
        </div>

        <div className="admin-panel-card">
          <div className="admin-card-title">
            <h2>Environment Variables</h2>
            <span>Добавить локально и в Vercel</span>
          </div>
          <div className="admin-env-list admin-env-list--extended">
            <code>NEXT_PUBLIC_SUPABASE_URL</code>
            <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code>
            <code>SUPABASE_SERVICE_ROLE_KEY</code>
            <code>NEXT_PUBLIC_SUPABASE_PRODUCT_IMAGES_BUCKET=product-images</code>
            <code>NEXT_PUBLIC_SUPABASE_REQUEST_FILES_BUCKET=request-files</code>
            <code>NEXT_PUBLIC_ADMIN_EMAIL=ваш_email</code>
            <code>NEXT_PUBLIC_SITE_URL=https://ваш-домен.by</code>
            <code>TELEGRAM_BOT_TOKEN=токен_бота</code>
            <code>TELEGRAM_CHAT_IDS=id_чата,id_второго_чата</code>
          </div>
        </div>
      </section>

      <section className="admin-panel-card admin-settings-checklist">
        <div className="admin-card-title">
          <h2>Проверка перед запуском</h2>
          <span>Мини-чеклист</span>
        </div>
        <div className="admin-checklist">
          <p><b>1</b> Создать Telegram-бота через BotFather и добавить TELEGRAM_BOT_TOKEN в Vercel.</p>
          <p><b>2</b> Узнать chat id, добавить TELEGRAM_CHAT_IDS в Vercel.</p>
          <p><b>3</b> Нажать “Отправить тест в Telegram”.</p>
          <p><b>4</b> Оформить тестовый заказ через /cart и проверить /admin/orders.</p>
          <p><b>5</b> Отправить тестовую заявку через /services#request и проверить /admin/requests.</p>
        </div>
      </section>
    </div>
  );
}
