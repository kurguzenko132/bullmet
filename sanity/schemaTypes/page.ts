import { defineField, defineType } from 'sanity';
import { seoFields } from './shared';

export const page = defineType({
  name: 'page',
  title: 'Статическая страница',
  type: 'document',
  groups: [{ name: 'content', title: 'Содержание', default: true }, { name: 'seo', title: 'SEO' }],
  fields: [
    defineField({ name: 'title', title: 'Заголовок', type: 'string', group: 'content', validation: (rule) => rule.required() }),
    defineField({ name: 'slug', title: 'Адрес страницы', type: 'slug', group: 'content', options: { source: 'title', maxLength: 96 }, validation: (rule) => rule.required() }),
    defineField({ name: 'excerpt', title: 'Краткое описание', type: 'text', rows: 3, group: 'content' }),
    defineField({ name: 'content', title: 'Содержание', type: 'array', group: 'content', of: [{ type: 'block' }, { type: 'image', options: { hotspot: true }, fields: [defineField({ name: 'alt', title: 'Описание изображения', type: 'string', validation: (rule) => rule.required() })] }] }),
    defineField({ name: 'seo', title: 'SEO', type: 'object', group: 'seo', fields: seoFields })
  ],
  preview: { select: { title: 'title', subtitle: 'slug.current' } }
});
