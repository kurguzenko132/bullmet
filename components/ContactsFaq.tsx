'use client';

import { Minus, Plus } from 'lucide-react';
import { useState } from 'react';

const questions = [
  ['Можно ли уточнить наличие часов?', 'Да, напишите нам или позвоните — подскажем по наличию и срокам.'],
  ['Можно ли подобрать часы под интерьер?', 'Да, поможем выбрать модель, размер и цвет.'],
  ['Можно ли связаться по индивидуальному вопросу?', 'Да, опишите задачу, и мы подскажем возможный вариант.']
];

export function ContactsFaq() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="contacts-faq-list">
      {questions.map(([question, answer], index) => {
        const expanded = open === index;
        return (
          <article className={expanded ? 'is-open' : ''} key={question}>
            <button type="button" onClick={() => setOpen(expanded ? null : index)} aria-expanded={expanded}>
              <span>{question}</span>{expanded ? <Minus aria-hidden="true" /> : <Plus aria-hidden="true" />}
            </button>
            {expanded && <p>{answer}</p>}
          </article>
        );
      })}
    </div>
  );
}
