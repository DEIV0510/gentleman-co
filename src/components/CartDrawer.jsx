import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { formatCOP } from '../data/products'
import { promoNotice } from '../data/cart'
import { useCart } from '../context/CartContext'
import CartItemRow from './CartItemRow'
import { AddiBadge } from './AddiOption'
import { Motes } from './HalloweenFx'
import { Cobweb } from './HalloweenArt'
import { IconBag, IconX, IconPumpkin } from './icons'
import { HALLOWEEN_ACTIVE } from '../data/campaign'

const FOCUSABLE_SELECTOR = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'

export default function CartDrawer() {
  const { items, totalItems, subtotal, drawerOpen, closeCart, openCheckout } = useCart()
  const panelRef = useRef(null)
  const closeBtnRef = useRef(null)
  const previouslyFocused = useRef(null)

  useEffect(() => {
    if (!drawerOpen) return
    previouslyFocused.current = document.activeElement
    closeBtnRef.current?.focus()
    document.body.style.overflow = 'hidden'

    const onKey = (e) => {
      if (e.key === 'Escape') {
        closeCart()
        return
      }
      if (e.key !== 'Tab' || !panelRef.current) return
      const focusable = [...panelRef.current.querySelectorAll(FOCUSABLE_SELECTOR)]
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
      previouslyFocused.current?.focus?.()
    }
  }, [drawerOpen, closeCart])

  const isEmpty = items.length === 0
  const promo = promoNotice(totalItems)

  return (
    <div
      className={`fixed inset-0 z-[95] overflow-hidden transition-opacity duration-300 ease-out ${
        drawerOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
      }`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="cart-drawer-title"
      {...(drawerOpen ? {} : { inert: '' })}
    >
      <div className="absolute inset-0 bg-night-950/80 backdrop-blur-sm" onClick={closeCart} />

      <div
        ref={panelRef}
        className={`absolute inset-y-0 right-0 flex h-full w-full max-w-md flex-col overflow-hidden border-l border-gold-500/25 bg-night-950 shadow-[-24px_0_60px_rgba(0,0,0,0.75)] transition-transform duration-300 ease-out ${
          drawerOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {HALLOWEEN_ACTIVE && drawerOpen && (
          <>
            <div aria-hidden="true" className="hw-glow-top pointer-events-none absolute inset-x-0 top-0 h-56" />
            <Cobweb corner="tr" dew={false} className="absolute right-0 top-0 h-24 w-24 text-cream-200/25" />
            <Motes count={5} className="h-28" />
          </>
        )}

        <div className="relative flex items-center justify-between border-b border-gold-500/15 px-5 py-4 sm:px-7">
          <div>
            <h2 id="cart-drawer-title" className="flex items-center gap-2 font-display text-xl text-cream-50">
              {HALLOWEEN_ACTIVE && <IconPumpkin className="h-5 w-5 text-ember-500 [filter:drop-shadow(0_0_6px_rgba(255,106,0,0.7))]" />}
              Tu carrito
            </h2>
            {!isEmpty && (
              <p className="mt-0.5 font-body text-xs text-ink-300">
                {totalItems} {totalItems === 1 ? 'producto' : 'productos'}
              </p>
            )}
          </div>
          <button
            ref={closeBtnRef}
            type="button"
            onClick={closeCart}
            aria-label="Cerrar carrito"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gold-500/30 bg-night-950 text-cream-100 transition-colors hover:border-ember-500 hover:text-ember-300"
          >
            <IconX className="h-4 w-4" />
          </button>
        </div>

        {isEmpty ? (
          <div className="relative flex flex-1 flex-col items-center justify-center px-8 text-center">
            <span className="flex h-20 w-20 items-center justify-center rounded-full bg-ember-500/10 text-ember-300 shadow-[0_0_40px_-10px_rgba(255,106,0,0.7)] ring-1 ring-gold-500/25">
              <IconBag className="h-9 w-9" />
            </span>
            <p className="mt-6 font-display text-xl text-cream-50">Tu colección está esperando.</p>
            <p className="mt-2 font-body text-sm leading-relaxed text-ink-300">
              Aún no has elegido tu próxima fragancia. Explora el catálogo y encuentra la tuya.
            </p>
            <Link
              to="/#catalogo"
              onClick={closeCart}
              className={`mt-7 inline-flex items-center justify-center rounded-full px-8 py-3.5 font-body text-xs uppercase tracking-wide ${
                HALLOWEEN_ACTIVE ? 'hw-btn-orange font-medium' : 'hw-btn-glow bg-gold-500 text-night-950 hover:bg-gold-400'
              }`}
            >
              Explorar perfumes
            </Link>
          </div>
        ) : (
          <>
            <ul className="relative flex-1 divide-y divide-gold-500/10 overflow-y-auto px-5 sm:px-7">
              {items.map((item) => (
                <CartItemRow key={item.lineId} item={item} />
              ))}
            </ul>

            <div className="relative border-t border-gold-500/20 bg-night-900 px-5 py-5 sm:px-7">
              <div className="space-y-2 font-body text-sm">
                <div className="flex items-center justify-between text-cream-200/85">
                  <span>Subtotal</span>
                  <span className="tabular-nums">{formatCOP(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between text-ink-300">
                  <span>Envío</span>
                  <span>Calcular al finalizar</span>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-gold-500/15 pt-3">
                <span className="font-display text-base text-cream-50">Total</span>
                <span className="font-display text-2xl tabular-nums text-gold-300">{formatCOP(subtotal)}</span>
              </div>
              {promo && (
                <p className="mt-3 rounded-xl border border-gold-500/25 bg-gold-500/10 px-3 py-2 text-center font-body text-xs leading-relaxed text-gold-200">
                  {promo}
                </p>
              )}

              <button
                type="button"
                onClick={openCheckout}
                className={`mt-5 flex w-full items-center justify-center gap-2 rounded-full py-4 font-body text-sm uppercase tracking-wide hover:scale-[1.01] ${
                  HALLOWEEN_ACTIVE ? 'hw-btn-orange font-medium' : 'hw-btn-glow bg-gold-500 text-night-950 hover:bg-gold-400'
                }`}
              >
                {HALLOWEEN_ACTIVE && <IconPumpkin className="h-4 w-4" />}
                Finalizar compra
              </button>
              <p className="mt-3 flex flex-wrap items-center justify-center gap-1.5 text-center font-body text-xs text-ink-300">
                Paga por transferencia o hasta en 3 cuotas con
                <AddiBadge />
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
