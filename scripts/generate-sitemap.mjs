// Genera public/sitemap.xml con el inicio y TODAS las fichas de producto
// (/perfumes/<id>). Corre solo antes de cada `npm run build`, así un perfume
// nuevo en src/data/products.js queda en el sitemap sin tocar nada más.
import { writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const { products } = await import(pathToFileURL(path.join(ROOT, 'src', 'data', 'products.js')).href)
const { SITE_URL } = await import(pathToFileURL(path.join(ROOT, 'src', 'data', 'site.js')).href)

const urls = [
  `  <url>\n    <loc>${SITE_URL}/</loc>\n    <changefreq>weekly</changefreq>\n    <priority>1.0</priority>\n  </url>`,
  ...products.map(
    (p) => `  <url>\n    <loc>${SITE_URL}/perfumes/${p.id}</loc>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>`
  ),
]

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`
writeFileSync(path.join(ROOT, 'public', 'sitemap.xml'), xml)
console.log(`sitemap.xml: ${urls.length} direcciones (${products.length} fichas + inicio)`)
