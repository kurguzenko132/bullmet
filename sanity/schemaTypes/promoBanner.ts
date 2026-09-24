import { defineField, defineType } from 'sanity';
import { productLinkField } from './shared';

export const promoBanner = defineType({
  name: 'promoBanner',
  title: 'Промо-баннер',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Заголовок', type: 'string', validation: (rule) => rule.required() }),
    defineField({ name: 'body', title: 'Текст', type: 'text', rows: 3 }),
    defineField({ name: 'image', title: 'Изображение', type: 'image', options: { hotspot: true }, fields: [defineField({ name: 'alt', title: 'Описание изображения', type: 'string', validation: (rule) => rule.required() })] }),
    defineField({ name: 'ctaLabel', title: 'Текст кнопки', type: 'string' }),
    defineField({ name: 'href', title: 'Адрес кнопки', type: 'string' }),
    productLinkField,
    defineField({ name: 'enabled', title: 'Показывать', type: 'boolean', initialValue: true }),
    defineField({ name: 'startsAt', title: 'Начало показа', type: 'datetime' }),
    defineField({ name: 'endsAt', title: 'Окончание показа', type: 'datetime', validation: (rule) => rule.min(rule.valueOfField('startsAt')) })
  ],
  preview: { select: { title: 'title', media: 'image', enabled: 'enabled' }, prepare: ({ title, media, enabled }) => ({ title, media, subtitle: enabled ? 'Показывается' : 'Скрыт' }) }
});
