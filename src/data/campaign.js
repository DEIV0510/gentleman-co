// Interruptor de la campaña visual de Halloween ("Halloween Edition") — capa
// puramente estética sobre la identidad real de Gentleman Co (NO toca
// catálogo, precios, notas, contacto ni funcionalidades). Sustituye a la
// campaña de San Valentín. La paleta vive en tailwind.config.js e index.css;
// con esta bandera en `false` desaparece de un solo lugar la ambientación
// (escena nocturna del hero, luna, murciélagos, arañas, telarañas, velas,
// calabazas, niebla, brasas, rótulos y secciones de temporada).
export const HALLOWEEN_ACTIVE = true

// Promoción real del cliente: "Elige 3 fragancias por $130.000 COP". Es
// independiente de Halloween: sigue visible cuando se apague la campaña
// (decisión del usuario, 2026-10-24). Con `active: false` desaparecen el
// banner y el aviso de la promo en el carrito y en el pedido de WhatsApp.
// El descuento no se calcula en el carrito: se aplica al confirmar por
// WhatsApp (hay perfumes a $60.000 y combos mixtos que decide el negocio).
export const PROMO_3X = { active: true, units: 3, price: 130000 }

// Solo rótulos de campaña. Los textos comerciales (hero, catálogo, botones,
// fichas) no cambian: aquí viven únicamente las líneas que antes decían
// "San Valentín" o hablaban de amor.
export const halloweenCopy = {
  // Barra superior: [rótulo de campaña, lema de la marca].
  promoBar: ['Halloween Edition', 'Fragancias que dejan huella'],
  heroEyebrow: 'Halloween Edition',
  heroLine: 'Una noche. Una fragancia.',
  catalogEyebrow: 'Halloween Edition',
  catalogLine: 'Aromas con carácter para la noche más oscura del año',
  giftBadge: 'Ideal para regalar',
  giftGuideEyebrow: 'Halloween Edition',
  giftGuideTitle: 'El regalo perfecto tiene aroma',
  giftGuideLine: 'Encuentra la fragancia ideal para cada persona especial.',
  promoImageAlt: 'Promoción especial Gentleman Co: elige 3 fragancias por $130.000 COP',
  footerNote: 'Feliz Halloween · Gentleman Co.',
}

// Las 3 tarjetas de la sección "El regalo perfecto tiene aroma" reusan el
// mismo evento `gentleman-co:filter-category` que ya usa GenderFinder — enlazan
// a categorías REALES del catálogo, no a productos inventados.
export const giftGuideCards = [
  { label: 'Para ella', category: 'dama' },
  { label: 'Para él', category: 'caballero' },
  { label: 'Para compartir', category: 'unisex' },
]
