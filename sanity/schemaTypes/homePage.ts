import { defineField, defineType } from 'sanity';
import { productLinkField, seoFields } from './shared';

export const homePage = defineType({
  name: 'homePage',
  title: 'Главная страница',
  type: 'document',
  groups: [
    { name: 'hero', title: 'Первый экран', default: true },
    { name: 'content', title: 'Блоки' },
    { name: 'seo', title: 'SEO' }
  ],
  fields: [
    defineField({ name: 'eyebrow', title: 'Надзаголовок', type: 'string', group: 'hero' }),
    defineField({ name: 'title', title: 'Заголовок', type: 'string', group: 'hero', validation: (rule) => rule.required() }),
    defineField({ name: 'description', title: 'Описание', type: 'text', rows: 4, group: 'hero' }),
    defineField({ name: 'primaryCta', title: 'Основная кнопка', type: 'object', group: 'hero', fields: [
      defineField({ name: 'label', title: 'Текст', type: 'string' }),
      defineField({ name: 'href', title: 'Адрес', type: 'string' })
    ] }),
    defineField({ name: 'collectionLinks', title: 'Коллекции', type: 'array', group: 'content', of: [{
      type: 'object',
      fields: [
        defineField({ name: 'title', title: 'Название', type: 'string', validation: (rule) => rule.required() }),
        defineField({ name: 'description', title: 'Описание', type: 'string' }),
        defineField({ name: 'href', title: 'Адрес каталога', type: 'string' })
      ],
      preview: { select: { title: 'title', subtitle: 'description' } }
    }] }),
    defineField({ name: 'featuredProducts', title: 'Выбранные товары', type: 'array', group: 'content', of: [productLinkField] }),
    defineField({ name: 'faq', title: 'FAQ на главной', type: 'array', group: 'content', of: [{ type: 'reference', to: [{ type: 'faqItem' }] }] }),
    defineField({ name: 'seo', title: 'SEO', type: 'object', group: 'seo', fields: seoFields })
  ],
  preview: { prepare: () => ({ title: 'Главная страница' }) }
});
