// Sube src/../dist a la carpeta public_html del hosting Hostinger por FTP.
// Credenciales vienen SOLO de variables de entorno (nunca hardcodeadas ni
// commiteadas): FTP_HOST, FTP_USER, FTP_PASSWORD, FTP_PORT (opcional, 21),
// FTP_TARGET_DIR (opcional, default /public_html).
//
// OJO: en una cuenta Hostinger que hospeda varios dominios (plan Premium+),
// "/public_html" en la raiz del FTP NO es el docroot del dominio — ese vive
// en "/domains/<dominio>/public_html". Confirmar la ruta real en el File
// Manager antes de asumir la raiz.
//
// Uso:
//   FTP_HOST=... FTP_USER=... FTP_PASSWORD=... FTP_TARGET_DIR=/domains/gentlemanparfum.com/public_html node scripts/deploy-hostinger.mjs
import { Client } from 'basic-ftp'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const DIST = path.join(ROOT, 'dist')

const host = process.env.FTP_HOST
const user = process.env.FTP_USER
const password = process.env.FTP_PASSWORD
const port = Number(process.env.FTP_PORT || 21)
const targetDir = process.env.FTP_TARGET_DIR || '/public_html'

if (!host || !user || !password) {
  console.error('Faltan variables de entorno: FTP_HOST, FTP_USER, FTP_PASSWORD son obligatorias.')
  process.exit(1)
}

const client = new Client(30000)
client.ftp.verbose = false

async function run() {
  try {
    await client.access({ host, user, password, port, secure: false })
    console.log('Conectado a', host)
    await client.ensureDir(targetDir)
    console.log('Subiendo', DIST, '->', targetDir, '...')
    let uploaded = 0
    client.trackProgress((info) => {
      uploaded++
      if (uploaded % 25 === 0) console.log(uploaded, 'archivos subidos...')
    })
    await client.uploadFromDir(DIST, targetDir)
    client.trackProgress()
    console.log('Listo. Subida completa.')
  } catch (err) {
    console.error('Error durante la subida:', err)
    process.exit(1)
  } finally {
    client.close()
  }
}

run()
