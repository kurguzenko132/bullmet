'use client';

import { useState } from 'react';
import { ChevronDown, MessageCircleQuestion, MessagesSquare, ShieldCheck } from 'lucide-react';
import type { HomeFaqItem } from '@/lib/homepageControl';

type Props = { eyebrow: string; title: string; text: string; image: string; items: HomeFaqItem[] };

const benefits = [
  { icon: ShieldCheck, text: 'Честные и понятные ответы' },
  { icon: MessageCircleQuestion, text: 'Поможем подобрать подходящий вариант' },
  { icon: MessagesSquare, text: 'Связаться с нами можно, если ответа нет' }
];

export function HomeFaqClient({ eyebrow, title, text, image, items }: Props) {
  const [openId, setOpenId] = useState(items[0]?.id ?? '');
  return <section className="home-container home-faq" aria-labelledby="home-faq-title">
    <div className="home-faq__intro">
      <p className="home-faq__eyebrow">{eyebrow}</p><h2 id="home-faq-title" className="home-faq__title">{title}</h2><p className="home-faq__lead">{text}</p>
      <div className="home-faq__benefits">{benefits.map(({ icon: BenefitIcon, text: benefit }) => <div className="home-faq__benefit" key={benefit}><BenefitIcon aria-hidden="true" /><span>{benefit}</span></div>)}</div>
      <img className="home-faq__image" src={image} alt="Интерьер с настенными часами Bullmet" />
    </div>
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
