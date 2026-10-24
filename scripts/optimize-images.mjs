import sharp from 'sharp'
import { mkdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const SRC = path.join(ROOT, 'source-material')
const OUT = path.join(ROOT, 'src', 'assets', 'img')
const PUBLIC = path.join(ROOT, 'public')

mkdirSync(OUT, { recursive: true })
mkdirSync(PUBLIC, { recursive: true })

const bottleSrc = path.join(SRC, 'botella-oficial-ambiente.png')
const bottleOficialSrc = path.join(SRC, 'botella-oficial.png')
const logoSrc = path.join(SRC, 'logo-gentleman-co.png')
const craftPosterSrc = path.join(SRC, 'craft-poster-raw.jpg')
const lifestylePosterSrc = path.join(SRC, 'lifestyle-poster-raw.jpg')
const studioPosterSrc = path.join(SRC, 'studio-poster-raw.jpg')
const genderCaballeroSrc = path.join(SRC, 'gender-caballero-raw.png')
const genderDamaSrc = path.join(SRC, 'gender-dama-raw.png')
const genderUnisexSrc = path.join(SRC, 'gender-unisex-raw.png')

async function emit(pipeline, outBase) {
  await pipeline.clone().webp({ quality: 82 }).toFile(path.join(OUT, `${outBase}.webp`))
  await pipeline.clone().avif({ quality: 55 }).toFile(path.join(OUT, `${outBase}.avif`))
  await pipeline.clone().jpeg({ quality: 84, mozjpeg: true }).toFile(path.join(OUT, `${outBase}.jpg`))
}

// Convierte el fondo blanco/casi-blanco del logo real en transparencia real
// (no solo recorte del margen) para que se vea bien sobre cualquier fondo.
async function makeTransparent(buffer, { threshold = 242, feather = 18 } = {}) {
  const img = sharp(buffer).ensureAlpha()
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true })
  const { width, height, channels } = info
  for (let i = 0; i < data.length; i += channels) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    const lightness = (r + g + b) / 3
    if (lightness >= threshold) {
      data[i + 3] = 0
    } else if (lightness >= threshold - feather) {
      const t = (threshold - lightness) / feather
      data[i + 3] = Math.round(255 * t)
    }
  }
  return sharp(data, { raw: { width, height, channels } })
}

// Quita SOLO el fondo blanco de estudio (conectado al borde de la foto) y lo
// vuelve transparente, sin tocar el blanco de la etiqueta del frasco (que
// está rodeado de vidrio oscuro, nunca conectado al borde). A diferencia de
// makeTransparent() (umbral global), esto usa flood-fill desde los bordes.
// No se usa en este momento (la foto actual del frasco es de ambiente, no
// de estudio) — se deja lista por si el cliente manda otra foto de fondo
// plano en el futuro.
async function removeStudioBackground(buffer, { threshold = 232 } = {}) {
  const img = sharp(buffer).ensureAlpha()
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true })
  const { width, height, channels } = info
  const total = width * height
  const visited = new Uint8Array(total)
  const isBg = (p) => {
    const i = p * channels
    return (data[i] + data[i + 1] + data[i + 2]) / 3 >= threshold
  }

  const queue = new Int32Array(total)
  let qHead = 0
  let qTail = 0
  const pushSeed = (p) => {
    if (!visited[p]) {
      visited[p] = 1
      queue[qTail++] = p
    }
  }
  for (let x = 0; x < width; x++) {
    pushSeed(x)
    pushSeed((height - 1) * width + x)
  }
  for (let y = 0; y < height; y++) {
    pushSeed(y * width)
    pushSeed(y * width + (width - 1))
  }

  while (qHead < qTail) {
    const p = queue[qHead++]
    if (!isBg(p)) continue
    data[p * channels + 3] = 0
    const x = p % width
    const y = (p / width) | 0
    if (x > 0 && !visited[p - 1]) {
      visited[p - 1] = 1
      queue[qTail++] = p - 1
    }
    if (x < width - 1 && !visited[p + 1]) {
      visited[p + 1] = 1
      queue[qTail++] = p + 1
    }
    if (y > 0 && !visited[p - width]) {
      visited[p - width] = 1
      queue[qTail++] = p - width
    }
    if (y < height - 1 && !visited[p + width]) {
      visited[p + width] = 1
      queue[qTail++] = p + width
    }
  }

  return sharp(data, { raw: { width, height, channels } })
}

