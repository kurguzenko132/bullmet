import Image from 'next/image';
import Link from 'next/link';
import { CheckCircle2, Layers3, Paintbrush, ShieldCheck, Truck, Wrench } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { getProductionControlSettings, visibleProductionItems, type ProductionFact } from '@/lib/productionControl';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Производство Bullmet — настенные часы из металла и дерева', description: 'Как создаются настенные часы Bullmet: металл, дерево, резка, обработка, покраска, сборка и контроль качества.' };

const factIcons = { shield: ShieldCheck, layers: Layers3, check: CheckCircle2 };
const processImages = ['/assets/process-design.png', '/assets/process-laser-cutting.png', '/assets/process-painting.png', '/assets/process-assembly.png'];

export default async function ProductionPage() {
  const settings = await getProductionControlSettings(); const facts = visibleProductionItems(settings.facts); const steps = visibleProductionItems(settings.process.steps).slice(0, 4); const results = visibleProductionItems(settings.results.items);
  return <><Header /><main className="production-story-page">
    {settings.hero.enabled && <section className="production-story-hero">
      <div className="production-story-hero-visual">
        <div className="production-story-hero-media"><Image src={settings.hero.image} alt="Лазерная резка на производстве Bullmet" fill priority sizes="(max-width: 767px) 100vw, 100vw" /></div>
        <div className="production-story-hero-copy"><p className="production-story-kicker">{settings.hero.kicker}</p><h1>{settings.hero.title}</h1><p className="production-story-lead">{settings.hero.text}</p><div className="production-story-actions"><Link className="production-story-button production-story-button--accent" href="/catalog">{settings.hero.catalogLabel}</Link></div></div>
      </div>
      <div className="production-story-facts">{facts.map((item: ProductionFact) => { const Icon = factIcons[item.icon]; return <article key={item.id}><Icon aria-hidden="true" /><div><h2>{item.title}</h2><p>{item.text}</p></div></article>; })}<article><Truck aria-hidden="true" /><div><h2>Быстрые сроки изготовления</h2><p>Благодаря собственным производственным мощностям.</p></div></article></div>
    </section>}
    {settings.process.enabled && <section className="production-process-dark"><div className="production-process-head"><div><span aria-hidden="true" /><h2>Как мы работаем</h2><p>Современное оборудование и опытная команда позволяют нам создавать изделия с высокой точностью и стабильным качеством.</p></div><Link href="/catalog" className="production-process-link">Смотреть каталог <span aria-hidden="true">→</span></Link></div><div className="production-process-timeline">{steps.map((step, index) => <article className="production-process-step" key={step.id}><div className="production-process-step-image"><Image src={processImages[index] || step.image} alt="" fill sizes="(max-width: 767px) 100vw, 24vw" /></div><div className="production-process-step-meta"><span>{String(Number(step.number))}</span><h3>{step.title}</h3></div><p>{step.text}</p></article>)}</div></section>}
    <section className="production-quality-section" aria-label="Материалы и контроль качества">
      <div className="production-quality-image"><Image src="/assets/production-materials.png" alt="Стальные листы и натуральное дерево для часов Bullmet" fill sizes="(max-width: 767px) 100vw, 45vw" /></div>
      <div className="production-materials-copy"><h2>Качественные<br />материалы</h2><p>Используем прочный металл, натуральное дерево и надёжные покрытия. Это обеспечивает долговечность и аккуратный внешний вид часов.</p><div className="production-material-list"><article><div><Image src="/assets/service-metal.jpg" alt="Металл" fill sizes="72px" /></div><span><b>Металл</b><small>Сталь 1–3 мм высокой прочности</small></span></article><article><div><Image src="/assets/service-wood.jpg" alt="Натуральное дерево" fill sizes="72px" /></div><span><b>Натуральное дерево</b><small>Дуб, ясень, бук с защитной пропиткой</small></span></article><article><div className="production-material-swatch" /><span><b>Порошковая покраска</b><small>Стойкое покрытие в любой цвет</small></span></article></div></div>
      <div className="production-quality-copy"><h2>Контроль качества<br />на каждом этапе</h2><p>Перед упаковкой каждое изделие проходит проверку: точность резки, качество покраски, надёжность механизма и внешний вид.</p><div className="production-quality-benefits"><span><ShieldCheck aria-hidden="true" />Идеальная геометрия</span><span><Wrench aria-hidden="true" />Надёжный механизм</span><span><CheckCircle2 aria-hidden="true" />Безупречный внешний вид</span></div></div>
      <div className="production-quality-image"><Image src="/assets/production-quality-control.png" alt="Проверка точности настенных часов Bullmet" fill sizes="(max-width: 767px) 100vw, 45vw" /></div>
    </section>
    {settings.results.enabled && <section className="production-result-section"><div className="production-story-section-head"><h2>{settings.results.title}</h2><p>{settings.results.text}</p></div><div className="production-result-grid">{results.map((item) => <article className="production-result-card" key={item.id}><div><Image src={item.image} alt={item.title} fill sizes="(max-width: 767px) 100vw, 25vw" /></div><h3>{item.title}</h3><p>{item.text}</p></article>)}</div><Link className="production-story-button production-story-button--accent production-result-action" href="/catalog">{settings.results.ctaLabel}</Link></section>}
    <section className="production-brand-strip"><div className="production-brand-intro"><ShieldCheck aria-hidden="true" /><p><strong>Bullmet</strong> — это сочетание металла, дерева и внимательного отношения к деталям.</p></div><div className="production-brand-features"><span><Layers3 aria-hidden="true" />Качественные материалы</span><span><Wrench aria-hidden="true" />Современное оборудование</span><span><Paintbrush aria-hidden="true" />Аккуратная сборка</span><span><CheckCircle2 aria-hidden="true" />Контроль качества</span></div></section>
  </main><Footer /></>;
}
