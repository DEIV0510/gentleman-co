// Fotos de los 17 perfumes agregados el 2026-10-06 (ver products.js).
//
// El material que llegó (`Downloads\Catalogo Perfumes\Nuevos sin fondo`,
// versión v2 del 7 de octubre) NO trae nuestro frasco: son el fondo
// dorado de estudio vacío ("00 - fondo limpio (sin perfume)") y un recorte
// PNG del frasco real de cada fragancia de inspiración. Todo el resto del
// catálogo muestra nuestro frasco nítido adelante a la derecha y el de
// inspiración desenfocado atrás a la izquierda, así que aquí se arma esa
// misma composición:
//
//   fondo-limpio.jpg
//   + recorte de inspiración (atrás, izquierda): sin halo del recorte,
//     luz cálida, desenfoque leve, reflejo en el piso y sombra de contacto
//   + source-material/botella-gentleman.png (adelante, derecha): el recorte
//     real del frasco, con la luz dorada de la escena, borde iluminado a la
//     derecha, reflejo y sombra
//
// Medidas y posiciones copiadas de `Desktop\NARCISO\amber.png` (Amber
// Rouge, foto del cliente con el mismo fondo y el mismo tamaño 1114x1412).
// La salida usa el pipeline de siempre: 1100 px, webp q84 / avif q58 / jpeg q86.
//
// Uso: node scripts/compose-nuevos-octubre.mjs [carpeta-de-vista-previa]
// (si se pasa una carpeta, también guarda ahí la composición a tamaño completo)
import sharp from 'sharp'
import { mkdirSync, readdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const SRC = path.join(ROOT, 'source-material', 'nuevos-octubre-2026')
const PLATE = path.join(SRC, 'fondo-limpio.jpg')
// Frasco con la etiqueta GENTLEMAN CO. (desde el 24 de octubre de 2026; antes
// botella-oficial.png, con la etiqueta NARCISO).
const BOTTLE = path.join(ROOT, 'source-material', 'botella-gentleman.png')
const OUT = path.join(ROOT, 'src', 'assets', 'img', 'products')
const PREVIEW = process.argv[2]

const INSP = { maxH: 650, maxW: 370, cx: 318, base: 1010, erode: 2, blur: 2.2, mul: [1, 0.84, 0.64], haze: 0.12, hazeColor: [70, 42, 18], targetLum: 108, reflect: 0.3 }
const NAR = { height: 1040, left: 452, base: 1262, mul: [0.96, 0.88, 0.73], reflect: 0.5 }

const clamp = (v) => (v < 0 ? 0 : v > 255 ? 255 : v)

// PNG con alfa → recortado, escalado y en RGB premultiplicado (float).
async function loadLayer(file, { height, maxW, maxH }) {
  const trimmed = await sharp(file).ensureAlpha().trim({ threshold: 1 }).png().toBuffer()
  const meta = await sharp(trimmed).metadata()
  const s = height ? height / meta.height : Math.min(maxH / meta.height, maxW / meta.width)
  const w = Math.round(meta.width * s)
  const h = Math.round(meta.height * s)
  const data = await sharp(trimmed).resize(w, h, { kernel: 'lanczos3' }).raw().toBuffer()
  const px = new Float32Array(w * h * 4)
  for (let i = 0; i < w * h; i++) {
    const a = data[i * 4 + 3] / 255
    px[i * 4] = data[i * 4] * a
    px[i * 4 + 1] = data[i * 4 + 1] * a
    px[i * 4 + 2] = data[i * 4 + 2] * a
    px[i * 4 + 3] = a
  }
  return { px, w, h, pad: 0 }
}

// Quita el halo claro del recorte (restos del fondo blanco original):
// erosiona el alfa con un mínimo de radio r y re-premultiplica.
function erodeAlpha(layer, r) {
  const { px, w, h } = layer
  const a0 = new Float32Array(w * h)
  for (let i = 0; i < w * h; i++) a0[i] = px[i * 4 + 3]
  const tmp = new Float32Array(w * h)
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    let m = 1
    for (let d = -r; d <= r; d++) { const xx = x + d; m = Math.min(m, xx < 0 || xx >= w ? 0 : a0[y * w + xx]) }
    tmp[y * w + x] = m
  }
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    let m = 1
    for (let d = -r; d <= r; d++) { const yy = y + d; m = Math.min(m, yy < 0 || yy >= h ? 0 : tmp[yy * w + x]) }
    const i = (y * w + x) * 4
    const a = a0[y * w + x]
    if (a > 0) { const k = m / a; px[i] *= k; px[i + 1] *= k; px[i + 2] *= k }
    px[i + 3] = m
  }
}

