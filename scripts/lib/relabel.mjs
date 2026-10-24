// Reemplazo de la etiqueta del frasco en fotos ya compuestas (oct. 2026):
// las fotos del catálogo muestran el frasco con la etiqueta vieja "NARCISO
// PARFUM"; el frasco es el mismo, solo cambia la etiqueta a "GENTLEMAN CO.".
//
// 1. detectLabel: busca la etiqueta (el rectángulo crema más grande rodeado
//    del vidrio negro del frasco) y ajusta sus 4 bordes: izquierdo/derecho
//    como rectas y superior/inferior como parábolas (el frasco es redondo y
//    la etiqueta se curva).
// 2. La etiqueta nueva (plantilla) se "endereza" a un rectángulo con sus
//    propios bordes y se vuelve a curvar siguiendo los bordes de la vieja:
//    queda exactamente en su lugar, con la misma forma.
// 3. Luz y color: se mide el color del papel de la etiqueta vieja punto a
//    punto (sin el texto) y se aplica a la nueva, así hereda la luz cálida,
//    las sombras y el degradado de cada escena.
import sharp from 'sharp'

export async function loadRGB(input) {
  const { data, info } = await sharp(input).removeAlpha().raw().toBuffer({ resolveWithObject: true })
  return { data, w: info.width, h: info.height }
}

const lum = (d, i) => 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]

// Componentes conexos (4 vecinos) de un binario; devuelve etiquetas y stats.
function components(bin, w, h) {
  const lab = new Int32Array(w * h).fill(-1)
  const stats = []
  const stack = new Int32Array(w * h)
  for (let s = 0; s < w * h; s++) {
    if (!bin[s] || lab[s] !== -1) continue
    const id = stats.length
    let sp = 0
    stack[sp++] = s
    lab[s] = id
    let area = 0, x0 = w, y0 = h, x1 = 0, y1 = 0
    while (sp) {
      const p = stack[--sp]
      const x = p % w, y = (p / w) | 0
      area++
      if (x < x0) x0 = x
      if (x > x1) x1 = x
      if (y < y0) y0 = y
      if (y > y1) y1 = y
      if (x > 0 && bin[p - 1] && lab[p - 1] === -1) { lab[p - 1] = id; stack[sp++] = p - 1 }
      if (x < w - 1 && bin[p + 1] && lab[p + 1] === -1) { lab[p + 1] = id; stack[sp++] = p + 1 }
      if (y > 0 && bin[p - w] && lab[p - w] === -1) { lab[p - w] = id; stack[sp++] = p - w }
      if (y < h - 1 && bin[p + w] && lab[p + w] === -1) { lab[p + w] = id; stack[sp++] = p + w }
    }
    stats.push({ id, area, x0, y0, x1, y1 })
  }
  return { lab, stats }
}

// Mínimos cuadrados con descarte de atípicos (2 vueltas). deg 1 o 2.
function fitPoly(pts, deg) {
  let use = pts
  let coef = null
  for (let iter = 0; iter < 3; iter++) {
    const n = deg + 1
    const A = Array.from({ length: n }, () => new Float64Array(n))
    const b = new Float64Array(n)
    for (const [t, v] of use) {
      const pw = [1, t, t * t]
      for (let i = 0; i < n; i++) {
        b[i] += pw[i] * v
        for (let j = 0; j < n; j++) A[i][j] += pw[i] * pw[j]
      }
    }
    // Gauss
    for (let i = 0; i < n; i++) {
      let piv = i
      for (let r = i + 1; r < n; r++) if (Math.abs(A[r][i]) > Math.abs(A[piv][i])) piv = r
      ;[A[i], A[piv]] = [A[piv], A[i]]
      ;[b[i], b[piv]] = [b[piv], b[i]]
      for (let r = i + 1; r < n; r++) {
        const f = A[r][i] / A[i][i]
        for (let c = i; c < n; c++) A[r][c] -= f * A[i][c]
        b[r] -= f * b[i]
      }
    }
    coef = new Float64Array(n)
    for (let i = n - 1; i >= 0; i--) {
      let sum = b[i]
      for (let c = i + 1; c < n; c++) sum -= A[i][c] * coef[c]
      coef[i] = sum / A[i][i]
    }
    const f = (t) => coef[0] + coef[1] * t + (deg > 1 ? coef[2] * t * t : 0)
    const res = pts.map(([t, v]) => Math.abs(f(t) - v))
    const sorted = [...res].sort((a, c) => a - c)
    const cut = Math.max(1.2, sorted[Math.floor(sorted.length * 0.8)] * 2)
    use = pts.filter((_, i) => res[i] <= cut)
  }
  const c = coef
  return (t) => c[0] + c[1] * t + (c.length > 2 ? c[2] * t * t : 0)
}

