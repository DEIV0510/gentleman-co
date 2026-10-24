import bottleAvif from '../assets/img/catalog-bottle.avif'
import bottleWebp from '../assets/img/catalog-bottle.webp'
import bottleJpg from '../assets/img/catalog-bottle.jpg'
import { Grain, Fog } from './HalloweenFx'
import { Moon, Bats, Branch } from './HalloweenArt'
import { IconArrowRight, IconDiamond, IconTruck, IconShield } from './icons'
import { waLink } from '../data/site'
import { HALLOWEEN_ACTIVE, halloweenCopy } from '../data/campaign'

// Promoción real del cliente: elige 3 fragancias por $130.000 COP. No se
// inventa lógica de descuento en el carrito: el enlace solo abre WhatsApp
// para coordinar el combo. Va dentro de PromoStrip.
//
// La pieza original del cliente (promo-especial.png) dice "NARCISO PARFUM", y
// Narciso ahora es otra marca con su propia web: por eso la promo se arma
// siempre aquí en HTML, con EXACTAMENTE la misma información (titular,
// oferta, beneficios, botón y lema) y la marca Gentleman Co, sobre tres
// frascos reales de la colección (la foto recortada del catálogo). Con
// Halloween activo lleva la escena nocturna (luna, murciélagos, rama, niebla
// y luz naranja); sin campaña queda en negro y dorado.
const message =
  'Hola, Gentleman Co. Vi la promoción especial (elige 3 fragancias por $130.000 COP) y quiero armar mi combo.'

const perks = [
  { Icon: IconDiamond, label: 'Fragancias de alta calidad' },
  { Icon: IconTruck, label: 'Envíos a toda Colombia' },
  { Icon: IconShield, label: 'Compra 100% segura' },
]

const BATS = [
  { left: '-10%', top: '30%', w: '22%', delay: '-0.6s' },
  { left: '58%', top: '-6%', w: '14%', delay: '-2.2s' },
]

function Bottle({ className = '' }) {
  return (
    <picture>
      <source srcSet={bottleAvif} type="image/avif" />
      <source srcSet={bottleWebp} type="image/webp" />
      <img
        src={bottleJpg}
        alt=""
        className={`absolute w-auto max-w-none ${className}`}
        loading="lazy"
        decoding="async"
        width={552}
        height={1507}
      />
    </picture>
  )
}