function meanLum(layer) {
  const { px } = layer
  let sum = 0
  let wsum = 0
  for (let i = 0; i < px.length; i += 4) {
    if (px[i + 3] <= 0.05) continue
    sum += 0.299 * px[i] + 0.587 * px[i + 1] + 0.114 * px[i + 2]
    wsum += px[i + 3]
  }
  return sum / wsum
}

// Gradación por canal + bruma hacia el color del fondo (profundidad).
function grade(layer, { mul, haze = 0, hazeColor = [0, 0, 0] }) {
  const { px } = layer
  for (let i = 0; i < px.length; i += 4) {
    const a = px[i + 3]
    for (let c = 0; c < 3; c++) px[i + c] = px[i + c] * mul[c] * (1 - haze) + hazeColor[c] * a * haze
  }
}

// Luz cálida que entra por la derecha (el haz del fondo viene de arriba a la
// derecha): mezcla "screen" que cae con la distancia al borde derecho.
function rimLight(layer, { color, strength, width }) {
  const { px, w, h } = layer
  for (let y = 0; y < h; y++) {
    let l = -1
    let r = -1
    for (let x = 0; x < w; x++) if (px[(y * w + x) * 4 + 3] > 0.5) { if (l < 0) l = x; r = x }
    if (l < 0) continue
    for (let x = l; x <= r; x++) {
      const i = (y * w + x) * 4
      const a = px[i + 3]
      if (a <= 0) continue
      const d = r - x
      const k = Math.exp(-(d * d) / (2 * width * width)) * strength
      for (let c = 0; c < 3; c++) {
        const v = px[i + c] / a
        px[i + c] = (255 - ((255 - v) * (255 - color[c] * k)) / 255) * a
      }
    }
  }
}

// Lado izquierdo en sombra, derecho hacia la luz.
function sideShade(layer, { left, right }) {
  const { px, w, h } = layer
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = (y * w + x) * 4
    const f = left + ((right - left) * x) / (w - 1)
    px[i] *= f
    px[i + 1] *= f
    px[i + 2] *= f
  }
}

function flipV(layer) {
  const { px, w, h } = layer
  const out = new Float32Array(px.length)
  for (let y = 0; y < h; y++) out.set(px.subarray((h - 1 - y) * w * 4, (h - y) * w * 4), y * w * 4)
  return { ...layer, px: out }
}

// Desenfoque gaussiano sobre la capa premultiplicada (sin franjas de color).
async function blurLayer(layer, sigma) {
  const { w, h, px } = layer
  const pad = Math.ceil(sigma * 3)
  const W = w + pad * 2
  const H = h + pad * 2
  const buf = Buffer.alloc(W * H * 4)
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = (y * w + x) * 4
    const j = ((y + pad) * W + x + pad) * 4
    buf[j] = clamp(Math.round(px[i]))
    buf[j + 1] = clamp(Math.round(px[i + 1]))
    buf[j + 2] = clamp(Math.round(px[i + 2]))
    buf[j + 3] = Math.round(px[i + 3] * 255)
  }
  const out = await sharp(buf, { raw: { width: W, height: H, channels: 4 } }).blur(sigma).raw().toBuffer()
  const res = new Float32Array(W * H * 4)
  for (let i = 0; i < W * H; i++) {
    res[i * 4] = out[i * 4]
    res[i * 4 + 1] = out[i * 4 + 1]
    res[i * 4 + 2] = out[i * 4 + 2]
    res[i * 4 + 3] = out[i * 4 + 3] / 255
  }
  return { px: res, w: W, h: H, pad }
}

// "over" de una capa premultiplicada sobre el lienzo RGB, con opacidad por píxel.
function over(canvas, CW, CH, layer, left, top, opacity = () => 1) {
  const { px, w, h } = layer
  for (let y = 0; y < h; y++) {
    const Y = y + top
    if (Y < 0 || Y >= CH) continue
    for (let x = 0; x < w; x++) {
      const X = x + left
      if (X < 0 || X >= CW) continue
      const i = (y * w + x) * 4
      const o = opacity(x, y)
      const a = px[i + 3] * o
      if (a <= 0) continue
      const j = (Y * CW + X) * 3
      canvas[j] = px[i] * o + canvas[j] * (1 - a)
      canvas[j + 1] = px[i + 1] * o + canvas[j + 1] * (1 - a)
      canvas[j + 2] = px[i + 2] * o + canvas[j + 2] * (1 - a)
    }
  }
}