// Bordes de una máscara rellena de etiqueta → funciones ajustadas.
function fitEdges(mask, w, box) {
  const { x0, y0, x1, y1 } = box
  const bw = x1 - x0, bh = y1 - y0
  const L = [], R = [], T = [], B = []
  for (let y = Math.round(y0 + bh * 0.12); y <= y1 - bh * 0.12; y++) {
    let l = -1, r = -1
    for (let x = x0; x <= x1; x++) if (mask[y * w + x]) { if (l < 0) l = x; r = x }
    if (l >= 0) { L.push([y, l]); R.push([y, r + 1]) }
  }
  for (let x = Math.round(x0 + bw * 0.12); x <= x1 - bw * 0.12; x++) {
    let t = -1, b = -1
    for (let y = y0; y <= y1; y++) if (mask[y * w + x]) { if (t < 0) t = y; b = y }
    if (t >= 0) { T.push([x, t]); B.push([x, b + 1]) }
  }
  return { left: fitPoly(L, 1), right: fitPoly(R, 1), top: fitPoly(T, 2), bottom: fitPoly(B, 2) }
}

// Rellena huecos (texto) de una máscara: dentro si está entre extremos de su
// fila Y de su columna.
function fillMask(mask, w, box) {
  const { x0, y0, x1, y1 } = box
  const rowL = new Int32Array(y1 + 1).fill(-1), rowR = new Int32Array(y1 + 1).fill(-1)
  const colT = new Int32Array(x1 + 1).fill(-1), colB = new Int32Array(x1 + 1).fill(-1)
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (mask[y * w + x]) {
    if (rowL[y] < 0) rowL[y] = x
    rowR[y] = x
    if (colT[x] < 0) colT[x] = y
    colB[x] = y
  }
  const out = new Uint8Array(mask.length)
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
    if (rowL[y] >= 0 && x >= rowL[y] && x <= rowR[y] && colT[x] >= 0 && y >= colT[x] && y <= colB[x]) out[y * w + x] = 1
  }
  return out
}

