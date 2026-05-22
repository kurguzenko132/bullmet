-- Optional cleanup for old demo data that was inserted by earlier prototype schemas.
-- Run this once only if old placeholder products returned after re-running the old SQL.

delete from public.products
where slug in (
  'wall-clock-loft',
  'garden-swing-bullmet',
  'wall-clock-classic',
  'wall-clock-industrial',
  'garden-comfort-swing',
  'wood-tree-panel',
  'decorative-grille',
  'metal-house-number',
  'metal-cutting-service',
  'wood-cutting-service'
);

-- Optional: remove old default homepage settings only if you want the site to use code defaults
-- until you save new settings from /admin/home.
-- delete from public.site_settings where key = 'home';
