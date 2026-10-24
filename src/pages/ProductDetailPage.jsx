import { useState } from 'react'
import { useParams, Link, Navigate } from 'react-router-dom'
import spotlightAvif from '../assets/img/spotlight-bottle.avif'
import spotlightWebp from '../assets/img/spotlight-bottle.webp'
import spotlightJpg from '../assets/img/spotlight-bottle.jpg'
import labelAvif from '../assets/img/label-detail.avif'
import labelWebp from '../assets/img/label-detail.webp'
import labelJpg from '../assets/img/label-detail.jpg'
import heroAvif from '../assets/img/hero-bottle.avif'
import heroWebp from '../assets/img/hero-bottle.webp'
import heroJpg from '../assets/img/hero-bottle.jpg'
import Breadcrumbs from '../components/Breadcrumbs'
import Reveal from '../components/Reveal'
import { CATEGORIES, formatCOP, getProductById, getRelatedProducts } from '../data/products'
import { getProductImage } from '../data/productImages'
import { getFragranceInfo } from '../data/fragranceInfo'
import { SITE_URL, waLink } from '../data/site'
import { useCart, DEFAULT_SIZE_LABEL } from '../context/CartContext'
import useDocumentMeta from '../hooks/useDocumentMeta'
import { IconWhatsApp, IconBagPlus, IconPumpkin } from '../components/icons'
import { Embers, Fog, Motes } from '../components/HalloweenFx'
import { Cobweb, Moon, Bats } from '../components/HalloweenArt'
import AddiOption from '../components/AddiOption'
import { HALLOWEEN_ACTIVE, halloweenCopy } from '../data/campaign'

// La primera foto (principal) es la real de ESTE producto (ver
// data/productImages.js); las otras 3 son recortes reales del mismo frasco
// físico compartido por toda la colección (source-material/
// botella-oficial-ambiente.png), iguales para todos los productos.
function buildGallery(product) {
  const principal = getProductImage(product.image)
  return [
    { key: 'principal', ...principal, alt: 'Frasco de Gentleman Co' },
    { key: 'vista', avif: spotlightAvif, webp: spotlightWebp, jpg: spotlightJpg, alt: 'Gentleman Co sobre madera' },
    { key: 'detalle', avif: labelAvif, webp: labelWebp, jpg: labelJpg, alt: 'Detalle de la etiqueta de Gentleman Co' },
    { key: 'presentacion', avif: heroAvif, webp: heroWebp, jpg: heroJpg, alt: 'Gentleman Co junto a la colección' },
  ]
}

// Un slug inexistente vuelve al inicio. `key` hace que cada ficha arranque de
// cero: al pasar de un perfume a otro (ej. desde "También podría gustarte")
// no se arrastran la foto ni la talla elegidas en la ficha anterior.
export default function ProductDetailPage() {
  const { slug } = useParams()
  const product = getProductById(slug)
  if (!product) return <Navigate to="/" replace />
  return <ProductDetail key={product.id} product={product} />
}

