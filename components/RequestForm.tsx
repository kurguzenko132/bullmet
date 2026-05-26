'use client';

import { ChangeEvent, FormEvent, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { products } from './shopData';
import { useAdminProducts } from './useAdminProducts';
import { addAdminRequestAsync, makeRequestId } from './adminBusinessStore';
import { uploadRequestFiles } from '../lib/requestFiles';

const requestTypes = [
  { value: 'custom', label: 'Изделие на заказ' },
  { value: 'metal-cutting', label: 'Резка металла' },
  { value: 'wood-cutting', label: 'Резка дерева' },
  { value: 'wall-clock', label: 'Настенные часы' },
  { value: 'garden-swing', label: 'Садовые качели' },
  { value: 'decor', label: 'Элементы декора' },
];

const materialTypes = ['Металл', 'Дерево', 'Металл + дерево', 'Еще не знаю'];
const contactMethods = ['Позвонить', 'WhatsApp', 'Telegram', 'Email'];

export function RequestForm() {
  const searchParams = useSearchParams();
  const productSlug = searchParams.get('product');
  const typeFromUrl = searchParams.get('type') ?? '';
  const { items, ready } = useAdminProducts();
  const productSource = ready ? items.filter((item) => item.status !== 'draft') : products;
  const product = useMemo(() => productSource.find((item) => item.slug === productSlug), [productSource, productSlug]);
  const initialType = product ? 'custom' : requestTypes.some((type) => type.value === typeFromUrl) ? typeFromUrl : 'custom';

  const [requestType, setRequestType] = useState(initialType);
  const [material, setMaterial] = useState(product?.material ?? 'Металл + дерево');
  const [contactMethod, setContactMethod] = useState(contactMethods[0]);
  const [files, setFiles] = useState<File[]>([]);
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [requestId, setRequestId] = useState('');

  function changeFiles(event: ChangeEvent<HTMLInputElement>) {
    const nextFiles = Array.from(event.target.files ?? []).slice(0, 8);
    setFiles(nextFiles);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const id = makeRequestId('R');
    const typeLabel = requestTypes.find((type) => type.value === requestType)?.label ?? 'Индивидуальная заявка';

    setSending(true);
    setError('');

    try {
      const fileUrls = files.length ? await uploadRequestFiles(id, files) : [];
      const fileNames = files.map((file) => file.name).join(', ');

      await addAdminRequestAsync({
        id,
        createdAt: new Date().toISOString(),
        kind: requestType === 'metal-cutting' || requestType === 'wood-cutting' ? 'service' : 'calculation',
        contactMethod,
        customer: {
          name: String(data.get('name') ?? '').trim(),
          phone: String(data.get('phone') ?? '').trim(),
          email: String(data.get('email') ?? '').trim(),
          city: String(data.get('city') ?? '').trim(),
        },
        type: typeLabel,
        material,
        sizes: String(data.get('sizes') ?? '').trim(),
        comment: String(data.get('comment') ?? '').trim(),
        productSlug: product?.slug,
        productTitle: product?.title,
        productImage: product?.image,
        productPrice: product?.price,
        fileName: fileNames || undefined,
        fileUrls,
        status: 'Новая',
      });

      setRequestId(id);
      setSent(true);
      setFiles([]);
      form.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось отправить заявку.');
    } finally {
      setSending(false);
    }
  }

  if (sent) {
    return (
      <section className="requestForm requestSuccess">
        <span className="requestSuccess__mark">✓</span>
        <h2>Заявка {requestId} отправлена</h2>
        <p>Заявка сохранена в админке. Менеджер сможет увидеть контакты, задачу, товар и прикрепленные файлы.</p>
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
        <div className="requestProductHint requestProductHint--rich">
          <div className="requestProductHint__image"><Image src={product.image} alt={product.title} fill sizes="72px" /></div>
          <div>
            <b>Заявка по товару</b>
            <span>{product.title} · ориентир по цене от {product.price} BYN</span>
          </div>
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

      <div className="requestForm__grid requestForm__grid--three">
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
        <label>
          <span>Как удобнее связаться</span>
          <select value={contactMethod} onChange={(event) => setContactMethod(event.target.value)}>
            {contactMethods.map((item) => <option value={item} key={item}>{item}</option>)}
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

      <label className="fileField fileField--strong">
        <input name="file" type="file" multiple onChange={changeFiles} />
        <b>Прикрепить файлы, фото или чертежи</b>
        <span>Можно загрузить до 8 файлов: JPG, PNG, PDF, DXF и другие материалы для расчета.</span>
      </label>

      {files.length > 0 && (
        <div className="requestFileList">
          {files.map((file) => <span key={`${file.name}-${file.size}`}>{file.name}</span>)}
        </div>
      )}

      {error && <div className="requestError">{error}</div>}

      <div className="requestSubmitRow">
        <button className="button button--orange" type="submit" disabled={sending}>{sending ? 'Отправляем...' : 'Отправить заявку'}</button>
        <p>Нажимая кнопку, вы соглашаетесь на обработку данных для связи по заявке.</p>
      </div>
    </form>
  );
}
