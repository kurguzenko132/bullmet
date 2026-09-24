import Image from 'next/image';
import Link from 'next/link';
import { Layers3, Palette, Wrench } from 'lucide-react';
import type { HomeBenefit } from '@/lib/homepageControl';

const benefitIcons = { tools: Wrench, materials: Palette, spark: Layers3 };

type Props = {
  title: string;
  text: string;
  image: string;
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel: string;
  secondaryHref: string;
  benefits: HomeBenefit[];
};

export function HomeCustomOptions({ title, text, image, primaryLabel, primaryHref, secondaryLabel, secondaryHref, benefits }: Props) {
  return <section className="home-container home-custom-options" aria-labelledby="home-custom-options-title">
    <div className="home-custom-options__card">
      <div className="home-custom-options__content">
        <h2 id="home-custom-options-title">{title}</h2>
        <p className="home-custom-options__text">{text}</p>
        <div className="home-custom-options__benefits">
          {benefits.slice(0, 3).map((benefit) => {
            const BenefitIcon = benefitIcons[benefit.icon as keyof typeof benefitIcons] || Layers3;
            return <div className="home-custom-options__benefit" key={benefit.id}><BenefitIcon aria-hidden="true" /><p><b>{benefit.title}</b><span>{benefit.desc}</span></p></div>;
          })}
        </div>
        <div className="home-custom-options__actions">
          <Link className="home-custom-options__primary" href={primaryHref}>{primaryLabel}</Link>
          <Link className="home-custom-options__secondary" href={secondaryHref}>{secondaryLabel}</Link>
        </div>
      </div>
      <div className="home-custom-options__visual"><Image src={image} alt="Изготовление настенных часов Bullmet" fill sizes="(max-width: 767px) 100vw, 55vw" /></div>
    </div>
  </section>;
}
