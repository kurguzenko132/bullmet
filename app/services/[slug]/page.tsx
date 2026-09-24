import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { Icon } from '@/components/Icon';
import { getPublishedServiceBySlug, getServicesControlSettings, type ServiceCard, type ServiceContentBlock } from '@/lib/servicesControl';
import { getSiteControlSettings, isClocksOnly } from '@/lib/siteControl';

type ServicePageProps = { params: Promise<{ slug: string }> };

function contentLines(value: string) {
  return value.split('\n').map((line) => line.trim()).filter(Boolean);
}

function priceLabel(service: ServiceCard) {
  const price = service.price;
  if (!price?.enabled) return '';
  if (price.type === 'agreement') return 'Стоимость — по договорённости';
  return `${price.type === 'from' ? 'от ' : ''}${new Intl.NumberFormat('ru-RU').format(Number(price.amount || 0))} ${price.currency}`;
}

function ServiceBlock({ block, service }: { block: ServiceContentBlock; service: ServiceCard }) {
  const lines = contentLines(block.text);
  if (block.type === 'gallery') {
    if (!service.showGallery || !service.gallery?.length) return null;
    return <section className="site-page-cards"><div className="site-page-section-head"><h2>{block.title || 'Примеры работ'}</h2>{block.text && <span>{block.text}</span>}</div><div>{service.gallery.map((image) => <article key={image.id}><Image src={image.image} alt={image.alt || image.caption || service.title} width={720} height={480} /><p>{image.caption}</p></article>)}</div></section>;
  }
  if (block.type === 'benefits' || block.type === 'steps') return <section className="site-page-cards"><div className="site-page-section-head"><h2>{block.title}</h2></div><div>{lines.map((line, index) => <article key={`${line}-${index}`}><h3>{block.type === 'steps' ? `${String(index + 1).padStart(2, '0')}. ${line}` : line}</h3></article>)}</div></section>;
  if (block.type === 'faq') {
    if (!service.showFaq) return null;
    return <section className="site-page-faq"><div className="site-page-section-head"><h2>{block.title || 'Вопросы и ответы'}</h2></div><div>{lines.map((line, index) => { const [question, ...answer] = line.split('::'); return <details key={`${line}-${index}`}><summary>{question}</summary>{answer.length > 0 && <p>{answer.join('::').trim()}</p>}</details>; })}</div></section>;
  }
  if (block.type === 'cta') return <section className="site-page-cta"><h2>{block.title}</h2>{lines.map((line, index) => <span key={`${line}-${index}`}>{line}</span>)}<Link href={service.href}>{service.href === '/catalog' ? 'Перейти в каталог' : 'Связаться'}</Link></section>;
  return <section className="site-page-text"><h2>{block.title}</h2>{lines.map((line, index) => <span key={`${line}-${index}`}>{line}</span>)}</section>;
}

export async function generateMetadata({ params }: ServicePageProps): Promise<Metadata> {
  const { slug } = await params;
  const [settings, site] = await Promise.all([getServicesControlSettings(), getSiteControlSettings()]);
  const service = isClocksOnly(site) ? undefined : getPublishedServiceBySlug(settings, slug);
  if (!service) return { robots: { index: false, follow: false } };
  const seo = service.seo;
  return {
    title: seo?.title || `${service.title} | Bullmet`,
    description: seo?.description || service.subtitle,
    alternates: { canonical: seo?.canonical || `/services/${service.slug}` },
    robots: { index: site.seo.robotsIndex && seo?.robotsIndex !== false, follow: site.seo.robotsIndex && seo?.robotsFollow !== false },
    openGraph: { title: seo?.ogTitle || seo?.title || service.title, description: seo?.ogDescription || seo?.description || service.subtitle, images: (seo?.ogImage || service.image) ? [seo?.ogImage || service.image] : [] }
  };
}

export default async function ServicePage({ params }: ServicePageProps) {
  const { slug } = await params;
  const [settings, site] = await Promise.all([getServicesControlSettings(), getSiteControlSettings()]);
  const service = isClocksOnly(site) ? undefined : getPublishedServiceBySlug(settings, slug);
  if (!service) notFound();
  const blocks = (service.blocks || []).filter((block) => block.visible).sort((a, b) => a.order - b.order);
  const gallery = service.showGallery ? service.gallery || [] : [];

  return <><Header /><main className="site-page-builder service-detail-page"><nav className="site-page-breadcrumbs" aria-label="Хлебные крошки"><Link href="/">Главная</Link><span>›</span><Link href="/services">Услуги</Link><span>›</span><span>{service.title}</span></nav><section className="site-page-hero"><Image src={service.image} alt={service.title} width={1200} height={720} priority /><div>{service.eyebrow && <p>{service.eyebrow}</p>}<h1>{service.title}</h1><span>{service.subtitle}</span>{priceLabel(service) && <b>{priceLabel(service)}</b>}<Link href={service.href}>Оставить заявку</Link></div></section>{service.items.length > 0 && <section className="site-page-cards"><div className="site-page-section-head"><h2>Что входит в услугу</h2></div><div>{service.items.map((item) => <article key={item}><Icon name={service.icon as any} /><h3>{item}</h3></article>)}</div></section>}{blocks.map((block) => <ServiceBlock key={block.id} block={block} service={service} />)}{gallery.length > 0 && !blocks.some((block) => block.type === 'gallery') && <section className="site-page-cards"><div className="site-page-section-head"><h2>Примеры работ</h2></div><div>{gallery.map((image) => <article key={image.id}><Image src={image.image} alt={image.alt || image.caption || service.title} width={720} height={480} /><p>{image.caption}</p></article>)}</div></section>}</main><Footer /></>;
}