// Detecta la etiqueta en la foto. Devuelve null si no hay candidata clara.
export function detectLabel(img, opts = {}) {
  const { data, w, h } = img
  const N = w * h
  const Lm = new Float32Array(N)
  for (let i = 0; i < N; i++) Lm[i] = lum(data, i * 3)
  let best = null
  for (const t of opts.thresholds || [60, 75, 90, 105, 120, 140, 160, 180, 200]) {
    const bin = new Uint8Array(N)
    for (let i = 0; i < N; i++) bin[i] = Lm[i] > t ? 1 : 0
    const { lab, stats } = components(bin, w, h)
    for (const c of stats) {
      if (c.area < N * 0.003 || c.area > N * 0.2) continue
      const bw = c.x1 - c.x0 + 1, bh = c.y1 - c.y0 + 1
      const aspect = bh / bw
      if (aspect < 0.95 || aspect > 1.6) continue
      // relleno por filas (los huecos del texto cuentan como etiqueta)
      let spanArea = 0
      for (let y = c.y0; y <= c.y1; y++) {
        let l = -1, r = -1
        for (let x = c.x0; x <= c.x1; x++) if (lab[y * w + x] === c.id) { if (l < 0) l = x; r = x }
        if (l >= 0) spanArea += r - l + 1
      }
      const fill = spanArea / (bw * bh)
      const density = c.area / spanArea
      if (fill < 0.8 || density < 0.55) continue
      // brillo del papel y oscuridad a los lados (vidrio negro del frasco)
      let pSum = 0, pN = 0
      for (let y = c.y0; y <= c.y1; y += 2) for (let x = c.x0; x <= c.x1; x += 2) if (lab[y * w + x] === c.id) { pSum += Lm[y * w + x]; pN++ }
      const paper = pSum / pN
      let sSum = 0, sN = 0
      for (let y = Math.round(c.y0 + bh * 0.25); y < c.y1 - bh * 0.25; y += 2) {
        for (const x of [c.x0 - Math.round(bw * 0.08), c.x0 - Math.round(bw * 0.04), c.x1 + Math.round(bw * 0.04), c.x1 + Math.round(bw * 0.08)]) {
          if (x < 0 || x >= w) continue
          sSum += Lm[y * w + x]
          sN++
        }
      }
      if (!sN) continue
      const side = sSum / sN
      const dark = 1 - side / paper
      if (dark < 0.35) continue
      // Debe parecerse a la etiqueta vieja (logo arriba, nombre grande,
      // líneas de texto): descarta cuadros, cajas o carteles claros.
      const sim = opts.reference ? layoutSimilarity(Lm, w, c, opts.reference) : 1
      if (sim < 0.45) continue
      const score = fill * density * dark * sim * Math.sqrt(c.area) * (1 - Math.abs(aspect - 1.22) * 0.6)
      if (!best || score > best.score) best = { score, t, c, paper, side, sim }
    }
  }
  if (!best) return null
  // Refinar: umbral a mitad entre papel y vidrio, dentro de la caja ampliada.
  const { c } = best
  const bw = c.x1 - c.x0 + 1, bh = c.y1 - c.y0 + 1
  const box = {
    x0: Math.max(0, c.x0 - Math.round(bw * 0.06)), x1: Math.min(w - 1, c.x1 + Math.round(bw * 0.06)),
    y0: Math.max(0, c.y0 - Math.round(bh * 0.06)), y1: Math.min(h - 1, c.y1 + Math.round(bh * 0.06)),
  }
  const thr = best.side + (best.paper - best.side) * 0.45
  const bin = new Uint8Array(N)
  for (let y = box.y0; y <= box.y1; y++) for (let x = box.x0; x <= box.x1; x++) bin[y * w + x] = Lm[y * w + x] > thr ? 1 : 0
  const { lab, stats } = components(bin, w, h)
  const main = stats.reduce((a, s) => (s.area > (a?.area || 0) ? s : a), null)
  const raw = new Uint8Array(N)
  for (let y = main.y0; y <= main.y1; y++) for (let x = main.x0; x <= main.x1; x++) if (lab[y * w + x] === main.id) raw[y * w + x] = 1
  const mbox = { x0: main.x0, y0: main.y0, x1: main.x1, y1: main.y1 }
  const mask = fillMask(raw, w, mbox)
  const edges = fitEdges(mask, w, mbox)
  return { box: mbox, mask, edges, score: best.score, paper: best.paper, side: best.side, sim: best.sim }
}

const GRID_W = 20, GRID_H = 24

// Luminancia promedio de la caja en una rejilla GRID_W x GRID_H, normalizada
// (media 0, desviación 1): la "huella" del diseño de la etiqueta.
function layoutGrid(Lm, w, box) {
  const { x0, y0, x1, y1 } = box
  const g = new Float32Array(GRID_W * GRID_H)
  const cw = (x1 - x0 + 1) / GRID_W, ch = (y1 - y0 + 1) / GRID_H
  for (let gy = 0; gy < GRID_H; gy++) for (let gx = 0; gx < GRID_W; gx++) {
    let sum = 0, n = 0
    for (let y = Math.floor(y0 + gy * ch); y < Math.floor(y0 + (gy + 1) * ch); y++) for (let x = Math.floor(x0 + gx * cw); x < Math.floor(x0 + (gx + 1) * cw); x++) { sum += Lm[y * w + x]; n++ }
    g[gy * GRID_W + gx] = n ? sum / n : 0
  }
  let mean = 0
  for (const v of g) mean += v
  mean /= g.length
  let sd = 0
  for (const v of g) sd += (v - mean) ** 2
  sd = Math.sqrt(sd / g.length) || 1
  for (let i = 0; i < g.length; i++) g[i] = (g[i] - mean) / sd
  return g
}

function layoutSimilarity(Lm, w, box, reference) {
  const g = layoutGrid(Lm, w, box)
  let r = 0
  for (let i = 0; i < g.length; i++) r += g[i] * reference[i]
  return r / g.length
}

