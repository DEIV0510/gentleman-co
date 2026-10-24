import { useEffect, useLayoutEffect, useRef } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'

// Maneja el scroll al cambiar de página dentro de la SPA:
// - Atrás/Adelante (POP): vuelve a la posición en la que el cliente dejó esa
//   página (ej. del catálogo a una ficha y de regreso, sigue en el mismo
//   punto del catálogo).
// - Navegar a "/#seccion" desde otra ruta: react-router no hace el scroll
//   nativo a esa ancla, así que se emula buscando el elemento.
// - Cualquier otra navegación: arriba de la página, de inmediato.
// Depende de `location.key` (no solo de pathname/hash) para que un enlace a
// la misma dirección en la que ya se está (ej. "Explorar perfumes" estando
// en /#catalogo) también lleve a la sección.
const POSITIONS_KEY = 'gentleman-scroll-positions'

function readPositions() {
  try {
    return JSON.parse(sessionStorage.getItem(POSITIONS_KEY) || '{}') || {}
  } catch {
    return {}
  }
}

export default function ScrollManager() {
  const location = useLocation()
  const navigationType = useNavigationType()
  const { key, hash } = location

  // El navegador no debe restaurar por su cuenta (lo hace antes de que React
  // dibuje la página y termina en otro punto).
  useEffect(() => {
    if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'manual'
  }, [])

  // Guarda la posición de la página actual mientras el cliente la recorre.
  // La página "actual" se toma de una ref que se cambia ANTES de mover el
  // scroll de la página nueva: si no, el salto arriba al abrir una ficha se
  // guardaba como posición del catálogo y "Atrás" volvía al inicio.
  const currentKey = useRef(`${key}|${location.pathname}${location.search}`)
  useEffect(() => {
    let raf = 0
    const save = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const k = currentKey.current
        const positions = readPositions()
        delete positions[k]
        positions[k] = window.scrollY
        // solo las últimas 50 páginas visitadas en la pestaña
        const keys = Object.keys(positions)
        for (const old of keys.slice(0, Math.max(0, keys.length - 50))) delete positions[old]
        try {
          sessionStorage.setItem(POSITIONS_KEY, JSON.stringify(positions))
        } catch {
          // sin sessionStorage: no se recuerda la posición, nada más
        }
      })
    }
    window.addEventListener('scroll', save, { passive: true })
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', save)
    }
  }, [])

  // La primera página que carga el navegador siempre trae la clave 'default':
  // por eso la posición se guarda junto con la dirección, y al cargar una
  // página nueva (escribir la dirección, abrir un enlace) no se restaura nada;
  // solo al recargar o al volver con Atrás/Adelante.
  const firstRender = useRef(true)

  useLayoutEffect(() => {
    const storeKey = `${key}|${location.pathname}${location.search}`
    currentKey.current = storeKey
    let raf = 0
    let attempts = 0

    const navEntry = typeof performance !== 'undefined' && performance.getEntriesByType ? performance.getEntriesByType('navigation')[0] : null
    const initialRestorable = !!navEntry && (navEntry.type === 'reload' || navEntry.type === 'back_forward')
    const canRestore = navigationType === 'POP' && (!firstRender.current || initialRestorable)
    firstRender.current = false
    const saved = canRestore ? readPositions()[storeKey] : undefined
    if (typeof saved === 'number') {
      // La página puede no tener todavía su alto completo (imágenes, catálogo):
      // se reintenta unos cuadros hasta poder llegar al punto guardado.
      const restore = () => {
        window.scrollTo({ top: saved, left: 0, behavior: 'instant' })
        attempts += 1
        if (Math.abs(window.scrollY - saved) > 2 && attempts < 30) raf = requestAnimationFrame(restore)
      }
      restore()
      return () => cancelAnimationFrame(raf)
    }

    if (!hash) {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
      return undefined
    }

    const id = decodeURIComponent(hash.slice(1))
    const tryScroll = () => {
      const el = document.getElementById(id)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        return
      }
      attempts += 1
      if (attempts < 10) raf = requestAnimationFrame(tryScroll)
    }
    tryScroll()
    return () => cancelAnimationFrame(raf)
  }, [key, hash, navigationType, location.pathname, location.search])

  return null
}
