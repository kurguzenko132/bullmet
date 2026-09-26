import type { LucideIcon } from 'lucide-react';

type FeatureCardProps = {
  icon: LucideIcon;
  title: string;
  text: string;
};

export function FeatureCard({ icon: Icon, title, text }: FeatureCardProps) {
  return <article className="feature-card"><div className="feature-card__icon"><Icon aria-hidden="true" /></div><h3>{title}</h3><p>{text}</p></article>;
}