// Huella de la etiqueta VIEJA (la que se busca en las fotos), a partir de una
// imagen donde se vea clara (el recorte oficial del frasco).
export async function buildReference(srcPath) {
  const flat = await sharp(srcPath).flatten({ background: '#000' }).png().toBuffer()
  const img = await loadRGB(flat)
  const det = detectLabel(img)
  if (!det) throw new Error('No se encontró la etiqueta de referencia')
  const N = img.w * img.h
  const Lm = new Float32Array(N)
  for (let i = 0; i < N; i++) Lm[i] = lum(img.data, i * 3)
  return layoutGrid(Lm, img.w, det.box)
}

// Enderezar la etiqueta de la plantilla a un rectángulo Wr x Hr.
export function rectify(img, det, Wr, Hr) {
  const { data, w } = img
  const { left, right, top, bottom } = det.edges
  const out = new Float32Array(Wr * Hr * 3)
  const xc = (det.box.x0 + det.box.x1) / 2
  for (let j = 0; j < Hr; j++) {
    const V = (j + 0.5) / Hr
    for (let i = 0; i < Wr; i++) {
      const U = (i + 0.5) / Wr
      let y = top(xc) + V * (bottom(xc) - top(xc))
      let x = left(y) + U * (right(y) - left(y))
      for (let k = 0; k < 3; k++) {
        y = top(x) + V * (bottom(x) - top(x))
        x = left(y) + U * (right(y) - left(y))
      }
      sampleBilinear(data, w, img.h, x - 0.5, y - 0.5, out, (j * Wr + i) * 3)
    }
  }
  return { data: out, w: Wr, h: Hr }
}

function sampleBilinear(d, w, h, x, y, out, o) {
  const x0 = Math.max(0, Math.min(w - 1, Math.floor(x))), y0 = Math.max(0, Math.min(h - 1, Math.floor(y)))
  const x1 = Math.min(w - 1, x0 + 1), y1 = Math.min(h - 1, y0 + 1)
  const fx = Math.max(0, Math.min(1, x - x0)), fy = Math.max(0, Math.min(1, y - y0))
  for (let c = 0; c < 3; c++) {
    const a = d[(y0 * w + x0) * 3 + c], b = d[(y0 * w + x1) * 3 + c]
    const e = d[(y1 * w + x0) * 3 + c], f = d[(y1 * w + x1) * 3 + c]
    out[o + c] = (a * (1 - fx) + b * fx) * (1 - fy) + (e * (1 - fx) + f * fx) * fy
  }
}

