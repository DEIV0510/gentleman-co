import { useEffect, useRef, useState } from 'react'
import { formatCOP } from '../data/products'
import { buildOrderMessage, paymentMethods, promoNotice } from '../data/cart'
import { brand, waLink } from '../data/site'
import { useCart } from '../context/CartContext'
import { AddiBadge } from './AddiOption'
import { Cobweb } from './HalloweenArt'
import { IconWhatsApp, IconChevronRight, IconX, IconPumpkin } from './icons'
import { HALLOWEEN_ACTIVE } from '../data/campaign'

// Detalle visible bajo un método de pago (datos del banner oficial de Addi).
// El valor que viaja en el mensaje de WhatsApp sigue siendo el nombre de
// data/cart.js ("Método de pago: Addi").
const PAYMENT_DETAIL = {
  Addi: 'Hasta 3 cuotas · 0% de interés',
}

const FOCUSABLE_SELECTOR = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'

const emptyCustomer = {
  name: '',
  phone: '',
  city: '',
  address: '',
  neighborhood: '',
  notes: '',
  paymentMethod: paymentMethods[0],
}

const FIELDS = [
  { key: 'name', label: 'Nombre completo', type: 'text', autoComplete: 'name' },
  { key: 'phone', label: 'Número de teléfono', type: 'tel', autoComplete: 'tel' },
  { key: 'city', label: 'Ciudad', type: 'text', autoComplete: 'address-level2' },
  { key: 'address', label: 'Dirección', type: 'text', autoComplete: 'street-address' },
  { key: 'neighborhood', label: 'Barrio', type: 'text', autoComplete: 'off' },
]

