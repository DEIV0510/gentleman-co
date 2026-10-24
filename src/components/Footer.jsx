import { brand, navLinks, waLink, waMessages } from '../data/site'
import { IconInstagram, IconTikTok, IconSkull } from './icons'
import SectionLink from './SectionLink'
import { HALLOWEEN_ACTIVE, halloweenCopy } from '../data/campaign'
import { Grain, Motes, Fog } from './HalloweenFx'
import { Branch } from './HalloweenArt'

// Cierre en la edición Halloween: noche, niebla al ras, polvo dorado, ramas y
// un emblema gótico (calavera fina en medallón dorado). La luna grande queda
// justo arriba, en FinalCTA.
export default function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="hw-top-line relative overflow-hidden bg-night-950 pt-14 sm:pt-16">
      {HALLOWEEN_ACTIVE && (
        <>
          <div aria-hidden="true" className="hw-glow-top pointer-events-none absolute inset-0 opacity-70" />
          <Grain />
          <Motes />
          <Branch className="absolute -right-6 top-0 h-40 w-auto text-night-700 opacity-80 sm:h-52" />
          <Branch flip className="absolute -left-6 top-0 hidden h-40 w-auto text-night-700 opacity-60 sm:block sm:h-48" />
          <Fog className="inset-x-0 bottom-0 h-32" />
        </>
      )}
      <div className="relative mx-auto max-w-7xl px-6 sm:px-8 lg:px-8">
        <div className="grid gap-10 border-b border-gold-500/15 pb-12 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="font-display text-xl text-cream-50">GENTLEMAN CO</p>
            <p className="mt-2 font-body text-sm text-ink-300">Perfumería de alta calidad</p>
          </div>

          <div>
            <p className="font-body text-xs uppercase tracking-widest2 text-gold-400">Ubicación</p>
            <p className="mt-3 font-body text-sm leading-relaxed text-ink-300">
              {brand.address.line1}
              <br />
              {brand.city}
            </p>
          </div>

          <div>
            <p className="font-body text-xs uppercase tracking-widest2 text-gold-400">Contacto</p>
            <a
              href={waLink(waMessages.catalog)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 block font-body text-sm text-ink-300 hover:text-gold-300"
            >
              WhatsApp: {brand.whatsappDisplay}
            </a>
            {(brand.instagramUrl || brand.tiktokUrl) && (
              <div className="mt-2 flex items-center gap-2">
                {brand.instagramUrl && (
                  <a
                    href={brand.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram"
                    className="flex h-11 w-11 items-center justify-center text-ink-300 hover:text-gold-300"
                  >
                    <IconInstagram className="h-4 w-4" />
                  </a>
                )}
                {brand.tiktokUrl && (
                  <a
                    href={brand.tiktokUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="TikTok"
                    className="flex h-11 w-11 items-center justify-center text-ink-300 hover:text-gold-300"
                  >
                    <IconTikTok className="h-4 w-4" />
                  </a>
                )}
              </div>
            )}
          </div>

          <div>
            <p className="font-body text-xs uppercase tracking-widest2 text-gold-400">Enlaces</p>
            <ul className="mt-3 space-y-2">
              {navLinks.map((l) => (
                <li key={l.href}>
                  <SectionLink href={l.href} className="font-body text-sm text-ink-300 hover:text-gold-300">
                    {l.label}
                  </SectionLink>
                </li>
              ))}
              <li>
                <a
                  href={waLink(waMessages.catalog)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-body text-sm text-ink-300 hover:text-gold-300"
                >
                  WhatsApp
                </a>
              </li>
            </ul>
          </div>
        </div>

        {HALLOWEEN_ACTIVE && (
          <div aria-hidden="true" className="flex items-center justify-center gap-3 pt-8">
            <span className="h-px w-16 bg-gradient-to-r from-transparent to-gold-500/50 sm:w-24" />
            <span className="relative flex h-10 w-10 items-center justify-center rounded-full border border-gold-500/40 text-gold-300">
              <span className="absolute inset-[-8px] rounded-full bg-[radial-gradient(closest-side,rgba(255,106,0,0.35),transparent)]" />
              <IconSkull className="relative h-5 w-5" />
            </span>
            <span className="h-px w-16 bg-gradient-to-l from-transparent to-gold-500/50 sm:w-24" />
          </div>
        )}
        <p className={`text-center font-body text-xs text-ink-300 ${HALLOWEEN_ACTIVE ? 'pt-5' : 'py-6'}`}>
          © {year} Gentleman Co. Todos los derechos reservados.
        </p>
        {HALLOWEEN_ACTIVE && (
          <p className="pb-10 pt-2 text-center font-gothic text-base tracking-wide text-ember-400 [text-shadow:0_0_16px_rgba(255,106,0,0.45)]">
            {halloweenCopy.footerNote}
          </p>
        )}
      </div>
    </footer>
  )
}
