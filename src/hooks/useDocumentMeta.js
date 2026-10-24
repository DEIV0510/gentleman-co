import { useEffect } from 'react'
import { SITE_URL } from '../data/site'

const DEFAULT_TITLE = 'Gentleman Co | Perfumería de Alta Calidad en Ibagué'
const DEFAULT_DESCRIPTION =
  'Gentleman Co ofrece perfumería inspirada de alta calidad en Ibagué, Tolima. Descubre nuestras fragancias y compra fácilmente por WhatsApp.'

function setMeta(name, content, attr = 'name') {
  if (!content) return
  let el = document.querySelector(`meta[${attr}="${name}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, name)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function setCanonical(url) {
  let el = document.querySelector('link[rel="canonical"]')
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', 'canonical')
    document.head.appendChild(el)
  }
  el.setAttribute('href', url)
}

function setJsonLd(id, data) {
  let el = document.getElementById(id)
  if (data) {
    if (!el) {
      el = document.createElement('script')
      el.type = 'application/ld+json'
      el.id = id
      document.head.appendChild(el)
    }
    el.textContent = JSON.stringify(data)
  } else if (el) {
    el.remove()
  }
}

// Actualiza title/meta description/OG/canonical/JSON-LD por página en esta SPA.
// Al desmontar, restaura los valores por defecto (index.html) para que la
// página de inicio no quede con metadatos de un producto.
export default function useDocumentMeta({ title, description, path, jsonLd } = {}) {
  useEffect(() => {
    const origin = SITE_URL
    document.title = title || DEFAULT_TITLE
    setMeta('description', description || DEFAULT_DESCRIPTION)
    setMeta('og:title', title || DEFAULT_TITLE, 'property')
    setMeta('og:description', description || DEFAULT_DESCRIPTION, 'property')
    setMeta('og:url', `${origin}${path || '/'}`, 'property')
    setMeta('twitter:title', title || DEFAULT_TITLE)
    setMeta('twitter:description', description || DEFAULT_DESCRIPTION)
    setCanonical(`${origin}${path || '/'}`)
    if (jsonLd) setJsonLd('product-jsonld', jsonLd)

    return () => {
      document.title = DEFAULT_TITLE
      setMeta('description', DEFAULT_DESCRIPTION)
      setMeta('og:title', DEFAULT_TITLE, 'property')
      setMeta('og:description', DEFAULT_DESCRIPTION, 'property')
      setMeta('twitter:title', DEFAULT_TITLE)
      setMeta('twitter:description', DEFAULT_DESCRIPTION)
      setMeta('og:url', `${origin}/`, 'property')
      setCanonical(`${origin}/`)
      setJsonLd('product-jsonld', null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, description, path])
}
