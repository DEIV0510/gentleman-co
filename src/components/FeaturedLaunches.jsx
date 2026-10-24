import { Link } from 'react-router-dom'
import xerjoffAvif from '../assets/img/launch-xerjoff-torino21.avif'
import xerjoffWebp from '../assets/img/launch-xerjoff-torino21.webp'
import xerjoffJpg from '../assets/img/launch-xerjoff-torino21.jpg'
import eliviAvif from '../assets/img/launch-elivi-unstoppable-hong-kong.avif'
import eliviWebp from '../assets/img/launch-elivi-unstoppable-hong-kong.webp'
import eliviJpg from '../assets/img/launch-elivi-unstoppable-hong-kong.jpg'
import { HALLOWEEN_ACTIVE } from '../data/campaign'

// Tarjetas flotantes con foto sobre el hero para los 2 lanzamientos recientes
// (Torino21, Unstoppable Hong Kong). Antes decían "Próximamente" y enlazaban
// a WhatsApp — ya son productos reales del catálogo con precio, así que
// ahora dicen "Nuevo" y enlazan directo a su ficha real (ver
// project_gentleman_co.md, entrada del 10 de sept sobre esto).
const items = [
  {
    id: 'torino21-xerjoff-hombre',
    brand: 'Xerjoff',
    name: 'Torino21',
    img: { avif: xerjoffAvif, webp: xerjoffWebp, jpg: xerjoffJpg },
  },
  {
    id: 'unstoppable-hong-kong-elivi-parfums-hombre',
    brand: 'Elivi Parfums',
    name: 'Unstoppable Hong Kong',
    img: { avif: eliviAvif, webp: eliviWebp, jpg: eliviJpg },
  },
]

// Columna izquierda del escenario del hero (a la derecha van la luna y las
// velas de la edición Halloween; abajo a la izquierda, la calabaza).
const positions = [
  'left-3 top-4 sm:left-5 sm:top-6 lg:left-8 lg:top-10',
  'left-3 top-[9.75rem] sm:left-5 sm:top-[10.75rem] lg:left-8 lg:top-[14rem]',
]

export default function FeaturedLaunches() {
  return (
    <div className="pointer-events-none absolute inset-0 z-10">
      {items.map((item, i) => (
        <Link
          key={item.id}
          to={`/perfumes/${item.id}`}
          aria-label={`${item.brand} ${item.name}, nuevo en el catálogo. Ver ficha del producto.`}
          className={`group pointer-events-auto absolute ${positions[i % positions.length]} flex w-24 flex-col items-center gap-1.5 rounded-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-300 sm:w-28 lg:w-32`}
        >
          <span className="relative block aspect-square w-full overflow-hidden rounded-2xl border-2 border-gold-300/60 shadow-[0_10px_30px_-8px_rgba(0,0,0,0.8),0_0_26px_-6px_rgba(233,138,60,0.5)] transition-transform duration-200 group-hover:scale-[1.05] group-focus-visible:scale-[1.05]">
            <picture>
              <source srcSet={item.img.avif} type="image/avif" />
              <source srcSet={item.img.webp} type="image/webp" />
              <img
                src={item.img.jpg}
                alt=""
                className="h-full w-full object-cover"
                width={200}
                height={200}
                loading="lazy"
              />
            </picture>
            <span
              className={`absolute -left-1 top-3 -rotate-[10deg] rounded-sm px-2 py-0.5 font-body text-[8px] font-semibold uppercase tracking-wide text-ink-900 shadow-md sm:text-[9px] ${
                HALLOWEEN_ACTIVE ? 'bg-ember-500 shadow-[0_0_14px_rgba(255,106,0,0.6)]' : 'bg-gold-400'
              }`}
            >
              Nuevo
            </span>
          </span>
          <span className="block text-center font-display text-[11px] leading-tight text-cream-50 [text-shadow:0_1px_4px_rgba(0,0,0,0.8)] sm:text-xs">
            {item.brand} <span className="italic">{item.name}</span>
          </span>
        </Link>
      ))}
    </div>
  )
}
