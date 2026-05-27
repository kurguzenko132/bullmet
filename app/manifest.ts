import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Bullmet — изделия из металла и дерева',
    short_name: 'Bullmet',
    description: 'Каталог изделий Bullmet, быстрые заказы, заявки и статус заказа.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#e65a12',
    icons: [
      { src: '/assets/logo-mark.png', sizes: '192x192', type: 'image/png' },
      { src: '/assets/logo-mark.png', sizes: '512x512', type: 'image/png' },
    ],
  };
}
