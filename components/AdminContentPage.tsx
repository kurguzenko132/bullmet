'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { AdminLayout } from './AdminLayout';
import {
  defaultSiteContent,
  readSiteContentAsync,
  saveSiteContentAsync,
  SiteContentSettings,
  SiteFaqItem,
} from './siteSettings';

type TextFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  textarea?: boolean;
};

function TextField({ label, value, onChange, placeholder, textarea }: TextFieldProps) {
  return (
    <label className={textarea ? 'adminTextAreaLabel' : ''}>
      {label}
      {textarea ? (
        <textarea value={value} placeholder={placeholder} rows={4} onChange={(event) => onChange(event.target.value)} />
      ) : (
        <input value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} />
      )}
    </label>
  );
}

function cloneContent(content: SiteContentSettings): SiteContentSettings {
  return {
    ...content,
    contacts: { ...content.contacts },
    pages: { ...content.pages },
    faq: content.faq.map((item) => ({ ...item })),
  };
}

export function AdminContentPage() {
  const [content, setContent] = useState<SiteContentSettings>(defaultSiteContent);
  const [activeTab, setActiveTab] = useState<'main' | 'contacts' | 'pages' | 'faq'>('main');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    readSiteContentAsync().then(setContent);
  }, []);

  const previewPhoneHref = useMemo(() => {
    const digits = content.contacts.phone.replace(/[^+\d]/g, '');
    return digits ? `tel:${digits}` : defaultSiteContent.contacts.phoneHref;
  }, [content.contacts.phone]);

  function updateField<K extends keyof SiteContentSettings>(field: K, value: SiteContentSettings[K]) {
    setContent((current) => ({ ...current, [field]: value }));
  }

  function updateContact(field: keyof SiteContentSettings['contacts'], value: string) {
    setContent((current) => ({ ...current, contacts: { ...current.contacts, [field]: value } }));
  }

  function updatePage(field: keyof SiteContentSettings['pages'], value: string) {
    setContent((current) => ({ ...current, pages: { ...current.pages, [field]: value } }));
  }

  function updateFaq(index: number, field: keyof SiteFaqItem, value: string) {
    setContent((current) => ({
      ...current,
      faq: current.faq.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item),
    }));
  }

  function addFaq() {
    setContent((current) => ({ ...current, faq: [...current.faq, { question: '', answer: '' }] }));
    setActiveTab('faq');
  }

  function removeFaq(index: number) {
    setContent((current) => ({ ...current, faq: current.faq.filter((_, itemIndex) => itemIndex !== index) }));
  }

  function resetContent() {
    setContent(cloneContent(defaultSiteContent));
    setMessage('Стандартные значения подставлены в форму. Нажмите “Сохранить”, чтобы применить их на сайте.');
    setError('');
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');
    setError('');
    setIsSaving(true);

    try {
      const nextContent = await saveSiteContentAsync({
        ...content,
        contacts: {
          ...content.contacts,
          phoneHref: content.contacts.phoneHref.trim() || previewPhoneHref,
        },
      });
      setContent(nextContent);
      setMessage('Контент сайта сохранен. Изменения появятся на сайте после обновления страницы.');
    } catch (saveError) {
      console.error(saveError);
      setError(saveError instanceof Error ? saveError.message : 'Не удалось сохранить настройки контента.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <AdminLayout title="Контент сайта">
      <main className="adminContent adminSiteContentPage">
        <div className="adminPageHead">
          <div>
            <p>Контент / Настройки сайта</p>
            <h2>Тексты, контакты, соцсети и FAQ</h2>
          </div>
          <div className="adminContentActions">
            <button className="adminSecondaryBtn" type="button" onClick={resetContent}>Вернуть стандартные тексты</button>
            <button className="adminPrimaryBtn" type="submit" form="site-content-form" disabled={isSaving}>{isSaving ? 'Сохраняем...' : 'Сохранить'}</button>
          </div>
        </div>

        <div className="adminContentNotice">
          <strong>Теперь базовый контент можно менять без кода.</strong>
          <span>Главный экран, footer, контакты, соцсети, SEO-тексты для страниц и FAQ сохраняются в Supabase `site_settings`.</span>
        </div>

        <form className="adminContentEditor" id="site-content-form" onSubmit={submit}>
          <aside className="adminContentTabs" aria-label="Разделы контента">
            <button type="button" className={activeTab === 'main' ? 'active' : ''} onClick={() => setActiveTab('main')}>Главная и footer</button>
            <button type="button" className={activeTab === 'contacts' ? 'active' : ''} onClick={() => setActiveTab('contacts')}>Контакты и соцсети</button>
            <button type="button" className={activeTab === 'pages' ? 'active' : ''} onClick={() => setActiveTab('pages')}>Страницы</button>
            <button type="button" className={activeTab === 'faq' ? 'active' : ''} onClick={() => setActiveTab('faq')}>FAQ</button>
          </aside>

          <section className="adminContentPanel">
            {activeTab === 'main' && (
              <div className="adminCard adminContentCard">
                <div className="adminContentSectionHead">
                  <h3>Главная страница и подвал</h3>
                  <p>Эти поля уже подключены к главной странице и footer сайта.</p>
                </div>
                <div className="adminFormGrid adminFormGrid--two">
                  <TextField label="Подпись под логотипом" value={content.brandSubtitle} onChange={(value) => updateField('brandSubtitle', value)} />
                  <TextField label="Текст в footer" value={content.footerText} onChange={(value) => updateField('footerText', value)} />
                </div>
                <TextField textarea label="Заголовок главного экрана" value={content.homeHeroTitle} onChange={(value) => updateField('homeHeroTitle', value)} />
                <TextField textarea label="Описание главного экрана" value={content.homeHeroText} onChange={(value) => updateField('homeHeroText', value)} />
                <div className="adminFormGrid adminFormGrid--two">
                  <TextField label="Текст основной кнопки" value={content.homePrimaryButton} onChange={(value) => updateField('homePrimaryButton', value)} />
                  <TextField label="Текст второй кнопки" value={content.homeSecondaryButton} onChange={(value) => updateField('homeSecondaryButton', value)} />
                </div>
              </div>
            )}

            {activeTab === 'contacts' && (
              <div className="adminCard adminContentCard">
                <div className="adminContentSectionHead">
                  <h3>Контакты и быстрые ссылки</h3>
                  <p>Контактные данные используются в footer и подготовлены для страницы контактов.</p>
                </div>
                <div className="adminFormGrid adminFormGrid--two">
                  <TextField label="Телефон" value={content.contacts.phone} onChange={(value) => updateContact('phone', value)} />
                  <TextField label="Ссылка телефона" value={content.contacts.phoneHref} placeholder={previewPhoneHref} onChange={(value) => updateContact('phoneHref', value)} />
                  <TextField label="Email" value={content.contacts.email} onChange={(value) => updateContact('email', value)} />
                  <TextField label="Время работы" value={content.contacts.worktime} onChange={(value) => updateContact('worktime', value)} />
                </div>
                <TextField label="Адрес" value={content.contacts.address} onChange={(value) => updateContact('address', value)} />
                <div className="adminFormGrid adminFormGrid--three">
                  <TextField label="Telegram URL" value={content.contacts.telegramUrl} onChange={(value) => updateContact('telegramUrl', value)} />
                  <TextField label="WhatsApp URL" value={content.contacts.whatsappUrl} onChange={(value) => updateContact('whatsappUrl', value)} />
                  <TextField label="Instagram URL" value={content.contacts.instagramUrl} onChange={(value) => updateContact('instagramUrl', value)} />
                </div>
              </div>
            )}

            {activeTab === 'pages' && (
              <div className="adminCard adminContentCard">
                <div className="adminContentSectionHead">
                  <h3>Основные страницы</h3>
                  <p>Здесь хранятся короткие SEO-тексты и hero-описания. Следующим этапом можно подключить редактирование всех блоков страниц.</p>
                </div>
                <div className="adminEditablePageList">
                  <article>
                    <h4>Производство</h4>
                    <TextField label="Заголовок" value={content.pages.productionTitle} onChange={(value) => updatePage('productionTitle', value)} />
                    <TextField textarea label="Описание" value={content.pages.productionDescription} onChange={(value) => updatePage('productionDescription', value)} />
                  </article>
                  <article>
                    <h4>Услуги</h4>
                    <TextField label="Заголовок" value={content.pages.servicesTitle} onChange={(value) => updatePage('servicesTitle', value)} />
                    <TextField textarea label="Описание" value={content.pages.servicesDescription} onChange={(value) => updatePage('servicesDescription', value)} />
                  </article>
                  <article>
                    <h4>О компании</h4>
                    <TextField label="Заголовок" value={content.pages.aboutTitle} onChange={(value) => updatePage('aboutTitle', value)} />
                    <TextField textarea label="Описание" value={content.pages.aboutDescription} onChange={(value) => updatePage('aboutDescription', value)} />
                  </article>
                  <article>
                    <h4>Контакты</h4>
                    <TextField label="Заголовок" value={content.pages.contactsTitle} onChange={(value) => updatePage('contactsTitle', value)} />
                    <TextField textarea label="Описание" value={content.pages.contactsDescription} onChange={(value) => updatePage('contactsDescription', value)} />
                  </article>
                </div>
              </div>
            )}

            {activeTab === 'faq' && (
              <div className="adminCard adminContentCard">
                <div className="adminContentSectionHead adminContentSectionHead--row">
                  <div>
                    <h3>FAQ</h3>
                    <p>Частые вопросы можно использовать на SEO-страницах, в заявке и на будущей странице помощи.</p>
                  </div>
                  <button className="adminSecondaryBtn" type="button" onClick={addFaq}>Добавить вопрос</button>
                </div>
                <div className="adminFaqEditor">
                  {content.faq.map((item, index) => (
                    <article key={index}>
                      <div className="adminFaqEditor__top">
                        <strong>Вопрос {index + 1}</strong>
                        <button type="button" onClick={() => removeFaq(index)}>Удалить</button>
                      </div>
                      <TextField label="Вопрос" value={item.question} onChange={(value) => updateFaq(index, 'question', value)} />
                      <TextField textarea label="Ответ" value={item.answer} onChange={(value) => updateFaq(index, 'answer', value)} />
                    </article>
                  ))}
                  {!content.faq.length && <div className="adminEmptyState"><b>Вопросов пока нет</b><p>Добавьте первый FAQ, чтобы использовать его в SEO-блоках.</p></div>}
                </div>
              </div>
            )}

            {message && <p className="adminSuccessMessage">{message}</p>}
            {error && <p className="adminUploadError">{error}</p>}
          </section>
        </form>
      </main>
    </AdminLayout>
  );
}