function HtmlPromo({ href, halloween }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${halloweenCopy.promoImageAlt}. Comprar por WhatsApp.`}
      className={`hw-card hw-promo group block aspect-[3/2] overflow-hidden rounded-2xl border border-gold-500/30 bg-night-950 sm:rounded-3xl ${
        halloween
          ? 'shadow-[0_22px_50px_-26px_rgba(0,0,0,0.95),0_0_50px_-24px_rgba(255,106,0,0.5)]'
          : 'shadow-[0_22px_50px_-26px_rgba(0,0,0,0.95),0_0_50px_-24px_rgba(201,164,92,0.45)]'
      }`}
    >
      <span
        aria-hidden="true"
        className={`absolute inset-0 ${
          halloween
            ? 'bg-[radial-gradient(60%_72%_at_76%_74%,rgba(255,106,0,0.34),transparent_70%),radial-gradient(55%_65%_at_0%_0%,rgba(74,13,22,0.6),transparent_70%),linear-gradient(160deg,#120c08_0%,#080808_55%,#150906_100%)]'
            : 'bg-[radial-gradient(60%_72%_at_76%_74%,rgba(201,164,92,0.26),transparent_70%),radial-gradient(50%_60%_at_0%_0%,rgba(232,199,122,0.08),transparent_70%),linear-gradient(160deg,#110f0b_0%,#080808_55%,#0e0c09_100%)]'
        }`}
      />
      <Grain />
      {halloween && (
        <>
          <Moon soft className="absolute right-[7%] top-[6%] aspect-square w-[31%]" />
          <Bats rim bats={BATS} className="absolute right-[7%] top-[6%] aspect-square w-[31%]" />
          <Branch className="absolute -right-2 -top-2 h-[36%] w-auto text-black" />
        </>
      )}

      {/* Pedestal de piedra oscura con tres frascos reales de la colección. */}
      <span
        aria-hidden="true"
        className="absolute bottom-[7%] right-[2.5%] h-[8%] w-[46%] rounded-[3px] bg-[linear-gradient(180deg,#2b2520,#100d0b)] shadow-[inset_0_1px_0_rgba(232,199,122,0.3),0_14px_24px_-10px_rgba(0,0,0,0.9)]"
      />
      <span aria-hidden="true">
        <Bottle
          className={`bottom-[14.5%] right-[31%] h-[49%] ${
            halloween ? '[filter:drop-shadow(-6px_2px_10px_rgba(255,106,0,0.35))]' : '[filter:drop-shadow(-6px_2px_10px_rgba(201,164,92,0.3))]'
          }`}
        />
        <Bottle className="bottom-[14.5%] right-[3.5%] h-[49%] [filter:drop-shadow(6px_-2px_12px_rgba(237,229,213,0.16))]" />
        <Bottle
          className={`bottom-[14.5%] right-[16%] z-[1] h-[61%] transition-transform duration-500 group-hover:-translate-y-1 ${
            halloween ? '[filter:drop-shadow(0_0_14px_rgba(255,138,46,0.4))]' : '[filter:drop-shadow(0_0_14px_rgba(232,199,122,0.35))]'
          }`}
        />
      </span>
      {halloween && <Fog className="inset-x-0 bottom-0 z-[2] h-[30%] opacity-80" front={false} />}

      <span className="relative z-[3] flex h-full w-[60%] flex-col justify-center pl-[6%]">
        <span className="font-body text-[max(2.1cqw,8px)] uppercase tracking-[0.32em] text-gold-400">Gentleman Co.</span>
        <span className="mt-[1.6cqw] font-display text-[7.1cqw] font-semibold leading-[0.98] text-cream-50">
          PROMOCIÓN
        </span>
        <span className="hw-gold-text font-display text-[8.3cqw] font-semibold leading-[1]">ESPECIAL</span>
        <span className="mt-[2cqw] font-body text-[max(2.2cqw,9px)] uppercase tracking-[0.18em] text-cream-200/90">
          Elige 3 fragancias por solo
        </span>
        <span
          className={`mt-[1.6cqw] inline-flex w-fit items-baseline gap-[1.2cqw] rounded-[1.6cqw] border bg-night-950/85 px-[2.4cqw] py-[0.9cqw] ${
            halloween
              ? 'border-ember-500/55 shadow-[0_0_34px_-8px_rgba(255,106,0,0.65)]'
              : 'border-gold-400/55 shadow-[0_0_34px_-8px_rgba(201,164,92,0.55)]'
          }`}
        >
          <span className="font-display text-[6.8cqw] font-semibold leading-none text-gold-200">3 x 130.000</span>
          <span className={`font-body text-[max(2.2cqw,9px)] font-medium ${halloween ? 'text-ember-300' : 'text-gold-300'}`}>COP</span>
        </span>
        <span className="mt-[2.4cqw] flex gap-[3cqw]">
          {perks.map(({ Icon, label }) => (
            <span key={label} className="flex max-w-[11cqw] flex-col items-start gap-[0.8cqw]">
              <Icon className="h-[max(3.2cqw,13px)] w-[max(3.2cqw,13px)] text-gold-300" />
              <span className="hw-promo-feat-label font-body text-[1.75cqw] uppercase leading-tight tracking-wide text-cream-200/75">
                {label}
              </span>
            </span>
          ))}
        </span>
        <span
          className={`mt-[2.8cqw] inline-flex w-fit items-center gap-[1.2cqw] rounded-full px-[3.2cqw] py-[1.5cqw] font-body text-[max(2.2cqw,9px)] font-medium uppercase tracking-wide ${
            halloween ? 'hw-btn-orange' : 'bg-gold-500 text-night-950 transition-colors group-hover:bg-gold-400'
          }`}
        >
          Comprar ahora
          <IconArrowRight className="h-[max(2.4cqw,10px)] w-[max(2.4cqw,10px)]" />
        </span>
        <span className="hw-promo-feat-label mt-[2.2cqw] font-body text-[1.7cqw] uppercase tracking-[0.32em] text-ink-300">
          Tu esencia, tu historia
        </span>
      </span>
    </a>
  )
}

export default function PromoBanner() {
  return <HtmlPromo href={waLink(message)} halloween={HALLOWEEN_ACTIVE} />
}
