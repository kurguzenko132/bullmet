export { clockCatalogCategories, localFallbackProducts as products } from './products';

export const categories = [
  { title: 'Настенные часы', slug: 'nastennye-chasy', image: '/mockup/cat-clock.jpg' },
  { title: 'Садовая мебель', slug: 'sadovaya-mebel', image: '/mockup/cat-swing.jpg' },
  { title: 'Мебель для дома в стиле лофт', slug: 'mebel-loft', image: '/mockup/cat-custom.jpg' },
  { title: 'Лазерная резка', slug: 'lazernaya-rezka', image: '/mockup/cat-metal.jpg' },
  { title: 'Мелкий опт металлопроката', slug: 'metalloprokat-opt', image: '/mockup/cat-wood.jpg' },
  { title: 'Гибка металла', slug: 'gibka-metalla', image: '/mockup/service-metal.jpg' }
];

export const orders = [
  { id: '#1258', name: 'Иван Петров', status: 'Новый', total: 120 },
  { id: '#1257', name: 'Ольга Иванова', status: 'В обработке', total: 650 },
  { id: '#1256', name: 'Дмитрий Кузнецов', status: 'Оплачен', total: 180 }
];
