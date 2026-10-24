// Genera las fotos reales individuales por producto (agosto 2026): el
// cliente mandó Desktop\portadas con una imagen por código de referencia
// (mismo frasco propio real en primer plano, nítido, con el frasco de la
// fragancia real en la que se inspira desenfocado de fondo). Reemplazan la
// foto genérica compartida `catalog-bottle.*` para los productos que tienen
// una — el resto sigue usando `catalog-bottle` como respaldo.
import sharp from 'sharp'
import { mkdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const OUT = path.join(ROOT, 'src', 'assets', 'img', 'products')
mkdirSync(OUT, { recursive: true })

const mappingPath = process.argv[2]
if (!mappingPath) {
  console.error('Uso: node optimize-product-photos.mjs <ruta-a-image-product-mapping.json>')
  process.exit(1)
}
const data = JSON.parse(readFileSync(mappingPath, 'utf8'))

// C054 quedó fuera (defectuosa, movida a Desktop\portadas\defectuosa).
// El par C068/C082 son el mismo producto real ("Black XS L'Excès") -
// se usa solo C068 como fuente.
const SKIP_CODES = new Set(['C054', 'C082'])

const items = data.mapped.filter((m) => !SKIP_CODES.has(m.codigo))
console.log('procesando', items.length, 'fotos de producto')

async function run() {
  let done = 0
  for (const item of items) {
    const src = path.join('C:\\Users\\Lenovo\\Desktop\\portadas', item.folder, item.rawFile)
    const pipeline = sharp(src).resize({ width: 1100, withoutEnlargement: true })
    const base = item.productId
    await pipeline.clone().webp({ quality: 84 }).toFile(path.join(OUT, `${base}.webp`))
    await pipeline.clone().avif({ quality: 58 }).toFile(path.join(OUT, `${base}.avif`))
    await pipeline.clone().jpeg({ quality: 86, mozjpeg: true }).toFile(path.join(OUT, `${base}.jpg`))
    done++
    if (done % 40 === 0) console.log(done, '/', items.length)
  }
  console.log('Listo:', done, 'productos con foto individual generada en', OUT)
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