async function run() {
  const meta = await sharp(bottleSrc).metadata()
  console.log('botella-oficial-ambiente.png', meta.width, 'x', meta.height)

  // 1. HERO — full real lifestyle photograph (mostrador de madera, estantería
  // de botellas desenfocada de fondo — la misma foto de ambiente que
  // botella-oficial.png antes de que el cliente mandara la versión ya
  // recortada), trimmed of any letterbox bars, large size for the
  // protagonist hero shot. Reemplaza la foto vieja del frasco con tapa
  // esférica (botella.png, ya no se usa).
  const heroBase = sharp(bottleSrc).rotate()
  const heroTrim = await heroBase.clone().trim({ threshold: 12 }).toBuffer()
  await emit(sharp(heroTrim).resize({ width: 1600, withoutEnlargement: true }), 'hero-bottle')

  // 2. SPOTLIGHT — tighter crop centered on the hero bottle for the product spotlight card / gallery main image.
  // Recorte más amplio que antes (más píxeles nativos = menos borrosidad al mostrarlo grande).
  const trimmedMeta = await sharp(heroTrim).metadata()
  const tw = trimmedMeta.width
  const th = trimmedMeta.height
  const cropW = Math.round(tw * 0.755)
  const cropH = Math.round(th * 0.898)
  const spotlightBuf = await sharp(heroTrim)
    .extract({
      left: Math.round(tw * 0.138),
      top: 0,
      width: cropW,
      height: Math.min(cropH, th),
    })
    .toBuffer()
  await emit(sharp(spotlightBuf).resize({ width: 1200, withoutEnlargement: true }), 'spotlight-bottle')

  // 3. LABEL DETAIL — crop sobre la etiqueta/tapa, segundo ángulo real de la misma fotografía.
  // Más amplio que un close-up extremo para conservar resolución nativa decente.
  const labelBuf = await sharp(heroTrim)
    .extract({
      left: Math.round(tw * 0.239),
      top: Math.round(th * 0.47),
      width: Math.round(tw * 0.552),
      height: Math.round(th * 0.414),
    })
    .toBuffer()
  await emit(sharp(labelBuf).resize({ width: 1100, withoutEnlargement: true }), 'label-detail')

  // 4. OG image: ya no sale de aquí. El recorte del frasco mostraba la
  // etiqueta "NARCISO PARFUM" (Narciso ahora es otra marca); la imagen para
  // compartir la genera scripts/generate-og-image.mjs con el logo de
  // Gentleman Co (public/og-gentleman-co.jpg).

  // 5. Logo — trim the whitespace margin, then key out the white background for
  // real transparency (not just a cropped white box) so it sits cleanly on any surface.
  // Rebranding Narciso Parfum → Gentleman Co (2026-09-18): logo-gentleman-co.png
  // (corona+laurel + wordmark "Gentleman Co. · Fine Fragrances") reemplaza a
  // logo-oficial.png en todo el pipeline — mismo tratamiento (degradados/biseles
  // dorados, no colores planos), así que sigue conviniendo lossy de alta calidad
  // + PNG con paleta en vez de lossless (visualmente idéntico, mucho más liviano).
  const logoTrim = await sharp(logoSrc).trim({ threshold: 8 }).toBuffer()
  const logoTransparentBuf = await (await makeTransparent(logoTrim)).png().toBuffer()
  await sharp(logoTransparentBuf).resize({ height: 440, withoutEnlargement: true }).png({ compressionLevel: 9, palette: true, quality: 95 }).toFile(path.join(OUT, 'logo.png'))
  await sharp(logoTransparentBuf).resize({ height: 440, withoutEnlargement: true }).webp({ quality: 90, alphaQuality: 90 }).toFile(path.join(OUT, 'logo.webp'))

  // 6. Favicon — crop just the crown+laurel mark from the top of the trimmed logo (opaque background needed here).
  // 0.745 mide el hueco real entre el emblema y el adorno/wordmark "Gentleman
  // Co." del logo nuevo (scan fila-por-fila sobre el PNG ya recortado —
  // distinto del 0.70 que medía el logo Narciso anterior, proporciones nuevas).
  const logoMeta = await sharp(logoTrim).metadata()
  const crownH = Math.round(logoMeta.height * 0.745)
  const crownBuf = await sharp(logoTrim)
    .extract({ left: 0, top: 0, width: logoMeta.width, height: crownH })
    .flatten({ background: '#f8f3ea' })
    .toBuffer()
  await sharp(crownBuf).resize(32, 32, { fit: 'contain', background: '#f8f3ea' }).png().toFile(path.join(PUBLIC, 'favicon-32.png'))
  await sharp(crownBuf).resize(180, 180, { fit: 'contain', background: '#f8f3ea' }).png().toFile(path.join(PUBLIC, 'favicon-180.png'))

  // 6b. Crown mark, transparent and large — real artwork (not hand-drawn) for the loading screen.
  // Este asset carga en el primer paint de CADA página (pantalla de carga),
  // así que el peso importa más que en cualquier otra imagen del sitio.
  const crownTransparentBuf = await (await makeTransparent(logoTrim)).extract({ left: 0, top: 0, width: logoMeta.width, height: crownH }).png().toBuffer()
  await sharp(crownTransparentBuf).resize({ height: 480, withoutEnlargement: true }).png({ compressionLevel: 9, palette: true, quality: 95 }).toFile(path.join(OUT, 'crown-mark.png'))
  await sharp(crownTransparentBuf).resize({ height: 480, withoutEnlargement: true }).webp({ quality: 90, alphaQuality: 90 }).toFile(path.join(OUT, 'crown-mark.webp'))

  // 6c. Catalog bottle — real photo of our own bottle (its label still says Narciso) used
  // for every fragrance in the catalog (the business sells one bottle
  // format across all "inspired by" scents). This replaces an older photo
  // of the same bottle: the real hardware changed from a round ball cap to
  // the angular spray-nozzle cap seen here, and the label now matches the
  // official gold crown+laurel logo. botella-oficial.png already ships with
  // a clean real alpha channel (the client sent it pre-cut-out) — no
  // flood-fill or masking needed, just trim the transparent margin.
  const catalogTransparent = await sharp(bottleOficialSrc)
    .trim({ threshold: 5 })
    .resize({ width: 900, withoutEnlargement: true })
    .png()
    .toBuffer()
  await sharp(catalogTransparent).webp({ quality: 90, alphaQuality: 90 }).toFile(path.join(OUT, 'catalog-bottle.webp'))
  await sharp(catalogTransparent).avif({ quality: 60 }).toFile(path.join(OUT, 'catalog-bottle.avif'))
  // Fallback JPG (no alpha support): flatten onto the same ink-900 the cards use, so it still blends.
  await sharp(catalogTransparent).flatten({ background: '#0e0c0a' }).jpeg({ quality: 88, mozjpeg: true }).toFile(path.join(OUT, 'catalog-bottle.jpg'))

  // 7. Video posters — real still frames from the 3 real videos, used as
  // click-to-play posters for the "Detrás de la fragancia" gallery.
  // lifestyle-poster-raw.jpg ahora es un frame extraído del video HD que
  // mandó el cliente (720px nativo, antes 360px) — de ahí el mismo ancho
  // objetivo que los otros dos posters.
  await emit(sharp(craftPosterSrc).resize({ width: 1000, withoutEnlargement: true }), 'craft-poster')
  await emit(sharp(lifestylePosterSrc).resize({ width: 1000, withoutEnlargement: true }), 'lifestyle-poster')
  await emit(sharp(studioPosterSrc).resize({ width: 1000, withoutEnlargement: true }), 'studio-poster')

  // 8. GenderFinder cards (agosto 2026) — 3 escenas de ambiente reales que
  // manda el cliente para las tarjetas Hombre/Mujer/Unisex de "Tu fragancia
  // empieza aquí" (antes reutilizaban hero-bottle/spotlight-bottle/
  // label-detail, que son genéricos y se usan en otras secciones del
  // sitio). Las 3 ya vienen en proporción cercana al aspect-[4/5] de la
  // tarjeta (0.75 nativo vs 0.8 de la tarjeta), object-cover recorta un
  // poco arriba/abajo sin problema.
  await emit(sharp(genderCaballeroSrc).resize({ width: 1000, withoutEnlargement: true }), 'gender-caballero')
  await emit(sharp(genderDamaSrc).resize({ width: 1000, withoutEnlargement: true }), 'gender-dama')
  await emit(sharp(genderUnisexSrc).resize({ width: 1000, withoutEnlargement: true }), 'gender-unisex')

  console.log('Image optimization complete.')
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
