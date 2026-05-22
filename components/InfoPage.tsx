import { Header, Footer } from './HomePage';

export type InfoSection = {
  title: string;
  text: string;
};

export function InfoPage({
  eyebrow,
  title,
  description,
  sections,
}: {
  eyebrow: string;
  title: string;
  description: string;
  sections: InfoSection[];
}) {
  return (
    <>
      <Header />
      <main className="infoPage">
        <section className="container infoHero">
          <p className="sectionLabel">{eyebrow}</p>
          <h1>{title}</h1>
          <p>{description}</p>
        </section>
        <section className="container infoGrid">
          {sections.map((section) => (
            <article className="infoCard" key={section.title}>
              <h2>{section.title}</h2>
              <p>{section.text}</p>
            </article>
          ))}
        </section>
      </main>
      <Footer />
    </>
  );
}
