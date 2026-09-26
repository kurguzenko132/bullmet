'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, Send } from 'lucide-react';
import type { HomeFaqItem } from '@/lib/homepageControl';

type Props = { title: string; text: string; image: string; items: HomeFaqItem[] };

export function HomeFaqClient({ title, text, image, items }: Props) {
  const [openId, setOpenId] = useState(items[0]?.id ?? '');
  return <section className="home-container home-faq" aria-labelledby="home-faq-title">
    <header className="home-faq__intro">
      <p className="ui-eyebrow">Ответы на вопросы</p>
      <h2 id="home-faq-title" className="home-faq__title">{title}</h2>
      <p className="home-faq__lead">{text}</p>
      <Link className="ui-button ui-button--secondary home-faq__telegram" href="https://t.me/bullmet_by" target="_blank" rel="noreferrer"><Send aria-hidden="true" />Написать в Telegram</Link>
    </header>
    <div className="home-faq__list">{items.map((item) => {
      const isOpen = openId === item.id;
      const answerId = `faq-answer-${item.id}`;
      return <article className={`home-faq__item ${isOpen ? 'is-open' : ''}`} key={item.id}>
        <button type="button" aria-expanded={isOpen} aria-controls={answerId} onClick={() => setOpenId(isOpen ? '' : item.id)}><span>{item.question}</span><ChevronDown aria-hidden="true" /></button>
        {isOpen && <div id={answerId} className="home-faq__answer"><p>{item.answer}</p></div>}
      </article>;
    })}</div>
  </section>;
}
