import { defineField } from 'sanity';

export const seoFields = [
  defineField({ name: 'title', title: 'SEO title', type: 'string', validation: (rule) => rule.max(70) }),
  defineField({ name: 'description', title: 'SEO description', type: 'text', rows: 3, validation: (rule) => rule.max(170) }),
  defineField({ name: 'noIndex', title: 'Не индексировать страницу', type: 'boolean', initialValue: false })
];

export const productLinkField = defineField({
  name: 'productSlug',
  title: 'Ссылка на товар (slug)',
  type: 'string',
  description: 'Только slug товара из Supabase. Не добавляйте сюда цену, наличие или остатки.',
  validation: (rule) => rule.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, { name: 'slug' })
});
