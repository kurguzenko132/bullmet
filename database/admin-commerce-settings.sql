-- Bullmet CMS: delivery, payment and coupon settings.
-- Safe to run on an existing Supabase project after supabase-schema.sql.

update public.site_settings
set value = jsonb_set(
  value,
  '{commerce}',
  '{
    "deliveryMethods": [
      { "id": "belarus_delivery", "title": "Доставка по Беларуси", "description": "Менеджер уточнит стоимость и сроки после оформления.", "enabled": true, "note": "Основной способ", "order": 1 },
      { "id": "pickup", "title": "Самовывоз", "description": "Заберите готовый заказ по предварительному согласованию.", "enabled": true, "note": "По договорённости", "order": 2 },
      { "id": "manager_delivery", "title": "Уточнить у менеджера", "description": "Подберём удобный способ получения для индивидуального заказа.", "enabled": true, "note": "Для нестандартных заказов", "order": 3 }
    ],
    "paymentMethods": [
      { "id": "manager_payment", "title": "Оплата после подтверждения", "description": "Менеджер согласует удобный способ оплаты и выставит счёт.", "enabled": true, "note": "Основной способ", "order": 1 },
      { "id": "cash_payment", "title": "Наличными", "description": "Оплата при самовывозе или после согласования с менеджером.", "enabled": false, "note": "Включите, когда способ доступен", "order": 2 },
      { "id": "online_payment", "title": "Онлайн-оплата картой", "description": "Оплата картой на сайте через подключённый платёжный сервис.", "enabled": false, "note": "Требует подключения платёжного провайдера", "order": 3 }
    ],
    "couponRules": []
  }'::jsonb,
  true
)
where key = 'site_control'
  and not (value ? 'commerce');
