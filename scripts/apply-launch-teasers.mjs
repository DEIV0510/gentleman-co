// Genera los thumbnails de las 2 fotos de "Próximos lanzamientos" (Xerjoff
// Torino21, Elivi Unstoppable Hong Kong) que el cliente agrego a Desktop\NARCISO
// para las tarjetas flotantes del Hero. Mismo patron de sharp que el resto del
// proyecto, pero output cuadrado (recorte para la miniatura de la tarjeta).
import sharp from 'sharp'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const OUT = path.join(ROOT, 'src', 'assets', 'img')
// Desde el 24 de octubre de 2026: versiones con la etiqueta GENTLEMAN CO.
// (scripts/relabel-bottles.mjs, a partir de source-material/launch-teasers/,
// que son las mismas fotos que el cliente dejó en Desktop\NARCISO).
const SRC_DIR = path.join(ROOT, 'source-material', 'gentleman')

const ITEMS = [
  { file: 'launch-torino21.png', id: 'launch-xerjoff-torino21' },
  { file: 'launch-elivi.png', id: 'launch-elivi-unstoppable-hong-kong' },
]

async function run() {
  for (const { file, id } of ITEMS) {
    const src = path.join(SRC_DIR, file)
    // Recorte cuadrado manual (no gravity automatica): ambas fuentes son
    // 1086x1448 con el mismo encuadre, así que un offset fijo alcanza para
    // mantener las tapas Y el texto de marca de la etiqueta visibles.
    const pipeline = sharp(src)
      .extract({ left: 0, top: 150, width: 1086, height: 1086 })
      .resize({ width: 640, height: 640 })
    await pipeline.clone().webp({ quality: 84 }).toFile(path.join(OUT, `${id}.webp`))
    await pipeline.clone().avif({ quality: 58 }).toFile(path.join(OUT, `${id}.avif`))
    await pipeline.clone().jpeg({ quality: 86, mozjpeg: true }).toFile(path.join(OUT, `${id}.jpg`))
    console.log('OK', id)
  }
  console.log('Listo')
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
