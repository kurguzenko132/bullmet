'use client';

import { useState } from 'react';
import {
  BriefcaseBusiness,
  ChevronDown,
  Circle,
  Coffee,
  Cross,
  Fish,
  Heart,
  Landmark,
  Layers3,
  LayoutGrid,
  Music2,
  SlidersHorizontal,
  Tag,
  Trophy,
  X
} from 'lucide-react';

type FilterCategory = {
  id: string;
  label: string;
  count: number;
};

type FilterMaterial = {
  id: string;
  label: string;
};

type CatalogFilterSidebarProps = {
  categories: FilterCategory[];
  materials: FilterMaterial[];
  productsCount: number;
  selectedCategory: string;
  selectedMaterial: string;
  priceFrom: string;
  priceTo: string;
  activeFiltersCount: number;
  resultsCount: number;
  isOpen: boolean;
  onClose: () => void;
  onCategoryChange: (category: string) => void;
  onMaterialChange: (material: string) => void;
  onPriceApply: (priceFrom: string, priceTo: string) => void;
  onReset: () => void;
};

const categoryIcons: Record<string, typeof LayoutGrid> = {
  'классика': Landmark,
  'кофе и кухня': Coffee,
  'музыка': Music2,
  'профессии': BriefcaseBusiness,
  'романтика': Heart,
  'рыбалка, охота': Fish,
  'рыбалка и охота': Fish,
  'спорт': Trophy,
  'христианские': Cross
};

function categoryIcon(label: string) {
  return categoryIcons[label.toLowerCase()] || LayoutGrid;
}

function FilterSection({
  icon: SectionIcon,
  title,
  children,
  defaultOpen = true
}: {
  icon: typeof LayoutGrid;
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="catalog-filter-modern-section">
      <button className="catalog-filter-section-title" type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open}>
        <span><SectionIcon aria-hidden="true" />{title}</span>
        <ChevronDown className={open ? 'is-open' : ''} aria-hidden="true" />
      </button>
      {open && children}
    </section>
  );
}

export function CatalogFilterSidebar({
  categories,
  materials,
  productsCount,
  selectedCategory,
  selectedMaterial,
  priceFrom,
  priceTo,
  activeFiltersCount,
  resultsCount,
  isOpen,
  onClose,
  onCategoryChange,
  onMaterialChange,
  onPriceApply,
  onReset
}: CatalogFilterSidebarProps) {
  function reset() {
    onReset();
  }

  return (
    <>
      <div className={isOpen ? 'catalog-filter-drawer-backdrop is-open' : 'catalog-filter-drawer-backdrop'} onClick={onClose} aria-hidden="true" />
      <aside className={isOpen ? 'catalog-filter-modern is-open' : 'catalog-filter-modern'} aria-label="Фильтры каталога">
        <header className="catalog-filter-modern-head">
          <b>Фильтры</b>
          <SlidersHorizontal aria-hidden="true" />
          <button className="catalog-filter-modern-close" type="button" onClick={onClose} aria-label="Закрыть фильтры"><X /></button>
        </header>

        <div className="catalog-filter-modern-scroll">
          <FilterSection icon={LayoutGrid} title="Категории">
            <div className="catalog-filter-list catalog-filter-list--categories">
              <button className={selectedCategory ? 'catalog-filter-option' : 'catalog-filter-option is-active'} type="button" onClick={() => onCategoryChange('')}>
                <span className="catalog-filter-option-icon"><LayoutGrid /></span>
                <span>Все товары</span>
                <b className="catalog-filter-count">{productsCount}</b>
              </button>
              {categories.map((item) => {
                const CategoryIcon = categoryIcon(item.label);
                const isActive = selectedCategory === item.id;
                const isDisabled = item.count === 0;
                return (
                  <button
                    className={`catalog-filter-option${isActive ? ' is-active' : ''}${isDisabled ? ' is-disabled' : ''}`}
                    type="button"
                    key={item.id}
                    onClick={() => onCategoryChange(item.id)}
                    aria-pressed={isActive}
                  >
                    <span className="catalog-filter-option-icon"><CategoryIcon /></span>
                    <span>{item.label}</span>
                    <b className="catalog-filter-count">{item.count}</b>
                  </button>
                );
              })}
            </div>
          </FilterSection>

          <FilterSection icon={Tag} title="Цена">
            <div className="catalog-price-row">
              <input className="catalog-price-input" type="number" min="0" value={priceFrom} onChange={(event) => onPriceApply(event.target.value, priceTo)} placeholder="от" aria-label="Цена от" />
              <span>—</span>
              <input className="catalog-price-input" type="number" min="0" value={priceTo} onChange={(event) => onPriceApply(priceFrom, event.target.value)} placeholder="до" aria-label="Цена до" />
            </div>
          </FilterSection>

          <FilterSection icon={Layers3} title="Материал">
            <div className="catalog-filter-list catalog-filter-list--materials" role="radiogroup" aria-label="Материал">
              <button className={!selectedMaterial ? 'catalog-material-radio is-active' : 'catalog-material-radio'} type="button" role="radio" aria-checked={!selectedMaterial} onClick={() => onMaterialChange('')}>
                <Circle aria-hidden="true" /><span>Все материалы</span>
              </button>
              {materials.map((item) => (
                <button className={selectedMaterial === item.id ? 'catalog-material-radio is-active' : 'catalog-material-radio'} type="button" role="radio" aria-checked={selectedMaterial === item.id} key={item.id} onClick={() => onMaterialChange(item.id)}>
                  <Circle aria-hidden="true" /><span>{item.label}</span>
                </button>
              ))}
            </div>
          </FilterSection>
        </div>

        <footer className="catalog-filter-modern-actions">
          {activeFiltersCount > 0 && <button className="catalog-filter-reset" type="button" onClick={reset}>Сбросить фильтры</button>}
          <button className="catalog-filter-show-results" type="button" onClick={onClose}>Показать товары{resultsCount ? ` (${resultsCount})` : ''}</button>
        </footer>
      </aside>
    </>
  );
}
