import Reveal from './Reveal'
import SectionDivider from './SectionDivider'
import { brand } from '../data/site'
import { IconInstagram, IconTikTok } from './icons'
import { HALLOWEEN_ACTIVE } from '../data/campaign'
import { Grain } from './HalloweenFx'
import { BatFlight } from './HalloweenArt'

export default function Socials() {
  // Sin cuentas propias de Gentleman Co no se muestra la sección (ver site.js).
  if (!brand.instagramUrl && !brand.tiktokUrl) return null
  return (
    <section
      aria-labelledby="socials-heading"
      className={`relative overflow-hidden bg-night-950 py-16 sm:py-20 ${HALLOWEEN_ACTIVE ? 'pt-24 sm:pt-28' : 'hw-top-line'}`}
    >
      {HALLOWEEN_ACTIVE && (
        <>
          <div aria-hidden="true" className="hw-glow-top pointer-events-none absolute inset-0 opacity-80" />
          <Grain />
          <SectionDivider icon="bat" />
          <BatFlight rtl count={4} className="h-3/4" />
        </>
      )}
      <div className="relative mx-auto max-w-3xl px-6 text-center sm:px-8">
        <Reveal>
          <p className="section-eyebrow text-gold-400">Redes sociales</p>
          <h2 id="socials-heading" className="hw-glow-text mt-3 font-display text-2xl text-cream-50 sm:text-3xl">
            Sigue a Gentleman Co
          </h2>
        </Reveal>

        <Reveal delay={100} className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <a
            href={brand.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hw-btn-glow flex w-full max-w-xs items-center justify-center gap-2.5 rounded-full border border-gold-400/40 bg-night-950/60 px-6 py-3.5 font-body text-sm uppercase tracking-wide text-cream-50 hover:border-gold-400 hover:bg-gold-500/10 sm:w-auto"
          >
            <IconInstagram className="h-4 w-4" />
            Instagram
          </a>
          <a
            href={brand.tiktokUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hw-btn-glow flex w-full max-w-xs items-center justify-center gap-2.5 rounded-full border border-gold-400/40 bg-night-950/60 px-6 py-3.5 font-body text-sm uppercase tracking-wide text-cream-50 hover:border-gold-400 hover:bg-gold-500/10 sm:w-auto"
          >
            <IconTikTok className="h-4 w-4" />
            TikTok
          </a>
        </Reveal>
      </div>
    </section>
  )
}
