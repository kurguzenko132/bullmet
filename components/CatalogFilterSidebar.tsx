'use client';

import { useRef, useState } from 'react';
import { useAccessibleDialog } from '@/lib/useAccessibleDialog';
import {
  Check,
  ChevronDown,
  LayoutGrid,
  Palette,
  SlidersHorizontal,
  Tag,
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
  clockProductsCount: number;
  selectedCategory: string;
  selectedMaterial: string;
  priceFrom: string;
  priceTo: string;
  priceError?: string;
  activeFiltersCount: number;
  resultsCount: number;
  isOpen: boolean;
  onClose: () => void;
  onCategoryChange: (category: string) => void;
  onMaterialChange: (material: string) => void;
  onPriceApply: (priceFrom: string, priceTo: string) => void;
  onReset: () => void;
};

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
  clockProductsCount,
  selectedCategory,
  selectedMaterial,
  priceFrom,
  priceTo,
  priceError,
  activeFiltersCount,
  resultsCount,
  isOpen,
  onClose,
  onCategoryChange,
  onMaterialChange,
  onPriceApply,
  onReset
}: CatalogFilterSidebarProps) {
  const drawerRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [clockCategoriesOpen, setClockCategoriesOpen] = useState(false);
  useAccessibleDialog({ open: isOpen, onClose, dialogRef: drawerRef, initialFocusRef: closeButtonRef });

  function reset() {
    onReset();
  }

  const selectedClockCategories = selectedCategory.split('||').filter((item) => item && item !== '__all_clocks__');
  const allClocksSelected = selectedCategory === '__all_clocks__';

  function toggleClockCategory(category: string) {
    const next = new Set(allClocksSelected ? [] : selectedClockCategories);
    if (next.has(category)) next.delete(category);
    else next.add(category);
    onCategoryChange(Array.from(next).join('||'));
  }

  const selectedColors = selectedMaterial.split('||').filter(Boolean);

  function toggleColor(color: string) {
    const next = new Set(selectedColors);
    if (next.has(color)) next.delete(color);
    else next.add(color);
    onMaterialChange(Array.from(next).join('||'));
  }

  return (
    <>
      <div className={isOpen ? 'catalog-filter-drawer-backdrop is-open' : 'catalog-filter-drawer-backdrop'} onClick={onClose} aria-hidden="true" />
      <aside ref={drawerRef} className={isOpen ? 'catalog-filter-modern is-open' : 'catalog-filter-modern'} role={isOpen ? 'dialog' : undefined} aria-modal={isOpen || undefined} aria-label="Фильтры каталога" tabIndex={-1}>
        <header className="catalog-filter-modern-head">
          <b>Фильтры</b>
          <SlidersHorizontal aria-hidden="true" />
          <button ref={closeButtonRef} className="catalog-filter-modern-close" type="button" onClick={onClose} aria-label="Закрыть фильтры"><X /></button>
        </header>

        <div className="catalog-filter-modern-scroll">
          <FilterSection icon={LayoutGrid} title="Категории">
            <div className="catalog-filter-list catalog-filter-list--categories">
              <button className={selectedCategory ? 'catalog-filter-option' : 'catalog-filter-option is-active'} type="button" onClick={() => onCategoryChange('')}>
                <span className="catalog-filter-option-check" aria-hidden="true">{!selectedCategory && <Check />}</span>
                <span>Все товары</span>
                <b className="catalog-filter-count">{productsCount}</b>
              </button>
              <div className="catalog-filter-clock-group">
                <div className="catalog-filter-clock-parent">
                  <button className={allClocksSelected ? 'catalog-filter-option is-active' : 'catalog-filter-option'} type="button" onClick={() => onCategoryChange(allClocksSelected ? '' : '__all_clocks__')} role="checkbox" aria-checked={allClocksSelected}>
                    <span className="catalog-filter-option-check" aria-hidden="true">{allClocksSelected && <Check />}</span>
                    <span>Все часы</span>
                    <b className="catalog-filter-count">{clockProductsCount}</b>
                  </button>
                  <button className="catalog-filter-clock-toggle" type="button" onClick={() => setClockCategoriesOpen((value) => !value)} aria-label={clockCategoriesOpen ? 'Свернуть категории часов' : 'Показать категории часов'} aria-expanded={clockCategoriesOpen}>
                    <ChevronDown className={clockCategoriesOpen ? 'is-open' : ''} aria-hidden="true" />
                  </button>
                </div>
                {clockCategoriesOpen && <div className="catalog-filter-clock-children">
                  {categories.map((item) => {
                    const isActive = selectedClockCategories.includes(item.id);
                    const isDisabled = item.count === 0;
                    return (
                      <button
                        className={`catalog-filter-option${isActive ? ' is-active' : ''}${isDisabled ? ' is-disabled' : ''}`}
                        type="button"
                        key={item.id}
                        onClick={() => toggleClockCategory(item.id)}
                        role="checkbox"
                        aria-checked={isActive}
                      >
                        <span className="catalog-filter-option-check" aria-hidden="true">{isActive && <Check />}</span>
                        <span>{item.label}</span>
                        <b className="catalog-filter-count">{item.count}</b>
                      </button>
                    );
                  })}
                </div>}
              </div>
            </div>
          </FilterSection>

          <FilterSection icon={Tag} title="Цена">
            <div className="catalog-price-row">
              <input className="catalog-price-input" type="number" min="0" value={priceFrom} onChange={(event) => onPriceApply(event.target.value, priceTo)} placeholder="от" aria-label="Цена от" />
              <span>—</span>
              <input className="catalog-price-input" type="number" min="0" value={priceTo} onChange={(event) => onPriceApply(priceFrom, event.target.value)} placeholder="до" aria-label="Цена до" />
            </div>
            {priceError && <p className="catalog-filter-price-error" role="alert">{priceError}</p>}
          </FilterSection>

          <FilterSection icon={Palette} title="Цвет">
            <div className="catalog-filter-list catalog-filter-list--materials" aria-label="Цвет">
              <button className={!selectedColors.length ? 'catalog-material-radio is-active' : 'catalog-material-radio'} type="button" onClick={() => onMaterialChange('')} role="checkbox" aria-checked={!selectedColors.length}>
                <span className="catalog-filter-option-check" aria-hidden="true">{!selectedColors.length && <Check />}</span><span>Все цвета</span>
              </button>
              {materials.map((item) => {
                const isActive = selectedColors.includes(item.id);
                return <button className={isActive ? 'catalog-material-radio is-active' : 'catalog-material-radio'} type="button" role="checkbox" aria-checked={isActive} key={item.id} onClick={() => toggleColor(item.id)}>
                  <span className="catalog-filter-option-check" aria-hidden="true">{isActive && <Check />}</span><span>{item.label}</span>
                </button>;
              })}
            </div>
          </FilterSection>
        </div>

        <footer className="catalog-filter-modern-actions">
          <button className="catalog-filter-reset" type="button" onClick={reset}>Сбросить фильтры</button>
          <button className="catalog-filter-show-results" type="button" onClick={onClose}>Показать товары{resultsCount ? ` (${resultsCount})` : ''}</button>
        </footer>
      </aside>
    </>
  );
}
