// Reemplaza las fotos de los 7 productos historicamente mas problematicos
// (Her Elixir, Octans, Bade'e Al Oud Honor & Glory, Rehab, 9 PM Rebel,
// Hawas Fire, Club de Nuit Precieux I) con las fotos originales de alta
// resolucion (1080x1440 PNG sin compresion) que el cliente mando en
// Desktop\NARCISO_7_FALTANTES — mejor calidad que las usadas antes
// (extraccion de PDF a 880x1173 JPG, o el lote NUEVOS_DAMAS/UNISEX).
import sharp from 'sharp'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const OUT = path.join(ROOT, 'src', 'assets', 'img', 'products')
const SRC_DIR = 'C:\\Users\\Lenovo\\Desktop\\NARCISO_7_FALTANTES'

const MAP = {
  '1_Burberry_Her_Elixir_DAMA.png': 'her-elixir-burberry-mujer',
  '2_Ahli_Octans_UNISEX.png': 'octans-ahli-unisex',
  '3_Lattafa_Badee_Al_Oud_Honor_Glory_UNISEX.png': 'bade-e-al-oud-honor-glory-lattafa-unisex',
  '4_Initio_Rehab_UNISEX.png': 'rehab-initio-parfums-prives-unisex',
  '5_Afnan_9pm_Rebel_UNISEX.png': '9-pm-rebel-afnan-unisex',
  '6_Rasasi_Hawas_Fire_UNISEX.png': 'hawas-fire-rasasi-unisex',
  '7_Armaf_Club_de_Nuit_Precieux_I_UNISEX.png': 'club-de-nuit-precieux-i-armaf-unisex',
}

async function run() {
  for (const [file, id] of Object.entries(MAP)) {
    const src = path.join(SRC_DIR, file)
    const pipeline = sharp(src).resize({ width: 1100, withoutEnlargement: true })
    await pipeline.clone().webp({ quality: 84 }).toFile(path.join(OUT, `${id}.webp`))
    await pipeline.clone().avif({ quality: 58 }).toFile(path.join(OUT, `${id}.avif`))
    await pipeline.clone().jpeg({ quality: 86, mozjpeg: true }).toFile(path.join(OUT, `${id}.jpg`))
    console.log('OK', id)
  }
  console.log('Listo: 7 productos actualizados con foto de alta resolucion')
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
