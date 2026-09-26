type SectionHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: 'left' | 'center';
  headingLevel?: 'h1' | 'h2';
};

export function SectionHeader({ eyebrow, title, description, align = 'left', headingLevel = 'h2' }: SectionHeaderProps) {
  const Heading = headingLevel;
  return (
    <header className={`ui-section-header${align === 'center' ? ' ui-section-header--centered' : ''}`}>
      {eyebrow && <p className="ui-eyebrow">{eyebrow}</p>}
      <Heading>{title}</Heading>
      {description && <p>{description}</p>}
    </header>
  );
}