// Sombra de contacto: elipse oscura difusa (multiplica).
function shadow(canvas, CW, CH, cx, cy, rx, ry, strength) {
  for (let y = Math.floor(cy - ry * 3); y < cy + ry * 3; y++) {
    if (y < 0 || y >= CH) continue
    for (let x = Math.floor(cx - rx * 1.4); x < cx + rx * 1.4; x++) {
      if (x < 0 || x >= CW) continue
      const dx = (x - cx) / rx
      const dy = (y - cy) / ry
      const k = Math.exp(-(dx * dx + dy * dy) * 1.6) * strength
      const j = (y * CW + x) * 3
      canvas[j] *= 1 - k
      canvas[j + 1] *= 1 - k
      canvas[j + 2] *= 1 - k
    }
  }
}

async function compose(inspFile, plate, bottle) {
  const CW = plate.info.width
  const CH = plate.info.height
  const canvas = new Float32Array(CW * CH * 3)
  for (let i = 0; i < canvas.length; i++) canvas[i] = plate.data[i]

  // Frasco de inspiración: atrás a la izquierda. El brillo se ajusta según
  // lo claro que sea el frasco, para que uno blanco no quede "pegado".
  const insp = await loadLayer(inspFile, INSP)
  erodeAlpha(insp, INSP.erode)
  const k = Math.min(1.1, Math.max(0.6, INSP.targetLum / meanLum(insp)))
  grade(insp, { mul: INSP.mul.map((m) => m * k), haze: INSP.haze, hazeColor: INSP.hazeColor })
  rimLight(insp, { color: [255, 170, 80], strength: 0.25, width: 10 })
  const inspLeft = Math.round(INSP.cx - insp.w / 2)
  shadow(canvas, CW, CH, INSP.cx, INSP.base, insp.w * 0.55, 10, 0.55)
  const inspRef = await blurLayer(flipV(insp), 3.5)
  over(canvas, CW, CH, inspRef, inspLeft - inspRef.pad, INSP.base - inspRef.pad, (x, y) => Math.max(0, INSP.reflect * (1 - (y - inspRef.pad) / 230)))
  const inspB = await blurLayer(insp, INSP.blur)
  over(canvas, CW, CH, inspB, inspLeft - inspB.pad, INSP.base - insp.h - inspB.pad)

  // Nuestro frasco: adelante a la derecha, nítido.
  shadow(canvas, CW, CH, NAR.left + bottle.w / 2, NAR.base, bottle.w * 0.56, 12, 0.75)
  over(canvas, CW, CH, bottle.reflection, NAR.left - bottle.reflection.pad, NAR.base - bottle.reflection.pad, (x, y) => Math.max(0, NAR.reflect * Math.pow(Math.max(0, 1 - (y - bottle.reflection.pad) / 210), 1.6)))
  over(canvas, CW, CH, bottle, NAR.left, NAR.base - bottle.h)

  const out = Buffer.alloc(CW * CH * 3)
  for (let i = 0; i < out.length; i++) out[i] = clamp(Math.round(canvas[i]))
  return sharp(out, { raw: { width: CW, height: CH, channels: 3 } }).png().toBuffer()
}

async function run() {
  mkdirSync(OUT, { recursive: true })
  if (PREVIEW) mkdirSync(PREVIEW, { recursive: true })
  const plate = await sharp(PLATE).raw().toBuffer({ resolveWithObject: true })

  // Nuestro frasco es el mismo en las 17: se prepara una sola vez.
  const bottle = await loadLayer(BOTTLE, NAR)
  grade(bottle, { mul: NAR.mul })
  sideShade(bottle, { left: 0.78, right: 1 })
  rimLight(bottle, { color: [255, 160, 70], strength: 0.45, width: 9 })
  bottle.reflection = await blurLayer(flipV(bottle), 1.2)

  const ids = readdirSync(SRC).filter((f) => f.endsWith('.png')).map((f) => f.replace(/\.png$/, ''))
  for (const id of ids) {
    const composed = await compose(path.join(SRC, `${id}.png`), plate, bottle)
    if (PREVIEW) await sharp(composed).jpeg({ quality: 92, mozjpeg: true }).toFile(path.join(PREVIEW, `${id}.jpg`))
    const pipeline = sharp(composed).resize({ width: 1100, withoutEnlargement: true })
    await pipeline.clone().webp({ quality: 84 }).toFile(path.join(OUT, `${id}.webp`))
    await pipeline.clone().avif({ quality: 58 }).toFile(path.join(OUT, `${id}.avif`))
    await pipeline.clone().jpeg({ quality: 86, mozjpeg: true }).toFile(path.join(OUT, `${id}.jpg`))
    console.log('OK', id)
  }
  console.log('Listo:', ids.length, 'fotos compuestas en', OUT)
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
