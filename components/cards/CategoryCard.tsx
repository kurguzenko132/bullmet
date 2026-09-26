import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

type CategoryCardProps = {
  title: string;
  description: string;
  image: string;
  href: string;
};

export function CategoryCard({ title, description, image, href }: CategoryCardProps) {
  return (
    <Link href={href} className="category-card">
      <img src={image} alt={title} />
      <span className="category-card__content">
        <span><b className="category-card__title">{title}</b><small>{description}</small></span>
        <span className="category-card__arrow"><ArrowRight aria-hidden="true" /></span>
      </span>
    </Link>
  );
}
