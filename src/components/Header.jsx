import { Fragment, useEffect, useState } from 'react'
import logo from '../assets/img/logo.webp'
import { brand, navLinks, waLink, waMessages } from '../data/site'
import { IconInstagram, IconTikTok, IconMenu, IconClose, IconWhatsApp, IconBag, IconMoon } from './icons'
import { Motes } from './HalloweenFx'
import { Cobweb } from './HalloweenArt'
import SectionLink from './SectionLink'
import { useCart } from '../context/CartContext'
import { HALLOWEEN_ACTIVE } from '../data/campaign'

function CartButton({ className = '' }) {
  const { totalItems, openCart } = useCart()
  return (
    <button
      type="button"
      onClick={openCart}
      aria-label={totalItems > 0 ? `Ver carrito, ${totalItems} productos` : 'Ver carrito'}
      className={`relative flex items-center justify-center text-cream-100 transition-colors hover:text-gold-300 ${className}`}
    >
      <IconBag className="h-5 w-5" />
      {totalItems > 0 && (
        <span
          key={totalItems}
          className={`absolute -right-1.5 -top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 font-body text-[10px] font-medium leading-none text-night-950 motion-safe:animate-bump ${
            HALLOWEEN_ACTIVE ? 'bg-ember-500 shadow-[0_0_12px_rgba(255,106,0,0.75)]' : 'bg-gold-400'
          }`}
        >
          {totalItems}
        </span>
      )}
    </button>
  )
}

export default function Header({ open, onOpenChange }) {
  const [localOpen, setLocalOpen] = useState(false)
  const isOpen = open ?? localOpen
  const setOpen = onOpenChange ?? setLocalOpen

  useEffect(() => {
    if (!isOpen) return
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [isOpen, setOpen])

  return (
    <header className="sticky top-0 z-50 border-b border-gold-500/15 bg-night-950/95 shadow-[0_10px_30px_-14px_rgba(0,0,0,0.9)] backdrop-blur-md">
      {HALLOWEEN_ACTIVE && (
        <>
          {/* Luz de vela que sube desde el borde inferior + polvo dorado. */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(48%_130%_at_50%_135%,rgba(255,106,0,0.17),transparent_70%)]"
          />
          <Motes count={4} />
          <Cobweb className="absolute left-0 top-0 hidden h-14 w-14 text-cream-200/20 min-[1400px]:block" dew={false} />
          <Cobweb corner="tr" className="absolute right-0 top-0 hidden h-14 w-14 text-cream-200/20 min-[1400px]:block" dew={false} />
        </>
      )}
      <div className="relative mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:h-20 sm:px-6 lg:px-8">
        <SectionLink href="#inicio" className="relative flex items-center gap-2" aria-label="Gentleman Co, inicio">
          <img src={logo} alt="Gentleman Co" className="h-9 w-auto sm:h-11" width={277} height={220} />
        </SectionLink>

        <nav className="hidden items-center gap-8 lg:flex xl:gap-5" aria-label="Navegación principal">
          {navLinks.map((l, i) => (
            <Fragment key={l.href}>
              {HALLOWEEN_ACTIVE && i > 0 && (
                <IconMoon aria-hidden="true" className="hidden h-2.5 w-2.5 text-gold-500/45 xl:block" />
              )}
              <SectionLink
                href={l.href}
                className="hw-nav-link font-body text-sm uppercase tracking-wide text-cream-200/85 transition-colors hover:text-gold-300"
              >
                {l.label}
              </SectionLink>
            </Fragment>
          ))}
        </nav>

        <div className="hidden items-center gap-5 lg:flex">
          {brand.instagramUrl && (
            <a
              href={brand.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram de Gentleman Co"
              className="text-cream-200/70 transition-colors hover:text-gold-300"
            >
              <IconInstagram />
            </a>
          )}
          {brand.tiktokUrl && (
            <a
              href={brand.tiktokUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="TikTok de Gentleman Co"
              className="text-cream-200/70 transition-colors hover:text-gold-300"
            >
              <IconTikTok />
            </a>
          )}
          <CartButton />
          <a
            href={waLink(waMessages.catalog)}
            target="_blank"
            rel="noopener noreferrer"
            className="hw-btn-glow rounded-full border border-gold-400/60 bg-night-950/60 px-5 py-2.5 font-body text-xs uppercase tracking-wide text-gold-200 hover:border-gold-300 hover:bg-gold-500 hover:text-night-950"
          >
            Comprar por WhatsApp
          </a>
        </div>

        <div className="flex items-center gap-2.5 lg:hidden">
          <CartButton className="h-11 w-11 rounded-full border border-gold-500/30" />
          <a
            href={waLink(waMessages.catalog)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Comprar por WhatsApp"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-[#25D366] text-ink-900"
          >
            <IconWhatsApp className="h-5 w-5" />
          </a>
          <button
            type="button"
            onClick={() => setOpen(!isOpen)}
            aria-expanded={isOpen}
            aria-controls="mobile-nav"
            aria-label={isOpen ? 'Cerrar menú' : 'Abrir menú'}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-gold-500/30 text-cream-100"
          >
            {isOpen ? <IconClose className="h-5 w-5" /> : <IconMenu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {HALLOWEEN_ACTIVE && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-ember-500/60 to-transparent"
        />
      )}

      <div
        id="mobile-nav"
        {...(isOpen ? {} : { inert: '' })}
        className={`relative grid overflow-hidden transition-[grid-template-rows] duration-300 ease-out lg:hidden ${
          isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        }`}
      >
        <nav className="min-h-0 overflow-hidden border-t border-gold-500/15 bg-night-950 px-4" aria-label="Navegación móvil">
          <div className="flex flex-col gap-1 py-4">
            {navLinks.map((l) => (
              <SectionLink
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-3 font-body text-sm uppercase tracking-wide text-cream-100 transition-colors hover:bg-night-800 hover:text-gold-300"
              >
                {HALLOWEEN_ACTIVE && <IconMoon aria-hidden="true" className="h-3 w-3 shrink-0 text-ember-400/80" />}
                {l.label}
              </SectionLink>
            ))}
            {(brand.instagramUrl || brand.tiktokUrl) && (
              <div className="mt-2 flex items-center gap-3 px-1 py-2">
                {brand.instagramUrl && (
                  <a
                    href={brand.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram"
                    className="flex h-11 w-11 items-center justify-center text-cream-200/70 hover:text-gold-300"
                  >
                    <IconInstagram />
                  </a>
                )}
                {brand.tiktokUrl && (
                  <a
                    href={brand.tiktokUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="TikTok"
                    className="flex h-11 w-11 items-center justify-center text-cream-200/70 hover:text-gold-300"
                  >
                    <IconTikTok />
                  </a>
                )}
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  )
}
