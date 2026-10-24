import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState } from 'react'
import { getProductById } from '../data/products'

const STORAGE_KEY = 'gentleman-cart-v1'
// Clave anterior (de cuando la marca era Narciso Parfum): se lee una vez para
// no vaciarle el carrito a quien ya tenía productos guardados, y se borra.
const LEGACY_STORAGE_KEY = 'narciso-cart-v1'

// Tamaño por defecto para productos sin variantes reales (los 48 del
// catálogo actual venden una sola presentación). No se muestra esta
// etiqueta en el carrito ni en el mensaje de WhatsApp: solo existe para que
// la arquitectura ya soporte tamaños reales el día que el cliente los tenga.
export const DEFAULT_SIZE_LABEL = 'Presentación'

function lineId(productId, sizeLabel) {
  return `${productId}__${sizeLabel}`
}

function toLine(product, size, qty) {
  return {
    lineId: lineId(product.id, size.label),
    productId: product.id,
    title: product.title,
    brand: product.brand,
    fullName: product.fullName,
    category: product.category,
    image: product.image,
    sizeLabel: size.label,
    price: size.price,
    qty,
  }
}

// El carrito guardado en el navegador puede venir de otra versión del sitio
// (precios viejos, productos retirados, la talla genérica "Presentación" de
// antes de que existiera "50 ml") o estar dañado. Al cargarlo se rehace cada
// línea desde el catálogo ACTUAL: así el carrito y el pedido de WhatsApp
// siempre muestran el precio vigente.
function sanitizeItems(raw) {
  if (!Array.isArray(raw)) return []
  const lines = new Map()
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue
    const product = getProductById(item.productId)
    const qty = Math.floor(Number(item.qty))
    if (!product || !Number.isFinite(qty) || qty < 1) continue
    const sizes = product.sizes || [{ label: DEFAULT_SIZE_LABEL, price: product.price }]
    const size = sizes.find((s) => s.label === item.sizeLabel) || sizes[0]
    const line = toLine(product, size, qty)
    const existing = lines.get(line.lineId)
    if (existing) existing.qty += qty
    else lines.set(line.lineId, line)
  }
  return [...lines.values()]
}

function reducer(state, action) {
  switch (action.type) {
    case 'HYDRATE':
      return sanitizeItems(action.items)
    case 'ADD': {
      const { product, size, qty } = action
      const id = lineId(product.id, size.label)
      const existing = state.find((i) => i.lineId === id)
      if (existing) {
        return state.map((i) => (i.lineId === id ? { ...i, qty: i.qty + qty } : i))
      }
      return [...state, toLine(product, size, qty)]
    }
    case 'INCREMENT':
      return state.map((i) => (i.lineId === action.lineId ? { ...i, qty: i.qty + 1 } : i))
    case 'DECREMENT':
      return state
        .map((i) => (i.lineId === action.lineId ? { ...i, qty: i.qty - 1 } : i))
        .filter((i) => i.qty > 0)
    case 'REMOVE':
      return state.filter((i) => i.lineId !== action.lineId)
    case 'CLEAR':
      return []
    default:
      return state
  }
}

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [items, dispatch] = useReducer(reducer, [])
  const [hydrated, setHydrated] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [toast, setToast] = useState(null)
  const toastTimer = useRef(0)

  // Se hidrata UNA vez desde localStorage. El guardado (efecto de abajo) solo
  // se activa después de que `hydrated` sea true — si no, un primer render
  // con items=[] pisaría el carrito guardado antes de leerlo (más notorio en
  // StrictMode, que monta/desmonta el árbol dos veces en desarrollo).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(LEGACY_STORAGE_KEY)
      localStorage.removeItem(LEGACY_STORAGE_KEY)
      if (raw) dispatch({ type: 'HYDRATE', items: JSON.parse(raw) })
    } catch {
      // localStorage no disponible o JSON corrupto: seguir con carrito vacío
    }
    setHydrated(true)
  }, [])

  // Con la tienda abierta en varias pestañas, cada una toma el carrito que
  // guardó la otra (si no, la última en guardar borraba lo de las demás).
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key !== STORAGE_KEY) return
      try {
        dispatch({ type: 'HYDRATE', items: e.newValue ? JSON.parse(e.newValue) : [] })
      } catch {
        // valor dañado en la otra pestaña: se conserva el carrito actual
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
      // almacenamiento lleno o no disponible: no interrumpe la compra
    }
  }, [items, hydrated])

  const showToast = useCallback((message) => {
    clearTimeout(toastTimer.current)
    setToast({ id: Date.now(), message })
    toastTimer.current = setTimeout(() => setToast(null), 2600)
  }, [])

  const addItem = useCallback(
    (product, size, qty = 1) => {
      const resolvedSize = size || { label: DEFAULT_SIZE_LABEL, price: product.price }
      dispatch({ type: 'ADD', product, size: resolvedSize, qty })
      showToast(`${product.title} se agregó al carrito`)
    },
    [showToast]
  )

  const incrementItem = useCallback((id) => dispatch({ type: 'INCREMENT', lineId: id }), [])
  const decrementItem = useCallback((id) => dispatch({ type: 'DECREMENT', lineId: id }), [])
  const removeItem = useCallback((id) => dispatch({ type: 'REMOVE', lineId: id }), [])
  const clearCart = useCallback(() => dispatch({ type: 'CLEAR' }), [])

  const openCart = useCallback(() => setDrawerOpen(true), [])
  const closeCart = useCallback(() => setDrawerOpen(false), [])
  const openCheckout = useCallback(() => {
    setDrawerOpen(false)
    setCheckoutOpen(true)
  }, [])
  const closeCheckout = useCallback(() => setCheckoutOpen(false), [])

  const totalItems = useMemo(() => items.reduce((sum, i) => sum + i.qty, 0), [items])
  const subtotal = useMemo(() => items.reduce((sum, i) => sum + i.price * i.qty, 0), [items])

  const value = useMemo(
    () => ({
      items,
      totalItems,
      subtotal,
      drawerOpen,
      checkoutOpen,
      toast,
      addItem,
      incrementItem,
      decrementItem,
      removeItem,
      clearCart,
      openCart,
      closeCart,
      openCheckout,
      closeCheckout,
      notify: showToast,
    }),
    [
      items,
      totalItems,
      subtotal,
      drawerOpen,
      checkoutOpen,
      toast,
      addItem,
      incrementItem,
      decrementItem,
      removeItem,
      clearCart,
      openCart,
      closeCart,
      openCheckout,
      closeCheckout,
      showToast,
    ]
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart debe usarse dentro de <CartProvider>')
  return ctx
}
