// Única fuente de verdad para los datos reales de la marca.
// No se inventan precios, nombres de fragancias ni categorías: solo se usa
// la información que existe realmente (etiqueta del frasco, logo, datos de contacto).

export const brand = {
  name: 'Gentleman Co',
  tagline: 'Perfumería de alta calidad',
  subtagline: 'Perfumería inspirada para quienes quieren dejar huella.',
  specialists: 'Especialistas en inspiración',
  city: 'Ibagué, Tolima',
  whatsapp: '573229282884',
  whatsappDisplay: '322 928 2884',
  // Instagram/TikTok: las cuentas que había (@narcisoparfumoficial,
  // @narciso.parfum.of) son de Narciso Parfum, que ahora tiene su propia web
  // aparte (proyecto narciso2). A pedido del usuario (2026-10-24) se quitaron
  // de Gentleman Co hasta tener sus cuentas propias: con null, el header, el
  // footer y la sección de redes no muestran esos enlaces.
  instagramUrl: null,
  instagramHandle: null,
  tiktokUrl: null,
  tiktokHandle: null,
  address: {
    line1: 'Urbanización Santa Ana, Manzana 34 Casa 2',
    line2: 'Ibagué, Tolima, Colombia',
    full: 'Urbanización Santa Ana, Manzana 34 Casa 2, Ibagué, Tolima, Colombia',
  },
}

export const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  brand.address.full
)}`

export function waLink(message) {
  return `https://wa.me/${brand.whatsapp}?text=${encodeURIComponent(message)}`
}

export const waMessages = {
  catalog: 'Hola, Gentleman Co. Quiero conocer su catálogo de fragancias y precios.',
  product:
    'Hola, Gentleman Co. Quiero más información sobre su fragancia insignia. ¿Me pueden dar información y precio?',
  feminine:
    'Hola, Gentleman Co. Estoy buscando una fragancia femenina. ¿Me pueden recomendar opciones y precios?',
  masculine:
    'Hola, Gentleman Co. Estoy buscando una fragancia masculina. ¿Me pueden recomendar opciones y precios?',
  unisex:
    'Hola, Gentleman Co. Estoy buscando una fragancia unisex. ¿Me pueden recomendar opciones y precios?',
  availability: 'Hola, Gentleman Co. Quiero consultar disponibilidad de sus fragancias.',
  order: 'Hola, Gentleman Co. Quiero hacer mi pedido. ¿Me ayudan con el proceso?',
}

export const navLinks = [
  { label: 'Inicio', href: '#inicio' },
  { label: 'Catálogo', href: '#catalogo' },
  { label: 'Nuestra Fragancia', href: '#fragancia' },
  { label: 'Proceso', href: '#proceso' },
  { label: 'Encuentra tu Aroma', href: '#encuentra' },
  { label: 'Ubicación', href: '#ubicacion' },
]

export const whyGentlemanCo = [
  'Perfumería de alta calidad',
  'Perfumería inspirada',
  'Presentación premium',
  'Atención personalizada',
  'Compra fácil por WhatsApp',
  'Elaborado en Ibagué, Tolima',
]
