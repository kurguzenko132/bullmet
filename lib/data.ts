export const categories = [
  { title: 'Настенные часы', slug: 'nastennye-chasy', image: '/product-clock.svg' },
  { title: 'Садовая мебель', slug: 'sadovaya-mebel', image: '/product-swing.svg' },
  { title: 'Мебель для дома в стиле лофт', slug: 'mebel-loft', image: '/hero-cutting.svg' },
  { title: 'Лазерная резка', slug: 'lazernaya-rezka', image: '/service-metal.svg' },
  { title: 'Мелкий опт металлопроката', slug: 'metalloprokat-opt', image: '/service-wood.svg' },
  { title: 'Гибка металла', slug: 'gibka-metalla', image: '/service-metal.svg' }
];

export const products = [
  { slug: 'nastennye-chasy-loft', title: 'Настенные часы Loft', category: 'Часы', price: 120, image: '/product-clock.svg', description: 'Металл с элементами дерева, диаметр 60 см, собственное изготовление.' },
  { slug: 'sadovye-kacheli-bullmet', title: 'Садовые качели Bullmet', category: 'Качели', price: 650, image: '/product-swing.svg', description: 'Прочная металлическая рама, деревянное сиденье, под заказ.' },
  { slug: 'rezka-metalla', title: 'Резка металла под заказ', category: 'Услуги', price: 90, image: '/service-metal.svg', description: 'Лазерная и станочная резка деталей, табличек и декора.' },
  { slug: 'rezka-dereva', title: 'Резка дерева под заказ', category: 'Услуги', price: 70, image: '/service-wood.svg', description: 'Фигурная резка дерева для декора, панно и интерьерных элементов.' }
];

export const orders = [
  { id: '#1258', name: 'Иван Петров', status: 'Новый', total: 120 },
  { id: '#1257', name: 'Ольга Иванова', status: 'В обработке', total: 650 },
  { id: '#1256', name: 'Дмитрий Кузнецов', status: 'Оплачен', total: 180 }
];
