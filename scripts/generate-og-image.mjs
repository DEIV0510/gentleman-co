// Imagen para compartir el sitio (WhatsApp, Facebook, X): public/og-gentleman-co.jpg,
// 1200x630 (nombre nuevo para que WhatsApp y Facebook no sigan mostrando la
// vista previa vieja que tienen guardada por dirección). Antes era la foto del frasco con la etiqueta "NARCISO PARFUM" en
// primer plano; como Narciso ahora es otra marca con su propia web, la
// vista previa muestra el logo de Gentleman Co sobre el fondo cálido de
// estanterías de la foto de ambiente, desenfocado para que no se lea
// ninguna etiqueta.
import sharp from 'sharp'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const W = 1200
const H = 630

const background = await sharp(path.join(ROOT, 'source-material', 'botella-oficial-ambiente.png'))
  .resize(W, H, { fit: 'cover', position: 'centre' })
  .blur(38)
  .modulate({ brightness: 0.55, saturation: 0.9 })
  .toBuffer()

// Viñeta oscura al centro para que el logo dorado contraste.
const vignette = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <defs>
      <radialGradient id="v" cx="50%" cy="50%" r="62%">
        <stop offset="0%" stop-color="#080808" stop-opacity="0.78"/>
        <stop offset="60%" stop-color="#080808" stop-opacity="0.55"/>
        <stop offset="100%" stop-color="#080808" stop-opacity="0.2"/>
      </radialGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#v)"/>
  </svg>`
)

const logo = await sharp(path.join(ROOT, 'src', 'assets', 'img', 'logo.png')).resize({ height: 400 }).toBuffer()
const logoMeta = await sharp(logo).metadata()

const layered = await sharp(background)
  .composite([
    { input: vignette, left: 0, top: 0 },
    { input: logo, left: Math.round((W - logoMeta.width) / 2), top: Math.round((H - logoMeta.height) / 2) },
  ])
  .png()
  .toBuffer()

await sharp(layered).jpeg({ quality: 86, mozjpeg: true }).toFile(path.join(ROOT, 'public', 'og-gentleman-co.jpg'))
console.log('public/og-gentleman-co.jpg generado', W + 'x' + H)
