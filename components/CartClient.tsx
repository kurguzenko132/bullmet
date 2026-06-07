'use client';

import { useEffect, useMemo, useState } from 'react';

type CartItem = {
  slug: string;
  title: string;
  price: number;
  image: string;
  material?: string;
  size?: string;
  quantity: number;
};

function readCart(): CartItem[] {
  try {
    const raw = window.localStorage.getItem('bullmet_cart');
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function money(value: number) {
  return new Intl.NumberFormat('ru-RU').format(value);
}

export function CartClient() {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    setItems(readCart());
    const onUpdate = () => setItems(readCart());
    window.addEventListener('bullmet-cart-updated', onUpdate);
    return () => window.removeEventListener('bullmet-cart-updated', onUpdate);
  }, []);

  const total = useMemo(() => items.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1), 0), [items]);

  function save(next: CartItem[]) {
    setItems(next);
    window.localStorage.setItem('bullmet_cart', JSON.stringify(next));
    window.dispatchEvent(new Event('bullmet-cart-updated'));
  }

  function setQty(slug: string, size: string | undefined, quantity: number) {
    save(items.map((item) => item.slug === slug && item.size === size ? { ...item, quantity: Math.max(1, quantity) } : item));
  }

  function remove(slug: string, size: string | undefined) {
    save(items.filter((item) => !(item.slug === slug && item.size === size)));
  }

  if (!items.length) {
    return (
      <section className="bg-white p-8 shadow-soft">
        <h2 className="text-2xl font-black">Корзина пустая</h2>
        <p className="mt-3 text-bull-muted">Добавьте товар из каталога или отправьте заявку на расчет.</p>
      </section>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
      <section className="bg-white p-6 shadow-soft">
        <div className="grid grid-cols-[1fr_120px_150px_40px] border-b pb-3 text-sm font-bold text-bull-muted">
          <span>Товар</span><span>Цена</span><span>Количество</span><span />
        </div>
        {items.map((item) => (
          <div key={`${item.slug}-${item.size}`} className="grid grid-cols-[1fr_120px_150px_40px] items-center border-b py-4">
            <div className="flex items-center gap-4">
              <img src={item.image} alt={item.title} className="h-20 w-24 object-cover" />
              <div><b>{item.title}</b><p className="mt-1 text-sm text-bull-muted">{item.size || item.material}</p></div>
            </div>
            <span>{money(item.price)} BYN</span>
            <div><button className="border px-3" onClick={() => setQty(item.slug, item.size, item.quantity - 1)}>−</button><span className="border-y px-4 py-1">{item.quantity}</span><button className="border px-3" onClick={() => setQty(item.slug, item.size, item.quantity + 1)}>+</button></div>
            <button onClick={() => remove(item.slug, item.size)}>×</button>
          </div>
        ))}
      </section>
      <aside className="h-fit bg-white p-6 shadow-soft">
        <h2 className="text-2xl font-black">Итого</h2>
        <div className="mt-5 flex justify-between text-xl"><span>Сумма</span><b>{money(total)} BYN</b></div>
        <input className="mt-5 w-full border p-3" placeholder="Имя" />
        <input className="mt-3 w-full border p-3" placeholder="Телефон" />
        <textarea className="mt-3 w-full border p-3" rows={3} placeholder="Комментарий" />
        <button className="mt-4 w-full bg-bull-orange py-4 font-bold text-white">Оформить заказ</button>
      </aside>
    </div>
  );
}
