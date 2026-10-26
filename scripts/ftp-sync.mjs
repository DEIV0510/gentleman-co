import { Client } from 'basic-ftp'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// Despliegue reanudable de dist/ por FTP (Hostinger corta la conexión a veces
// a mitad de una subida de ~1700 archivos). Sube solo lo que falta o cambió
// (compara tamaño remoto), reconecta y sigue si se cae, y deja index.html
// para EL FINAL: la página publicada no cambia hasta que todos los assets
// nuevos ya están en el servidor.
//
// Uso: FTP_HOST=… FTP_USER=… FTP_PASSWORD=… [FTP_PORT=21] node scripts/ftp-sync.mjs
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DIST = path.join(__dirname, '..', 'dist')

function walk(dir, rel = '') {
  const out = []
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const r = rel ? `${rel}/${e.name}` : e.name
    if (e.isDirectory()) out.push(...walk(path.join(dir, e.name), r))
    else out.push({ rel: r, size: fs.statSync(path.join(dir, e.name)).size })
  }
  return out
}

const files = walk(DIST)
const last = files.filter((f) => f.rel === 'index.html')
const queue = [...files.filter((f) => f.rel !== 'index.html'), ...last]

const client = new Client(30000)
const remoteDirs = new Map()

async function connect() {
  client.close()
  await client.access({
    host: process.env.FTP_HOST,
    user: process.env.FTP_USER,
    password: process.env.FTP_PASSWORD,
    port: Number(process.env.FTP_PORT || 21),
    secure: false,
  })
}

async function remoteListing(dir) {
  if (remoteDirs.has(dir)) return remoteDirs.get(dir)
  let map = new Map()
  try {
    const list = await client.list('/' + dir)
    map = new Map(list.filter((f) => f.isFile).map((f) => [f.name, f.size]))
  } catch {
    // la carpeta todavía no existe
  }
  remoteDirs.set(dir, map)
  return map
}

let uploaded = 0
let skipped = 0
let i = 0
let retries = 0
// La primera conexión también puede fallar (Hostinger corta a veces): se
// reintenta igual que durante la subida, en vez de terminar con error.
for (let attempt = 1; ; attempt++) {
  try {
    await connect()
    break
  } catch (err) {
    console.log(`Conexión falló: ${err.code || err.message} — intento ${attempt}/8`)
    if (attempt >= 8) {
      console.error('No se pudo conectar al FTP; no se subió nada.')
      process.exit(1)
    }
    await new Promise((r) => setTimeout(r, 2000 * attempt))
  }
}
while (i < queue.length) {
  const f = queue[i]
  const dir = path.posix.dirname(f.rel) === '.' ? '' : path.posix.dirname(f.rel)
  const name = path.posix.basename(f.rel)
  try {
    const listing = await remoteListing(dir)
    if (listing.get(name) === f.size && f.rel !== 'index.html') {
      skipped++
    } else {
      if (dir) {
        await client.ensureDir('/' + dir)
        await client.cd('/')
      }
      await client.uploadFrom(path.join(DIST, f.rel), '/' + f.rel)
      listing.set(name, f.size)
      uploaded++
      if (uploaded % 50 === 0) console.log(`${uploaded} subidos, ${skipped} ya estaban (${i + 1}/${queue.length})`)
    }
    i++
    retries = 0
  } catch (err) {
    retries++
    console.log(`Falló ${f.rel}: ${err.code || err.message} — reintento ${retries}/8`)
    if (retries > 8) {
      console.error('Demasiados errores seguidos; se detiene sin subir index.html.')
      process.exit(1)
    }
    await new Promise((r) => setTimeout(r, 2000 * retries))
    try {
      await connect()
    } catch (e) {
      console.log('Reconexión falló:', e.code || e.message)
    }
  }
}
console.log(`Listo: ${uploaded} subidos, ${skipped} ya estaban. index.html subido al final.`)
client.close()
