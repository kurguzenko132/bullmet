import { defineField, defineType } from 'sanity';
import { seoFields } from './shared';

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Настройки сайта',
  type: 'document',
  groups: [
    { name: 'general', title: 'Основное', default: true },
    { name: 'seo', title: 'SEO' }
  ],
  fields: [
    defineField({ name: 'companyName', title: 'Название компании', type: 'string', group: 'general', initialValue: 'Bullmet' }),
    defineField({ name: 'tagline', title: 'Короткое описание', type: 'string', group: 'general' }),
    defineField({ name: 'mainNavigation', title: 'Основное меню', type: 'array', group: 'general', of: [{
      type: 'object',
      fields: [
        defineField({ name: 'label', title: 'Название', type: 'string', validation: (rule) => rule.required() }),
        defineField({ name: 'href', title: 'Адрес', type: 'string', validation: (rule) => rule.required().custom((value) => value?.startsWith('/') || value?.startsWith('https://') || 'Используйте внутренний путь или https-ссылку') })
      ],
      preview: { select: { title: 'label', subtitle: 'href' } }
    }] }),
    defineField({ name: 'seo', title: 'SEO по умолчанию', type: 'object', group: 'seo', fields: seoFields })
  ],
  preview: { prepare: () => ({ title: 'Настройки сайта Bullmet' }) }
});
