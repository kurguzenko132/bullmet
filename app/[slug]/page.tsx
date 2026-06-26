import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { getPageMetadata, getPublishedSitePageBySlug, getPublishedSitePages, type SitePageSection } from '@/lib/sitePages';

export const dynamic = 'force-dynamic';

export async function generateStaticParams() {
  const pages = await getPublishedSitePages();
  return pages.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const metadata = await getPageMetadata(params.slug);
  if (!metadata) return {};
  return metadata;
}

function Lines({ value }: { value?: string }) {
  return <>{String(value || '').split('\n').map((line, index) => <span key={`${line}-${index}`}>{line}<br /></span>)}</>;
}

function Section({ section }: { section: SitePageSection }) {
  if (section.type === 'hero') {
    return (
      <section className="site-page-hero">
        {section.image && <img src={section.image} alt="" />}
        <div>
          {section.subtitle && <p>{section.subtitle}</p>}
          <h1>{section.title}</h1>
          {section.text && <span><Lines value={section.text} /></span>}
          {section.buttonLabel && section.buttonHref && <Link href={section.buttonHref}>{section.buttonLabel}</Link>}
        </div>
      </section>
    );
  }

  if (section.type === 'image_text') {
    return (
      <section className="site-page-image-text">
        <div>
          {section.subtitle && <p>{section.subtitle}</p>}
          <h2>{section.title}</h2>
          {section.text && <span><Lines value={section.text} /></span>}
          {section.buttonLabel && section.buttonHref && <Link href={section.buttonHref}>{section.buttonLabel}</Link>}
        </div>
        {section.image && <img src={section.image} alt="" />}
      </section>
    );
  }

  if (section.type === 'cards') {
    return (
      <section className="site-page-cards">
        <div className="site-page-section-head">
          {section.subtitle && <p>{section.subtitle}</p>}
          <h2>{section.title}</h2>
          {section.text && <span>{section.text}</span>}
        </div>
        <div>
          {(section.items || []).map((item, index) => (
            <article key={`${item.title}-${index}`}>
              {item.image && <img src={item.image} alt="" />}
              <h3>{item.title}</h3>
              {item.text && <p>{item.text}</p>}
              {item.href && <Link href={item.href}>Подробнее</Link>}
            </article>
          ))}
        </div>
      </section>
    );
  }

  if (section.type === 'faq') {
    return (
      <section className="site-page-faq">
        <div className="site-page-section-head">
          {section.subtitle && <p>{section.subtitle}</p>}
          <h2>{section.title}</h2>
          {section.text && <span>{section.text}</span>}
        </div>
        <div>
          {(section.items || []).map((item, index) => (
            <details key={`${item.title}-${index}`}>
              <summary>{item.title}</summary>
              <p>{item.text}</p>
            </details>
          ))}
        </div>
      </section>
    );
  }

  if (section.type === 'cta') {
    return (
      <section className="site-page-cta">
        {section.subtitle && <p>{section.subtitle}</p>}
        <h2>{section.title}</h2>
        {section.text && <span><Lines value={section.text} /></span>}
        {section.buttonLabel && section.buttonHref && <Link href={section.buttonHref}>{section.buttonLabel}</Link>}
      </section>
    );
  }

  return (
    <section className="site-page-text">
      {section.subtitle && <p>{section.subtitle}</p>}
      <h2>{section.title}</h2>
      {section.text && <span><Lines value={section.text} /></span>}
    </section>
  );
}

export default async function DynamicSitePage({ params }: { params: { slug: string } }) {
  const page = await getPublishedSitePageBySlug(params.slug);
  if (!page) notFound();

  const sections = page.sections?.length ? page.sections : [{
    id: 'default-text',
    type: 'text' as const,
    title: page.title,
    text: page.excerpt || ''
  }];

  return (
    <>
      <Header />
      <main className="site-page-builder">
        <nav className="site-page-breadcrumbs">
          <Link href="/">Главная</Link>
          <span>›</span>
          <span>{page.title}</span>
        </nav>
        {sections.map((section) => <Section key={section.id} section={section} />)}
      </main>
      <Footer />
    </>
  );
}
