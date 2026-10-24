// Cambia la etiqueta "NARCISO PARFUM" por "GENTLEMAN CO." en todas las fotos
// que muestran el frasco (24 de octubre de 2026). El frasco es el mismo; el
// cliente mandó la foto del frasco con la etiqueta nueva
// (source-material/botella-gentleman-original.png, mismo render y mismo
// encuadre que botella-oficial.png). Ver scripts/lib/relabel.mjs.
//
// - Fotos de producto (266): se parte SIEMPRE de la foto original guardada en
//   git (commit ORIGINALS_COMMIT, antes del cambio) o de su fuente de mejor
//   calidad en source-material/, así el script se puede volver a correr sin
//   degradar las imágenes. Las 17 del lote de octubre no pasan por aquí: se
//   rehacen con scripts/compose-nuevos-octubre.mjs y el frasco nuevo.
// - Escenas (portada, producto destacado, categorías y lanzamientos): se
//   guardan en source-material/gentleman/ y las usan optimize-images.mjs y
//   apply-launch-teasers.mjs.
//
// Uso: node scripts/relabel-bottles.mjs [id1,id2,...]
import sharp from 'sharp'
import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { loadRGB, detectLabel, applyLabel, buildTemplate, buildReference } from './lib/relabel.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const SM = path.join(ROOT, 'source-material')
const OUT_PRODUCTS = path.join(ROOT, 'src', 'assets', 'img', 'products')
const OUT_SCENES = path.join(SM, 'gentleman')
const ORIGINALS_COMMIT = '20b3e2c'

// Fuentes de mejor calidad que la foto de producto ya optimizada.
const HQ = {
  'her-elixir-burberry-mujer': 'fotos-7-faltantes/1_Burberry_Her_Elixir_DAMA.png',
  'octans-ahli-unisex': 'fotos-7-faltantes/2_Ahli_Octans_UNISEX.png',
  'bade-e-al-oud-honor-glory-lattafa-unisex': 'fotos-7-faltantes/3_Lattafa_Badee_Al_Oud_Honor_Glory_UNISEX.png',
  'rehab-initio-parfums-prives-unisex': 'fotos-7-faltantes/4_Initio_Rehab_UNISEX.png',
  '9-pm-rebel-afnan-unisex': 'fotos-7-faltantes/5_Afnan_9pm_Rebel_UNISEX.png',
  'hawas-fire-rasasi-unisex': 'fotos-7-faltantes/6_Rasasi_Hawas_Fire_UNISEX.png',
  'club-de-nuit-precieux-i-armaf-unisex': 'fotos-7-faltantes/7_Armaf_Club_de_Nuit_Precieux_I_UNISEX.png',
  'y-eau-de-parfum-yves-saint-laurent-hombre': 'y-eau-de-parfum-yves-saint-laurent.png',
  'torino21-xerjoff-hombre': 'launch-teasers/xerjoff-torino21.png',
  'unstoppable-hong-kong-elivi-parfums-hombre': 'launch-teasers/elivi.png',
}

const SCENES = {
  'ambiente.png': 'botella-oficial-ambiente.png',
  'gender-caballero.png': 'gender-caballero-raw.png',
  'gender-dama.png': 'gender-dama-raw.png',
  'gender-unisex.png': 'gender-unisex-raw.png',
  'launch-torino21.png': 'launch-teasers/xerjoff-torino21.png',
  'launch-elivi.png': 'launch-teasers/elivi.png',
}

const composed = new Set(fs.readdirSync(path.join(SM, 'nuevos-octubre-2026')).filter((f) => f.endsWith('.png')).map((f) => f.replace(/\.png$/, '')))
const only = process.argv[2] ? new Set(process.argv[2].split(',')) : null

async function relabel(input, template, reference) {
  const img = await loadRGB(input)
  const det = detectLabel(img, { reference })
  if (!det) return null
  const data = await applyLabel(img, det, template)
  return { data, w: img.w, h: img.h, det }
}

async function run() {
  const template = await buildTemplate(path.join(SM, 'botella-gentleman-original.png'))
  const reference = await buildReference(path.join(SM, 'botella-oficial.png'))
  const failed = []

  fs.mkdirSync(OUT_SCENES, { recursive: true })
  for (const [out, src] of Object.entries(SCENES)) {
    if (only && !only.has(out)) continue
    const r = await relabel(path.join(SM, src), template, reference)
    if (!r) { failed.push(out); continue }
    await sharp(r.data, { raw: { width: r.w, height: r.h, channels: 3 } }).png({ compressionLevel: 9 }).toFile(path.join(OUT_SCENES, out))
    console.log('escena', out, 'parecido', r.det.sim.toFixed(2))
  }

  const ids = fs.readdirSync(OUT_PRODUCTS).filter((f) => f.endsWith('.jpg')).map((f) => f.replace(/\.jpg$/, '')).filter((id) => !composed.has(id))
  let n = 0
  for (const id of ids) {
    if (only && !only.has(id)) continue
    const input = HQ[id]
      ? path.join(SM, HQ[id])
      : execFileSync('git', ['show', `${ORIGINALS_COMMIT}:src/assets/img/products/${id}.jpg`], { cwd: ROOT, maxBuffer: 64 * 1024 * 1024 })
    const r = await relabel(input, template, reference)
    if (!r) { failed.push(id); continue }
    const pipeline = sharp(r.data, { raw: { width: r.w, height: r.h, channels: 3 } }).resize({ width: 1100, withoutEnlargement: true })
    await pipeline.clone().webp({ quality: 84 }).toFile(path.join(OUT_PRODUCTS, `${id}.webp`))
    await pipeline.clone().avif({ quality: 58 }).toFile(path.join(OUT_PRODUCTS, `${id}.avif`))
    await pipeline.clone().jpeg({ quality: 88, mozjpeg: true }).toFile(path.join(OUT_PRODUCTS, `${id}.jpg`))
    if (++n % 25 === 0) console.log(n, 'fotos de producto listas')
  }
  console.log(`Listo: ${n} fotos de producto.`)
  if (failed.length) {
    console.error('Sin etiqueta detectada (revisar a mano):', failed.join(', '))
    process.exit(1)
  }
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
