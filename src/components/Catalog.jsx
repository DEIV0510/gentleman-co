import { useEffect, useMemo, useState } from 'react'
import { CATEGORIES, brands, formatCOP, products, searchProducts } from '../data/products'
import ProductCard from './ProductCard'
import ProductRow from './ProductRow'
import Reveal from './Reveal'
import SectionDivider from './SectionDivider'
import { HalloweenMark, Motes } from './HalloweenFx'
import { Cobweb, Spider } from './HalloweenArt'
import { IconSearch, IconFlame, IconRose, IconMoon } from './icons'
import { HALLOWEEN_ACTIVE, halloweenCopy } from '../data/campaign'

const CATEGORY_FILTERS = [
  { key: 'todos', label: 'Todos' },
  { key: 'caballero', label: 'Caballeros' },
  { key: 'dama', label: 'Damas' },
  { key: 'unisex', label: 'Unisex' },
]

const SORTS = [
  { key: 'orden', label: 'Orden del catálogo' },
  { key: 'precio-asc', label: 'Menor precio' },
  { key: 'precio-desc', label: 'Mayor precio' },
  { key: 'az', label: 'Nombre A–Z' },
]

const SECTION_DEFS = [
  { key: CATEGORIES.CABALLERO, label: 'Perfumería Caballero', filterKey: 'caballero', Icon: IconFlame },
  { key: CATEGORIES.DAMA, label: 'Perfumería Dama', filterKey: 'dama', Icon: IconRose },
  { key: CATEGORIES.UNISEX, label: 'Perfumería Unisex', filterKey: 'unisex', Icon: IconMoon },
]

// Precio más bajo real del catálogo, para el "Desde …" del encabezado.
const cheapest = products.reduce((min, p) => (p.price < min.price ? p : min), products[0])
const fromLabel = `Desde ${formatCOP(cheapest.price)}${cheapest.sizes?.[0]?.label ? ` · ${cheapest.sizes[0].label}` : ''}`

// Búsqueda y filtros se guardan en la sesión: al abrir una ficha y volver
// con "Atrás", el catálogo sigue como el cliente lo dejó.
const FILTERS_KEY = 'gentleman-catalog-filters'
const DEFAULT_FILTERS = { query: '', category: 'todos', brand: 'todas', sort: 'orden' }

function readFilters() {
  try {
    const saved = JSON.parse(sessionStorage.getItem(FILTERS_KEY) || 'null')
    if (!saved || typeof saved !== 'object') return DEFAULT_FILTERS
    return {
      query: typeof saved.query === 'string' ? saved.query : '',
      category: CATEGORY_FILTERS.some((f) => f.key === saved.category) ? saved.category : 'todos',
      brand: saved.brand === 'todas' || brands.includes(saved.brand) ? saved.brand : 'todas',
      sort: SORTS.some((s) => s.key === saved.sort) ? saved.sort : 'orden',
    }
  } catch {
    return DEFAULT_FILTERS
  }
}