function ProductDetail({ product }) {
  const [active, setActive] = useState(0)
  const [selectedSize, setSelectedSize] = useState(null)
  const { addItem } = useCart()

  const info = getFragranceInfo(product.id)
  const categoryLabel =
    product.category === CATEGORIES.DAMA ? 'Dama' : product.category === CATEGORIES.UNISEX ? 'Unisex' : 'Caballero'
  const related = getRelatedProducts(product, 4)
  const sizes = product.sizes || [{ label: DEFAULT_SIZE_LABEL, price: product.price }]
  const size = selectedSize || sizes[0]
  const message = `Hola, Gentleman Co. Estoy interesado/a en ${product.fullName}${
    size.label !== DEFAULT_SIZE_LABEL ? ` (${size.label})` : ''
  } por $${size.price.toLocaleString('es-CO')} COP. ¿Me pueden confirmar disponibilidad?`

  const handleAddToCart = () => addItem(product, size)

  const gallery = buildGallery(product)

  useDocumentMeta({
    title: `${product.title} | Gentleman Co`,
    description: `${product.title}, fragancia inspirada de Gentleman Co (${product.category}). ${formatCOP(product.price)}. Elaborada en Ibagué, Tolima — compra por WhatsApp.`,
    path: `/perfumes/${product.id}`,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: `Gentleman Co — ${product.title}`,
      image: `${SITE_URL}${gallery[0].jpg}`,
      description: `Fragancia inspirada, ${product.category.toLowerCase()}.`,
      brand: { '@type': 'Brand', name: 'Gentleman Co' },
      offers: {
        '@type': 'Offer',
        priceCurrency: 'COP',
        price: product.price,
        url: `${SITE_URL}/perfumes/${product.id}`,
      },
    },
  })

  const current = gallery[active]

  return (
    <div className="relative overflow-hidden bg-night-950 pb-16 pt-6 sm:pb-24 sm:pt-8">
      {HALLOWEEN_ACTIVE && (
        <>
          <div aria-hidden="true" className="hw-glow-top pointer-events-none absolute inset-x-0 top-0 h-80" />
          <Motes count={6} className="h-[32rem]" />
          <Fog className="inset-x-0 bottom-0 h-48" />
        </>
      )}
      <div className="relative mx-auto max-w-6xl px-6 sm:px-8 lg:px-8">
        <Breadcrumbs
          items={[
            { label: 'Inicio', to: '/' },
            { label: 'Perfumería', to: '/#catalogo' },
            { label: categoryLabel, to: '/#catalogo' },
            { label: product.title },
          ]}
        />

        <div className="mt-6 grid gap-8 lg:grid-cols-2 lg:gap-14">
          {/* Móvil: foto primero. Desktop: foto a la derecha (order-2). */}
          <div className="order-1 lg:order-2">
            <div className="relative">
              <Reveal>
                <div
                  className={`relative overflow-hidden rounded-3xl border border-gold-500/30 shadow-[0_30px_70px_-34px_rgba(0,0,0,0.95),0_0_70px_-30px_rgba(255,106,0,0.45)] ${
                    HALLOWEEN_ACTIVE
                      ? 'bg-[radial-gradient(65%_55%_at_50%_72%,rgba(255,106,0,0.2),transparent_70%),linear-gradient(180deg,#131211,#080808)]'
                      : 'bg-ink-900'
                  }`}
                >
                  {HALLOWEEN_ACTIVE && (
                    <>
                      <Moon soft className="absolute right-[7%] top-[6%] aspect-square w-[22%] opacity-90" />
                      <Bats
                        rim
                        bats={[
                          { left: '-40%', top: '50%', w: '34%', delay: '-0.7s' },
                          { left: '60%', top: '-14%', w: '22%', delay: '-2.2s' },
                        ]}
                        className="absolute right-[7%] top-[6%] aspect-square w-[22%]"
                      />
                      <Cobweb className="absolute left-0 top-0 h-24 w-24 text-cream-200/25 sm:h-32 sm:w-32" />
                    </>
                  )}
                  <picture>
                    <source srcSet={current.avif} type="image/avif" />
                    <source srcSet={current.webp} type="image/webp" />
                    <img
                      src={current.jpg}
                      alt={`${current.alt} — ${product.fullName}`}
                      className="relative aspect-square w-full object-contain p-8 sm:p-10"
                      loading="eager"
                      fetchpriority="high"
                      width={900}
                      height={900}
                    />
                  </picture>
                </div>
              </Reveal>
              {HALLOWEEN_ACTIVE && <Embers density="light" className="rounded-3xl" />}
            </div>
            <Reveal className="mt-3 flex gap-2">
              {gallery.map((g, i) => (
                <button
                  key={g.key}
                  type="button"
                  onClick={() => setActive(i)}
                  aria-label={`Ver imagen: ${g.alt}`}
                  aria-pressed={active === i}
                  className={`h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 bg-night-800 transition-all sm:h-20 sm:w-20 ${
                    active === i
                      ? HALLOWEEN_ACTIVE
                        ? 'border-ember-500 shadow-[0_0_16px_-4px_rgba(255,106,0,0.8)]'
                        : 'border-gold-400'
                      : 'border-gold-500/20 hover:border-gold-500/50'
                  }`}
                >
                  <img src={g.jpg} alt="" className="h-full w-full object-contain p-1.5" />
                </button>
              ))}
            </Reveal>
          </div>

          {/* Móvil: nombre/precio/CTA justo después de la foto. */}
          <Reveal delay={80} className="order-2 lg:order-1">
            <p className="section-eyebrow text-gold-400">{product.category}</p>
            <h1 className="hw-glow-text mt-2 font-display text-3xl leading-tight text-cream-50 sm:text-4xl">{product.title}</h1>
            <p className="mt-1 font-body text-sm text-ink-300">Inspirado en {product.brand}</p>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              {info?.family && (
                <span className="inline-flex w-fit items-center rounded-full border border-gold-500/25 bg-gold-500/10 px-3 py-1 font-body text-[11px] uppercase tracking-wide text-gold-200">
                  Familia olfativa: {info.family}
                </span>
              )}
              {HALLOWEEN_ACTIVE && (
                <span className="inline-flex w-fit items-center gap-1 rounded-full border border-ember-500/40 bg-ember-500/10 px-3 py-1 font-body text-[11px] uppercase tracking-wide text-ember-300">
                  <IconPumpkin className="h-3.5 w-3.5" />
                  {halloweenCopy.giftBadge}
                </span>
              )}
            </div>

            {info?.profile ? (
              <p className="mt-4 font-body text-base leading-relaxed text-cream-200/75">{info.profile}</p>
            ) : (
              <p className="mt-4 font-body text-base leading-relaxed text-cream-200/75">
                Una fragancia inspirada de Gentleman Co, elaborada en Ibagué, Tolima.
              </p>
            )}

            <div className="mt-6 border-t border-gold-500/15 pt-6">
              {sizes.length > 1 ? (
                <>
                  <p className="font-body text-xs uppercase tracking-wide text-ink-300">Elige tu presentación</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {sizes.map((s) => (
                      <button
                        key={s.label}
                        type="button"
                        onClick={() => setSelectedSize(s)}
                        aria-pressed={size.label === s.label}
                        className={`rounded-full border px-4 py-2 font-body text-sm transition-colors ${
                          size.label === s.label
                            ? 'border-gold-400 bg-gold-500/15 text-gold-200'
                            : 'border-gold-500/25 text-cream-200/85 hover:border-gold-400/60'
                        }`}
                      >
                        {s.label} · {formatCOP(s.price)}
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <p className="font-display text-3xl text-gold-300">{formatCOP(product.price)}</p>
                  {size.label !== DEFAULT_SIZE_LABEL && (
                    <p className="mt-1 font-body text-sm text-ink-300">{size.label}</p>
                  )}
                </>
              )}

              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className={`flex w-full items-center justify-center gap-2 rounded-full py-4 font-body text-sm uppercase tracking-wide hover:scale-[1.01] sm:w-fit sm:px-10 ${
                    HALLOWEEN_ACTIVE ? 'hw-btn-orange font-medium' : 'hw-btn-glow bg-gold-500 text-night-950 hover:bg-gold-400'
                  }`}
                >
                  <IconBagPlus className="h-4 w-4" />
                  Agregar al carrito
                </button>

                <a
                  href={waLink(message)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] py-4 font-body text-sm uppercase tracking-wide text-ink-900 transition-transform duration-200 hover:scale-[1.01] sm:w-fit sm:px-10"
                >
                  <IconWhatsApp className="h-4 w-4" />
                  Comprar por WhatsApp
                </a>
              </div>
              <AddiOption
                variant="button"
                name={product.fullName}
                price={size.price}
                sizeLabel={size.label !== DEFAULT_SIZE_LABEL ? size.label : undefined}
                className="mt-3"
              />
            </div>

            {(info?.topNotes?.length > 0 || info?.heartNotes?.length > 0 || info?.baseNotes?.length > 0) && (
              <div className="mt-8 border-t border-gold-500/15 pt-6">
                <p className="font-display text-lg text-cream-50">Perfil olfativo</p>
                <div className="mt-3 space-y-2.5 font-body text-sm text-cream-200/75">
                  {info.topNotes?.length > 0 && (
                    <p>
                      <span className="font-medium text-gold-200">Salida —</span> {info.topNotes.join(' · ')}
                    </p>
                  )}
                  {info.heartNotes?.length > 0 && (
                    <p>
                      <span className="font-medium text-gold-200">Corazón —</span> {info.heartNotes.join(' · ')}
                    </p>
                  )}
                  {info.baseNotes?.length > 0 && (
                    <p>
                      <span className="font-medium text-gold-200">Fondo —</span> {info.baseNotes.join(' · ')}
                    </p>
                  )}
                </div>
              </div>
            )}

            {(info?.occasions?.length > 0 || info?.season?.length > 0 || info?.timeOfDay?.length > 0) && (
              <div className="mt-8 border-t border-gold-500/15 pt-6">
                <p className="font-display text-lg text-cream-50">¿Cuándo usarlo?</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {[...(info.occasions || []), ...(info.timeOfDay || []), ...(info.season || [])].map((tag, i) => (
                    <span
                      key={`${tag}-${i}`}
                      className="rounded-full border border-gold-500/20 bg-night-800 px-3 py-1.5 font-body text-xs text-cream-200/85"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </Reveal>
        </div>

        {related.length > 0 && (
          <Reveal delay={120} className="mt-16 border-t border-gold-500/15 pt-10 sm:mt-20">
            <p className="font-display text-xl text-cream-50 sm:text-2xl">También podría gustarte</p>
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {related.map((p) => {
                const relatedImg = getProductImage(p.image)
                return (
                  <Link
                    key={p.id}
                    to={`/perfumes/${p.id}`}
                    className="hw-card group overflow-hidden rounded-2xl border border-gold-500/20 bg-night-800 shadow-[0_18px_40px_-24px_rgba(0,0,0,0.95)]"
                  >
                    <span className="block aspect-square w-full bg-ink-900">
                      <picture>
                        <source srcSet={relatedImg.avif} type="image/avif" />
                        <source srcSet={relatedImg.webp} type="image/webp" />
                        <img
                          src={relatedImg.jpg}
                          alt={p.fullName}
                          className="h-full w-full object-contain p-3 transition-transform duration-300 group-hover:scale-105"
                          loading="lazy"
                          width={200}
                          height={200}
                        />
                      </picture>
                    </span>
                    <span className="block p-3">
                      <span className="line-clamp-2 block font-display text-sm text-cream-50">{p.title}</span>
                      <span className="mt-1 block font-display text-sm text-gold-300">{formatCOP(p.price)}</span>
                    </span>
                  </Link>
                )
              })}
            </div>
          </Reveal>
        )}
      </div>
    </div>
  )
}