// Color del papel punto a punto: máximo local (borra letras y adornos) y
// desenfoque normalizado por la máscara. Trabaja en una caja.
function paperMap(get, mask, bw, bh, r, rBlur = r) {
  const N = bw * bh
  const lumv = new Float32Array(N)
  const rgb = new Float32Array(N * 3)
  for (let i = 0; i < N; i++) {
    const [R, G, B] = get(i)
    rgb[i * 3] = R; rgb[i * 3 + 1] = G; rgb[i * 3 + 2] = B
    lumv[i] = mask[i] ? 0.299 * R + 0.587 * G + 0.114 * B : -1
  }
  // máximo local separable: guarda el índice del píxel más claro
  const idxH = new Int32Array(N), idx = new Int32Array(N)
  for (let y = 0; y < bh; y++) for (let x = 0; x < bw; x++) {
    let bi = -1, bv = -1
    for (let k = Math.max(0, x - r); k <= Math.min(bw - 1, x + r); k++) { const v = lumv[y * bw + k]; if (v > bv) { bv = v; bi = y * bw + k } }
    idxH[y * bw + x] = bi
  }
  for (let y = 0; y < bh; y++) for (let x = 0; x < bw; x++) {
    let bi = -1, bv = -1
    for (let k = Math.max(0, y - r); k <= Math.min(bh - 1, y + r); k++) { const j = idxH[k * bw + x]; if (j >= 0 && lumv[j] > bv) { bv = lumv[j]; bi = j } }
    idx[y * bw + x] = bi
  }
  const val = new Float32Array(N * 3), wt = new Float32Array(N)
  for (let i = 0; i < N; i++) if (mask[i] && idx[i] >= 0) { const j = idx[i]; val[i * 3] = rgb[j * 3]; val[i * 3 + 1] = rgb[j * 3 + 1]; val[i * 3 + 2] = rgb[j * 3 + 2]; wt[i] = 1 }
  // desenfoque de caja x3 (≈ gaussiano), normalizado; radio propio (más
  // amplio que el del máximo local) para que no queden manchas del texto viejo
  const blur = (arr, ch, r = rBlur) => {
    let a = arr
    for (let pass = 0; pass < 3; pass++) {
      const b = new Float32Array(a.length)
      for (let y = 0; y < bh; y++) {
        for (let c = 0; c < ch; c++) {
          let s = 0
          for (let x = -r; x <= r; x++) s += x >= 0 && x < bw ? a[(y * bw + x) * ch + c] : 0
          for (let x = 0; x < bw; x++) {
            b[(y * bw + x) * ch + c] = s / (2 * r + 1)
            const add = x + r + 1, sub = x - r
            if (add < bw) s += a[(y * bw + add) * ch + c]
            if (sub >= 0) s -= a[(y * bw + sub) * ch + c]
          }
        }
      }
      const d2 = new Float32Array(a.length)
      for (let x = 0; x < bw; x++) {
        for (let c = 0; c < ch; c++) {
          let s = 0
          for (let y = -r; y <= r; y++) s += y >= 0 && y < bh ? b[(y * bw + x) * ch + c] : 0
          for (let y = 0; y < bh; y++) {
            d2[(y * bw + x) * ch + c] = s / (2 * r + 1)
            const add = y + r + 1, sub = y - r
            if (add < bh) s += b[(add * bw + x) * ch + c]
            if (sub >= 0) s -= b[(sub * bw + x) * ch + c]
          }
        }
      }
      a = d2
    }
    return a
  }
  const bv = blur(val, 3), bwt = blur(wt, 1)
  const out = new Float32Array(N * 3)
  for (let i = 0; i < N; i++) {
    const k = bwt[i] > 1e-4 ? 1 / bwt[i] : 0
    out[i * 3] = bv[i * 3] * k; out[i * 3 + 1] = bv[i * 3 + 1] * k; out[i * 3 + 2] = bv[i * 3 + 2] * k
  }
  return out
}

// Plantilla lista para usar: etiqueta nueva enderezada + su mapa de papel.
export async function buildTemplate(srcPath) {
  const img = await loadRGB(srcPath)
  const det = detectLabel(img)
  if (!det) throw new Error('No se encontró la etiqueta en la plantilla')
  const Wr = Math.round(det.box.x1 - det.box.x0), Hr = Math.round(det.box.y1 - det.box.y0)
  const rect = rectify(img, det, Wr, Hr)
  return { rect, det }
}

// Escala la etiqueta enderezada al tamaño de destino (lanczos con sharp) y
// le devuelve un poco de nitidez: al reducirla queda más suave que la original.
async function scaleRect(rect, W, H) {
  const buf = Buffer.alloc(rect.w * rect.h * 3)
  for (let i = 0; i < buf.length; i++) buf[i] = Math.max(0, Math.min(255, Math.round(rect.data[i])))
  const out = await sharp(buf, { raw: { width: rect.w, height: rect.h, channels: 3 } }).resize(W, H, { fit: 'fill', kernel: 'lanczos3' }).sharpen({ sigma: 0.6 }).raw().toBuffer()
  return { data: out, w: W, h: H }
}

