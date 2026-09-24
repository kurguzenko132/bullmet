import { defineField, defineType } from 'sanity';

export const faqItem = defineType({
  name: 'faqItem',
  title: 'Вопрос и ответ',
  type: 'document',
  fields: [
    defineField({ name: 'question', title: 'Вопрос', type: 'string', validation: (rule) => rule.required() }),
    defineField({ name: 'answer', title: 'Ответ', type: 'text', rows: 5, validation: (rule) => rule.required() }),
    defineField({ name: 'section', title: 'Раздел', type: 'string', options: { list: [{ title: 'Главная', value: 'home' }, { title: 'Общий', value: 'general' }] }, initialValue: 'general' }),
    defineField({ name: 'order', title: 'Порядок', type: 'number', initialValue: 0 })
  ],
  orderings: [{ title: 'По порядку', name: 'orderAsc', by: [{ field: 'order', direction: 'asc' }] }],
  preview: { select: { title: 'question', subtitle: 'section' } }
});
