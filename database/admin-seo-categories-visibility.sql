-- Admin SEO/categories/public visibility stage.
insert into public.site_settings (key, value)
values (
  'catalog_control',
  '{
    "enabled": true,
    "categories": [
      { "id": "clock-auto", "title": "Авто-мир", "slug": "Авто-мир", "kind": "clock", "visible": true, "order": 1, "description": "Часы автомобильной тематики", "image": "/mockup/cat-clock.jpg" },
      { "id": "clock-barber", "title": "Барбершоп, парикмахерская", "slug": "Барбершоп, парикмахерская", "kind": "clock", "visible": true, "order": 2, "description": "Часы для барбершопов и салонов", "image": "/mockup/cat-clock.jpg" },
      { "id": "clock-graphic", "title": "Графика", "slug": "Графика", "kind": "clock", "visible": true, "order": 3, "description": "Графические модели часов", "image": "/mockup/cat-clock.jpg" },
      { "id": "clock-kids", "title": "Детские", "slug": "Детские", "kind": "clock", "visible": true, "order": 4, "description": "Детские настенные часы", "image": "/mockup/cat-clock.jpg" },
      { "id": "clock-animals", "title": "Животные", "slug": "Животные", "kind": "clock", "visible": true, "order": 5, "description": "Модели с животными", "image": "/mockup/cat-clock.jpg" },
      { "id": "clock-classic", "title": "Классика", "slug": "Классика", "kind": "clock", "visible": true, "order": 6, "description": "Классические настенные часы", "image": "/mockup/cat-clock.jpg" },
      { "id": "clock-coffee", "title": "Кофе и кухня", "slug": "Кофе и кухня", "kind": "clock", "visible": true, "order": 7, "description": "Часы для кухни, кафе и кофейни", "image": "/mockup/cat-clock.jpg" },
      { "id": "clock-music", "title": "Музыка", "slug": "Музыка", "kind": "clock", "visible": true, "order": 8, "description": "Музыкальная тематика", "image": "/mockup/cat-clock.jpg" },
      { "id": "clock-professions", "title": "Профессии", "slug": "Профессии", "kind": "clock", "visible": true, "order": 9, "description": "Часы под профессию или подарок", "image": "/mockup/cat-clock.jpg" },
      { "id": "clock-romance", "title": "Романтика", "slug": "Романтика", "kind": "clock", "visible": true, "order": 10, "description": "Романтические модели", "image": "/mockup/cat-clock.jpg" },
      { "id": "clock-fishing", "title": "Рыбалка, охота", "slug": "Рыбалка, охота", "kind": "clock", "visible": true, "order": 11, "description": "Тематика рыбалки и охоты", "image": "/mockup/cat-clock.jpg" },
      { "id": "clock-sport", "title": "Спорт", "slug": "Спорт", "kind": "clock", "visible": true, "order": 12, "description": "Спортивные модели часов", "image": "/mockup/cat-clock.jpg" },
      { "id": "clock-christian", "title": "Христианские", "slug": "Христианские", "kind": "clock", "visible": true, "order": 13, "description": "Христианская тематика", "image": "/mockup/cat-clock.jpg" },
      { "id": "service-laser", "title": "Лазерная резка", "slug": "laser_cutting", "kind": "service", "visible": false, "order": 101, "description": "Художественная лазерная резка из листового металла", "image": "/assets/service-metal.jpg" },
      { "id": "service-bending", "title": "Гибка металла", "slug": "metal_bending", "kind": "service", "visible": false, "order": 102, "description": "Гибка металлических деталей", "image": "/assets/service-wood.jpg" },
      { "id": "service-wholesale", "title": "Мелкий опт металлопроката", "slug": "metal_wholesale", "kind": "service", "visible": false, "order": 103, "description": "Подбор металлопроката под задачу", "image": "/assets/cat-metal.jpg" },
      { "id": "product-garden", "title": "Садовая мебель", "slug": "garden_furniture", "kind": "product", "visible": false, "order": 201, "description": "Садовая мебель и качели", "image": "/mockup/cat-swing.jpg" },
      { "id": "product-loft", "title": "Мебель лофт", "slug": "loft_furniture", "kind": "product", "visible": false, "order": 202, "description": "Мебель для дома в стиле лофт", "image": "/mockup/cat-custom.jpg" }
    ]
  }'::jsonb
)
on conflict (key) do nothing;