// Reemplaza la etiqueta detectada en `img` por la plantilla. Devuelve Buffer RGB.
export async function applyLabel(img, det, template, opts = {}) {
  const { data, w, h } = img
  const { left, right, top, bottom } = det.edges
  const { x0, y0, x1, y1 } = det.box
  const pad = 3
  const bx0 = Math.max(0, x0 - pad), by0 = Math.max(0, y0 - pad), bx1 = Math.min(w - 1, x1 + pad), by1 = Math.min(h - 1, y1 + pad)
  const bw = bx1 - bx0 + 1, bh = by1 - by0 + 1
  const Wt = Math.max(8, Math.round(x1 - x0)), Ht = Math.max(8, Math.round(y1 - y0))
  const T = await scaleRect(template.rect, Wt, Ht)
  // máscara de la zona de etiqueta en la caja (bordes ajustados)
  const inMask = new Uint8Array(bw * bh)
  for (let y = 0; y < bh; y++) for (let x = 0; x < bw; x++) {
    const X = x + bx0 + 0.5, Y = y + by0 + 0.5
    if (X > left(Y) + 1 && X < right(Y) - 1 && Y > top(X) + 1 && Y < bottom(X) - 1) inMask[y * bw + x] = 1
  }
  const r = Math.max(3, Math.round(Wt * (opts.paperRadius || 0.035)))
  const rb = Math.max(r, Math.round(Wt * (opts.blurRadius || 0.09)))
  // papel de la etiqueta vieja (destino)
  const Pt = paperMap((i) => { const x = i % bw + bx0, y = ((i / bw) | 0) + by0, j = (y * w + x) * 3; return [data[j], data[j + 1], data[j + 2]] }, inMask, bw, bh, r, rb)
  // papel de la plantilla a esta escala
  const tMask = new Uint8Array(Wt * Ht).fill(1)
  const Pn = paperMap((i) => [T.data[i * 3], T.data[i * 3 + 1], T.data[i * 3 + 2]], tMask, Wt, Ht, r, rb)
  const out = Buffer.from(data)
  const tmp = new Float32Array(3)
  for (let y = 0; y < bh; y++) for (let x = 0; x < bw; x++) {
    const X = x + bx0 + 0.5, Y = y + by0 + 0.5
    const l = left(Y), rr = right(Y), t = top(X), b = bottom(X)
    // cobertura con borde suave de 1 px
    const cov = Math.max(0, Math.min(1, Math.min(X - l, rr - X, Y - t, b - Y) + 0.5))
    if (cov <= 0) continue
    const u = (X - l) / (rr - l), v = (Y - t) / (b - t)
    const tx = Math.max(0, Math.min(Wt - 1.001, u * Wt - 0.5)), ty = Math.max(0, Math.min(Ht - 1.001, v * Ht - 0.5))
    sampleBilinear(T.data, Wt, Ht, tx, ty, tmp, 0)
    const ti = (Math.round(ty) * Wt + Math.round(tx)) * 3
    // papel destino: el más cercano dentro de la máscara (en el borde, el vecino interior)
    let pi = (y * bw + x) * 3
    if (!inMask[y * bw + x]) {
      const cx = Math.max(1, Math.min(bw - 2, x + (u < 0.5 ? 2 : -2))), cy = Math.max(1, Math.min(bh - 2, y + (v < 0.5 ? 2 : -2)))
      pi = (cy * bw + cx) * 3
    }
    const j = ((y + by0) * w + (x + bx0)) * 3
    for (let c = 0; c < 3; c++) {
      const gain = Pt[pi + c] / Math.max(8, Pn[ti + c])
      const v2 = tmp[c] * gain
      out[j + c] = Math.max(0, Math.min(255, Math.round(v2 * cov + data[j + c] * (1 - cov))))
    }
  }
  matchPaperTint(data, out, w, inMask, bx0, by0, bw, bh)
  return out
}

// Ajuste final de tinte: la mediana del papel nuevo (sus píxeles más claros)
// se iguala, canal por canal, a la del papel viejo de la misma foto.
function matchPaperTint(orig, out, w, inMask, bx0, by0, bw, bh) {
  const idx = []
  for (let y = 0; y < bh; y++) for (let x = 0; x < bw; x++) if (inMask[y * bw + x]) idx.push(((y + by0) * w + (x + bx0)) * 3)
  const paperOf = (d) => {
    const l = idx.map((j) => 0.299 * d[j] + 0.587 * d[j + 1] + 0.114 * d[j + 2])
    const cut = [...l].sort((a, b) => a - b)[Math.floor(l.length * 0.6)]
    const ch = [[], [], []]
    idx.forEach((j, k) => { if (l[k] >= cut) for (let c = 0; c < 3; c++) ch[c].push(d[j + c]) })
    return ch.map((v) => v.sort((a, b) => a - b)[v.length >> 1])
  }
  const po = paperOf(orig), pn = paperOf(out)
  const gain = po.map((v, c) => Math.max(0.85, Math.min(1.15, v / Math.max(1, pn[c]))))
  for (const j of idx) for (let c = 0; c < 3; c++) out[j + c] = Math.max(0, Math.min(255, Math.round(out[j + c] * gain[c])))
}
