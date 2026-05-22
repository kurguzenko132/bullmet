'use client';

import { FormEvent, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { products } from './shopData';
import { addAdminRequestAsync, makeRequestId } from './adminBusinessStore';

const requestTypes = [
  { value: 'custom', label: 'Изделие на заказ' },
  { value: 'metal-cutting', label: 'Резка металла' },
  { value: 'wood-cutting', label: 'Резка дерева' },
  { value: 'wall-clock', label: 'Настенные часы' },
  { value: 'garden-swing', label: 'Садовые качели' },
  { value: 'decor', label: 'Элементы декора' },
];

const materialTypes = ['Металл', 'Дерево', 'Металл + дерево', 'Еще не знаю'];

export function RequestForm() {
  const searchParams = useSearchParams();
  const productSlug = searchParams.get('product');
  const typeFromUrl = searchParams.get('type') ?? '';
  const product = useMemo(() => products.find((item) => item.slug === productSlug), [productSlug]);
  const initialType = product ? 'custom' : requestTypes.some((type) => type.value === typeFromUrl) ? typeFromUrl : 'custom';

  const [requestType, setRequestType] = useState(initialType);
  const [material, setMaterial] = useState(product?.material ?? 'Металл + дерево');
  const [sent, setSent] = useState(false);
  const [requestId, setRequestId] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const file = data.get('file');
    const id = makeRequestId();
    const typeLabel = requestTypes.find((type) => type.value === requestType)?.label ?? 'Индивидуальная заявка';

    await addAdminRequestAsync({
      id,
      createdAt: new Date().toISOString(),
      customer: {
        name: String(data.get('name') ?? ''),
        phone: String(data.get('phone') ?? ''),
        email: String(data.get('email') ?? ''),
        city: String(data.get('city') ?? ''),
      },
      type: typeLabel,
      material,
      sizes: String(data.get('sizes') ?? ''),
      comment: String(data.get('comment') ?? ''),
      productSlug: product?.slug,
      productTitle: product?.title,
      fileName: file instanceof File && file.name ? file.name : undefined,
      status: 'Новая',
    });

    setRequestId(id);
    setSent(true);
  }

  if (sent) {
    return (
      <section className="requestForm requestSuccess">
        <span className="requestSuccess__mark">✓</span>
        <h2>Заявка {requestId} отправлена</h2>
        <p>Заявка сохранена в демо-базе сайта. Теперь ее можно открыть в админке в разделе “Заявки на расчет”.</p>
        <div className="requestSuccess__actions">
          <Link className="button button--orange" href="/admin/requests">Открыть заявки в админке</Link>
          <button className="button button--outline" onClick={() => setSent(false)}>Отправить еще одну</button>
        </div>
      </section>
    );
  }

  return (
    <form className="requestForm" onSubmit={handleSubmit}>
      {product && (
        <div className="requestProductHint">
          <b>Заказать похожее изделие</b>
          <span>{product.title} · ориентир по цене от {product.price} BYN</span>
        </div>
      )}

      <div className="requestForm__grid">
        <label>
          <span>Имя *</span>
          <input name="name" required placeholder="Ваше имя" />
        </label>
        <label>
          <span>Телефон *</span>
          <input name="phone" required type="tel" placeholder="+375 29 000-00-00" />
        </label>
        <label>
          <span>Email</span>
          <input name="email" type="email" placeholder="mail@example.com" />
        </label>
        <label>
          <span>Город</span>
          <input name="city" placeholder="Например, Минск" />
        </label>
      </div>

      <div className="requestForm__grid requestForm__grid--two">
        <label>
          <span>Тип заявки</span>
          <select value={requestType} onChange={(event) => setRequestType(event.target.value)}>
            {requestTypes.map((type) => <option value={type.value} key={type.value}>{type.label}</option>)}
          </select>
        </label>
        <label>
          <span>Материал</span>
          <select value={material} onChange={(event) => setMaterial(event.target.value)}>
            {materialTypes.map((item) => <option value={item} key={item}>{item}</option>)}
          </select>
        </label>
      </div>

      <label className="requestFullField">
        <span>Размеры / количество</span>
        <input name="sizes" placeholder="Например: 120×80 см, 2 шт." />
      </label>

      <label className="requestFullField">
        <span>Комментарий к задаче *</span>
        <textarea name="comment" required placeholder="Опишите, что нужно изготовить или рассчитать. Можно указать размеры, материал, цвет, назначение изделия." />
      </label>

      <label className="fileField">
        <input name="file" type="file" />
        <b>Прикрепить файл, фото или чертеж</b>
        <span>PDF, JPG, PNG, DXF — сейчас сохраняется имя файла, позже подключим Supabase Storage</span>
      </label>

      <div className="requestSubmitRow">
        <button className="button button--orange" type="submit">Отправить заявку</button>
        <p>Нажимая кнопку, вы соглашаетесь на обработку данных для связи по заявке.</p>
      </div>
    </form>
  );
}
