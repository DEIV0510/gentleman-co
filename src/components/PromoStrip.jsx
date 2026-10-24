import Reveal from './Reveal'
import PromoBanner from './PromoBanner'
import AddiBanner from './AddiBanner'
import { Fog } from './HalloweenFx'
import { BatFlight } from './HalloweenArt'
import { HALLOWEEN_ACTIVE, PROMO_3X } from '../data/campaign'

// Franja con las dos piezas del cliente: la promo "elige 3 fragancias por
// $130.000" y el aviso de Addi. Desde 640 px van lado a lado, cada una a la
// mitad del ancho — una fila corta en vez de dos banners a todo el ancho
// (cada uno de ~725 px de alto en escritorio) que empujaban el catálogo casi
// dos pantallas hacia abajo. En móvil se apilan a todo el ancho.
// La promo tiene su propio interruptor (PROMO_3X en data/campaign.js): sin
// Halloween se muestra con la imagen original del cliente; si se apaga la
// promo queda solo Addi, centrado. Si cambias columnas, espacios o el
// contenedor, ajusta SIZES en BannerCard.
export default function PromoStrip() {
  return (
    <section className="relative overflow-hidden bg-night-950 py-8 sm:py-12">
      {HALLOWEEN_ACTIVE && (
        <>
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_60%_at_50%_100%,rgba(255,106,0,0.1),transparent_70%)]"
          />
          <Fog className="inset-x-0 bottom-0 h-40" />
          <BatFlight rtl count={3} className="h-2/3" />
        </>
      )}
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <Reveal
          className={
            PROMO_3X.active ? 'grid gap-4 sm:grid-cols-2 sm:gap-5 lg:gap-6' : 'mx-auto max-w-lg'
          }
        >
          {PROMO_3X.active && <PromoBanner />}
          <AddiBanner />
        </Reveal>
      </div>
    </section>
  )
}
