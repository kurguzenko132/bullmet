import Link from 'next/link';
import { getBannerControlSettings } from '@/lib/adminContent';

function isActiveDate(startsAt?: string, endsAt?: string) {
  const now = Date.now();
  const start = startsAt ? new Date(startsAt).getTime() : 0;
  const end = endsAt ? new Date(endsAt).getTime() : 0;
  if (start && now < start) return false;
  if (end && now > end) return false;
  return true;
}

export async function HomePromoBanners({ placement = 'home_top' }: { placement?: 'home_top' | 'catalog_top' | 'product_bottom' }) {
  const settings = await getBannerControlSettings();
  if (!settings.enabled) return null;

  const banners = settings.banners
    .filter((item) => item.visible && item.placement === placement && isActiveDate(item.startsAt, item.endsAt))
    .sort((a, b) => a.order - b.order)
    .slice(0, 2);

  if (!banners.length) return null;

  return (
    <section className="home-container home-promo-banners">
      {banners.map((banner) => (
        <Link href={banner.href} className="home-promo-banner" key={banner.id}>
          <img src={banner.image} alt="" />
          <div>
            <span>Акция / промо</span>
            <h2>{banner.title}</h2>
            <p>{banner.text}</p>
            <b>{banner.buttonLabel}</b>
          </div>
        </Link>
      ))}
    </section>
  );
}