export default function CheckoutModal() {
  const { items, totalItems, subtotal, checkoutOpen, closeCheckout, openCart, clearCart, notify } = useCart()
  // Los datos del cliente se conservan si vuelve al carrito o cierra el
  // formulario sin querer; solo se borran cuando confirma que envió el pedido.
  const [customer, setCustomer] = useState(emptyCustomer)
  const [errors, setErrors] = useState({})
  // Enlace de WhatsApp del pedido ya armado: mientras exista se muestra el
  // paso "¿ya lo enviaste?" en vez del formulario.
  const [sentUrl, setSentUrl] = useState(null)
  const panelRef = useRef(null)
  const firstFieldRef = useRef(null)
  const previouslyFocused = useRef(null)
  const pressStartedOnBackdrop = useRef(false)
  const promo = promoNotice(totalItems)

  useEffect(() => {
    if (!checkoutOpen) return
    setErrors({})
    setSentUrl(null)
    previouslyFocused.current = document.activeElement
    firstFieldRef.current?.focus()
    document.body.style.overflow = 'hidden'

    const onKey = (e) => {
      if (e.key === 'Escape') {
        closeCheckout()
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
  }, [checkoutOpen, closeCheckout])

  if (!checkoutOpen) return null

  const setField = (key) => (e) => {
    setCustomer((c) => ({ ...c, [key]: e.target.value }))
    if (errors[key]) setErrors((er) => ({ ...er, [key]: false }))
  }

  const handleBack = () => {
    closeCheckout()
    openCart()
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // El carrito pudo vaciarse en otra pestaña mientras el formulario estaba abierto.
    if (items.length === 0) {
      handleBack()
      return
    }
    const nextErrors = {}
    for (const f of FIELDS) {
      if (!customer[f.key].trim()) nextErrors[f.key] = true
    }
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      const firstInvalid = FIELDS.find((f) => nextErrors[f.key])
      panelRef.current?.querySelector(`[name="${firstInvalid.key}"]`)?.focus()
      return
    }

    // WhatsApp solo deja el mensaje escrito: el cliente todavía tiene que
    // tocar "Enviar". Por eso el carrito NO se vacía aquí sino en handleSent.
    // window.open sin 'noopener' para poder saber si se abrió; si el
    // navegador lo bloquea, WhatsApp se abre en esta misma pestaña (el
    // carrito queda guardado).
    const url = waLink(buildOrderMessage(items, customer))
    const win = window.open(url, '_blank')
    if (win) win.opener = null
    else window.location.href = url
    setSentUrl(url)
  }

  const handleSent = () => {
    clearCart()
    setCustomer(emptyCustomer)
    setSentUrl(null)
    closeCheckout()
    notify('¡Gracias! Te contactaremos por WhatsApp para confirmar tu pedido')
  }

  // Cerrar al tocar el fondo solo si el toque empezó y terminó en el fondo:
  // seleccionar texto de un campo arrastrando hacia afuera no cierra nada.
  const onBackdropPointerDown = (e) => {
    pressStartedOnBackdrop.current = e.target === e.currentTarget
  }
  const onBackdropClick = (e) => {
    if (e.target === e.currentTarget && pressStartedOnBackdrop.current) closeCheckout()
    pressStartedOnBackdrop.current = false
  }

  return (
    <div
      className="fixed inset-0 z-[97] flex items-end justify-center bg-night-950/80 backdrop-blur-sm sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="checkout-title"
      onPointerDown={onBackdropPointerDown}
      onClick={onBackdropClick}
    >
      <div
        ref={panelRef}
        className="relative flex max-h-[94vh] w-full max-w-lg flex-col overflow-y-auto rounded-t-3xl border border-gold-500/25 bg-night-950 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.9),0_0_70px_-30px_rgba(255,106,0,0.45)] sm:rounded-3xl"
      >
        {HALLOWEEN_ACTIVE && (
          <>
            <div aria-hidden="true" className="hw-glow-top pointer-events-none absolute inset-x-0 top-0 h-48" />
            <Cobweb dew={false} className="absolute left-0 top-0 h-20 w-20 text-cream-200/20" />
          </>
        )}
        <div className="relative flex items-center justify-between border-b border-gold-500/15 px-6 py-5 sm:px-8">
          <div>
            <button
              type="button"
              onClick={handleBack}
              className="flex items-center gap-1 font-body text-xs uppercase tracking-wide text-ink-300 hover:text-cream-50"
            >
              <IconChevronRight className="h-3.5 w-3.5 rotate-180" />
              Volver al carrito
            </button>
            <h2 id="checkout-title" className="mt-1.5 flex items-center gap-2 font-display text-2xl text-cream-50">
              Finalizar compra
              {HALLOWEEN_ACTIVE && (
                <IconPumpkin className="h-5 w-5 text-ember-500 [filter:drop-shadow(0_0_6px_rgba(255,106,0,0.7))]" />
              )}
            </h2>
          </div>
          <button
            type="button"
            onClick={closeCheckout}
            aria-label="Cerrar"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gold-500/30 text-cream-100 transition-colors hover:bg-night-700 hover:text-gold-300"
          >
            <IconX className="h-4 w-4" />
          </button>
        </div>

        {sentUrl ? (
          <div className="relative flex flex-col items-center gap-4 px-6 py-8 text-center sm:px-8">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366]/15 text-[#25D366] ring-1 ring-[#25D366]/40">
              <IconWhatsApp className="h-6 w-6" />
            </span>
            <p className="font-display text-xl text-cream-50">Tu pedido está listo en WhatsApp</p>
            <p className="max-w-sm font-body text-sm leading-relaxed text-cream-200/80">
              Solo falta tocar <strong className="font-medium text-cream-50">Enviar</strong> en WhatsApp para que
              nos llegue. Si no se abrió, ábrelo con el botón de abajo.
            </p>
            <a
              href={sentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] py-4 font-body text-sm uppercase tracking-wide text-ink-900 transition-transform duration-200 hover:scale-[1.01]"
            >
              <IconWhatsApp className="h-4 w-4" />
              Abrir WhatsApp
            </a>
            <button
              type="button"
              onClick={handleSent}
              className="w-full rounded-full border border-gold-500/40 py-3.5 font-body text-sm uppercase tracking-wide text-gold-200 transition-colors hover:border-gold-300 hover:bg-gold-500 hover:text-night-950"
            >
              Listo, ya lo envié
            </button>
          </div>
        ) : (
        <form onSubmit={handleSubmit} className="relative flex flex-col gap-6 px-6 py-6 sm:px-8">
          <div className="rounded-2xl border border-gold-500/20 bg-night-800 p-4">
            <p className="font-body text-xs uppercase tracking-wide text-ink-300">Resumen del pedido</p>
            <ul className="mt-3 space-y-2">
              {items.map((item) => (
                <li key={item.lineId} className="flex items-center justify-between gap-3 font-body text-sm text-cream-200/85">
                  <span className="min-w-0 truncate">
                    {item.qty} × {item.title}
                  </span>
                  <span className="shrink-0 tabular-nums text-cream-50">{formatCOP(item.price * item.qty)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-3 flex items-center justify-between border-t border-gold-500/15 pt-3">
              <span className="font-display text-sm text-cream-50">Subtotal</span>
              <span className="font-display text-lg tabular-nums text-gold-300">{formatCOP(subtotal)}</span>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {FIELDS.map((f, i) => (
              <label key={f.key} className={`flex flex-col gap-1.5 ${f.key === 'address' ? 'sm:col-span-2' : ''}`}>
                <span className="font-body text-xs uppercase tracking-wide text-ink-300">{f.label}</span>
                <input
                  ref={i === 0 ? firstFieldRef : undefined}
                  name={f.key}
                  type={f.type}
                  autoComplete={f.autoComplete}
                  value={customer[f.key]}
                  onChange={setField(f.key)}
                  aria-invalid={errors[f.key] ? 'true' : undefined}
                  className={`h-12 rounded-xl border bg-night-800 px-4 font-body text-sm text-cream-50 outline-none transition-colors focus:border-gold-400 ${
                    errors[f.key] ? 'border-red-400' : 'border-gold-500/20'
                  }`}
                />
                {errors[f.key] && <span className="font-body text-xs text-red-400">Este campo es obligatorio</span>}
              </label>
            ))}
          </div>

          <label className="flex flex-col gap-1.5">
            <span className="font-body text-xs uppercase tracking-wide text-ink-300">Indicaciones adicionales</span>
            <textarea
              name="notes"
              rows={2}
              value={customer.notes}
              onChange={setField('notes')}
              placeholder="Punto de referencia, horario de entrega, etc. (opcional)"
              className="resize-none rounded-xl border border-gold-500/20 bg-night-800 px-4 py-3 font-body text-sm text-cream-50 outline-none transition-colors placeholder:text-ink-300/80 focus:border-gold-400"
            />
          </label>

          <div>
            <span className="font-body text-xs uppercase tracking-wide text-ink-300">Método de pago</span>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {paymentMethods.map((method) => {
                const selected = customer.paymentMethod === method
                return (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setCustomer((c) => ({ ...c, paymentMethod: method }))}
                    aria-pressed={selected}
                    className={`flex min-h-[3.5rem] flex-col items-start justify-center gap-0.5 rounded-2xl border px-4 py-2.5 text-left font-body transition-all ${
                      selected
                        ? 'border-gold-400 bg-gold-500/10 shadow-[0_0_26px_-10px_rgba(255,106,0,0.8)]'
                        : 'border-gold-500/20 hover:border-gold-400/60'
                    }`}
                  >
                    <span className={`flex items-center gap-2 text-sm ${selected ? 'text-gold-200' : 'text-cream-200/90'}`}>
                      <span
                        aria-hidden="true"
                        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                          selected ? 'border-ember-500' : 'border-gold-500/40'
                        }`}
                      >
                        {selected && <span className="h-2 w-2 rounded-full bg-ember-500" />}
                      </span>
                      {method === 'Addi' ? <AddiBadge /> : method}
                    </span>
                    {PAYMENT_DETAIL[method] && (
                      <span className="pl-6 text-[11px] leading-snug text-ink-300">{PAYMENT_DETAIL[method]}</span>
                    )}
                  </button>
                )
              })}
            </div>
            {customer.paymentMethod === 'Addi' && (
              <p className="mt-2 font-body text-xs leading-relaxed text-cream-200/75">
                Al confirmar, coordinamos contigo por WhatsApp el pago en cuotas con Addi.
              </p>
            )}
          </div>

          <div className="flex items-center justify-between border-t border-gold-500/15 pt-5">
            <span className="font-display text-base text-cream-50">{promo ? 'Total sin promoción' : 'Total del pedido'}</span>
            <span className="font-display text-2xl tabular-nums text-gold-300">{formatCOP(subtotal)}</span>
          </div>
          {promo && (
            <p className="-mt-3 rounded-xl border border-gold-500/25 bg-gold-500/10 px-3 py-2 text-center font-body text-xs leading-relaxed text-gold-200">
              {promo}
            </p>
          )}

          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] py-4 font-body text-sm uppercase tracking-wide text-ink-900 transition-transform duration-200 hover:scale-[1.01]"
          >
            <IconWhatsApp className="h-4 w-4" />
            Confirmar y enviar por WhatsApp
          </button>
          <p className="-mt-3 text-center font-body text-xs text-ink-300">
            Tu pedido se enviará a {brand.name} por WhatsApp para confirmar disponibilidad y coordinar el envío.
          </p>
        </form>
        )}
      </div>
    </div>
  )
}