export default function Catalog() {
  const [initial] = useState(readFilters)
  const [query, setQuery] = useState(initial.query)
  const [category, setCategory] = useState(initial.category)
  const [brand, setBrand] = useState(initial.brand)
  const [sort, setSort] = useState(initial.sort)

  useEffect(() => {
    try {
      sessionStorage.setItem(FILTERS_KEY, JSON.stringify({ query, category, brand, sort }))
    } catch {
      // sin sessionStorage (modo privado estricto): los filtros solo duran en la página
    }
  }, [query, category, brand, sort])

  useEffect(() => {
    function handler(e) {
      if (!CATEGORY_FILTERS.some((f) => f.key === e.detail)) return
      setCategory(e.detail)
      setQuery('')
      setBrand('todas')
    }
    window.addEventListener('gentleman-co:filter-category', handler)
    return () => window.removeEventListener('gentleman-co:filter-category', handler)
  }, [])

  const sections = useMemo(() => {
    return SECTION_DEFS.filter((def) => category === 'todos' || category === def.filterKey).map((def) => {
      let list = products.filter((p) => p.category === def.key)
      if (brand !== 'todas') list = list.filter((p) => p.brand === brand)
      if (query.trim()) list = searchProducts(list, query)

      if (sort === 'precio-asc') list = [...list].sort((a, b) => a.price - b.price)
      if (sort === 'precio-desc') list = [...list].sort((a, b) => b.price - a.price)
      if (sort === 'az') list = [...list].sort((a, b) => a.title.localeCompare(b.title, 'es'))

      return { ...def, items: list }
    })
  }, [query, category, brand, sort])

  const totalCount = sections.reduce((sum, s) => sum + s.items.length, 0)

  return (
    <section
      id="catalogo"
      className={`relative scroll-mt-20 overflow-hidden border-y border-gold-500/10 bg-night-950 py-16 sm:scroll-mt-24 sm:py-24 ${
        HALLOWEEN_ACTIVE ? 'pt-24 sm:pt-28' : 'hw-top-line'
      }`}
    >
      {HALLOWEEN_ACTIVE && (
        <>
          <div aria-hidden="true" className="hw-glow-top pointer-events-none absolute inset-x-0 top-0 h-96" />
          <SectionDivider icon="spider" />
          <Cobweb className="absolute left-0 top-0 hidden h-44 w-44 text-cream-200/20 md:block" />
          <Cobweb corner="tr" className="absolute right-0 top-0 h-28 w-28 text-cream-200/20 md:h-40 md:w-40" />
          <Spider className="absolute right-[9%] top-0 hidden md:block" drop={150} size={26} />
          <Motes className="h-[28rem]" />
        </>
      )}
      <div className="relative mx-auto max-w-7xl px-6 sm:px-8 lg:px-8">
        <Reveal className="mx-auto max-w-xl text-center">
          {HALLOWEEN_ACTIVE && (
            <HalloweenMark className="mx-auto mb-3 justify-center text-2xl sm:text-[1.7rem]" />
          )}
          <p className="section-eyebrow text-gold-400">Catálogo completo</p>
          <h2 className="mt-3 font-display text-3xl text-balance text-cream-50 sm:text-4xl">
            Descubre tu fragancia
          </h2>
          <p className="mt-3 font-body text-sm text-ink-300 sm:text-base">
            {products.length} fragancias inspiradas, mismo frasco Gentleman Co. {fromLabel}.
          </p>
          {HALLOWEEN_ACTIVE && (
            <p className="mt-1 font-display text-sm italic text-ember-300">{halloweenCopy.catalogLine}</p>
          )}
        </Reveal>

        <Reveal delay={80} className="mt-8 space-y-4 sm:mt-10">
          <div className="relative mx-auto max-w-md">
            <IconSearch className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-300" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por nombre o marca…"
              aria-label="Buscar perfume por nombre o marca"
              className="w-full rounded-full border border-gold-500/25 bg-night-800 py-3 pl-11 pr-4 font-body text-sm text-cream-50 placeholder:text-ink-300/80 focus:border-gold-400"
            />
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            {CATEGORY_FILTERS.map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => setCategory(f.key)}
                aria-pressed={category === f.key}
                className={`min-h-11 rounded-full border px-4 font-body text-xs uppercase tracking-wide transition-colors sm:text-sm ${
                  category === f.key
                    ? 'border-gold-500 bg-gold-500 text-night-950'
                    : 'border-gold-500/25 bg-night-800 text-cream-200/85 hover:border-gold-400/70 hover:text-gold-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <label className="flex items-center gap-2 font-body text-xs text-ink-300">
              Marca
              <select
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="min-h-11 rounded-full border border-gold-500/25 bg-night-800 px-3 font-body text-xs text-cream-100 sm:text-sm"
              >
                <option value="todas">Todas</option>
                {brands.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex items-center gap-2 font-body text-xs text-ink-300">
              Ordenar
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="min-h-11 rounded-full border border-gold-500/25 bg-night-800 px-3 font-body text-xs text-cream-100 sm:text-sm"
              >
                {SORTS.map((s) => (
                  <option key={s.key} value={s.key}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </Reveal>

        {totalCount === 0 ? (
          <p className="mt-16 text-center font-body text-sm text-ink-300">
            No encontramos fragancias con ese criterio. Prueba con otro nombre o marca.
          </p>
        ) : (
          <div className="mt-10 space-y-10 sm:mt-12 sm:space-y-14">
            {sections.map(
              (section) =>
                section.items.length > 0 && (
                  <div key={section.key}>
                    <div className="mb-4 flex items-center gap-3 sm:mb-6">
                      {HALLOWEEN_ACTIVE && (
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gold-500/30 bg-night-900 text-ember-400 shadow-[0_0_16px_-4px_rgba(255,106,0,0.7)]">
                          <section.Icon className="h-4 w-4" />
                        </span>
                      )}
                      <h3 className="whitespace-nowrap font-display text-xl text-cream-50 sm:text-2xl">
                        {section.label}
                      </h3>
                      <span className="font-body text-xs text-ink-300">{section.items.length}</span>
                      <span
                        aria-hidden="true"
                        className={`h-px flex-1 bg-gradient-to-r to-transparent ${
                          HALLOWEEN_ACTIVE ? 'from-ember-500/45 via-gold-500/20' : 'from-gold-500/30'
                        }`}
                      />
                    </div>

                    <ProductRow>
                      {section.items.map((product, i) => (
                        <ProductCard key={product.id} product={product} eager={i < 4} web={HALLOWEEN_ACTIVE && i % 3 === 1} />
                      ))}
                    </ProductRow>
                  </div>
                )
            )}
          </div>
        )}
      </div>
    </section>
  )
}
