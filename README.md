# Gentleman Co

Sitio web de marca para **Gentleman Co** (perfumería inspirada de alta calidad, Ibagué, Tolima). React + Vite + Tailwind CSS, orientado 100% a conversión por WhatsApp.

> **Este proyecto es Gentleman Co** (carpeta `PROYECTOS-CLAUDE\gentleman-co`, repo
> `DEIV0510/gentleman-co`, en vivo en gentlemanparfum.com). La web nueva de **Narciso
> Parfum** es otro proyecto aparte (`PROYECTOS-CLAUDE\narciso2`, repo `DEIV0510/narciso2`):
> no mezclar cambios entre los dos.
>
> **Nota de rebranding (2026-09-18):** el negocio se llamaba "Narciso Parfum" hasta esta
> fecha — todo el historial de este README (catálogo, fotos, decisiones de contenido) es
> de esa época y sigue siendo válido tal cual, solo cambió el nombre de marca. Desde el
> 24 de octubre de 2026 todas las fotos muestran el frasco con la etiqueta "GENTLEMAN
> CO." (ver "Etiqueta Gentleman Co en todas las fotos" más abajo). Ver
> `project_gentleman_co.md` (memoria del proyecto) para el detalle completo de la
> migración.

## Desarrollo

```bash
npm install
npm run dev       # http://localhost:5264
npm run build     # build de producción en /dist
npm run optimize-images   # regenera src/assets/img a partir de source-material/
```

## Notas de contenido

- Todas las fotografías del sitio (`src/assets/img`) son recortes reales generados con `sharp` a partir de las fotografías/video originales de la marca en `source-material/` (`botella-oficial-ambiente.png`, foto real del frasco actual; `logo-oficial.png`, logo oficial real de la marca; `craft-poster-raw.jpg`, fotograma real extraído de uno de los videos de proceso). No se usó ninguna imagen genérica ni de bancos de imágenes. (`botella.png`, la foto original del frasco con tapa esférica, ya no se usa pero se deja en `source-material/` como referencia histórica.)
- La carpeta de origen (`Desktop\NARCISO`) no contenía un catálogo con nombres de fragancias individuales, precios ni categorías — solo una foto genérica del frasco insignia. Por eso el sitio presenta la marca y el frasco insignia real, y dirige cualquier consulta de catálogo/precio/disponibilidad a WhatsApp en vez de inventar datos.
- Las 4 imágenes "inspiracion*.png" de la carpeta de origen son fotografías de otras marcas de lujo (Parfums de Marly, Bond No. 9, Valentino, Tom Ford) — por decisión del cliente, **no se usaron** en el sitio.
- La carpeta también traía 3 videos reales de proceso — los 3 están en el sitio, en la sección "Hecho a mano" (`CraftProcess.jsx`), como galería con pestañas (El proceso / La fragancia / Nuestro taller), cada uno click-to-play con su propio fotograma real como poster (no autoplay, no bloquean la carga). El primero se recortó a los momentos clave (medir/mezclar y envasar, ~50s) y se comprimió de 39MB a ~2MB con `ffmpeg`; los otros dos ya eran cortos y se comprimieron a ~1.5-1.9MB cada uno. Se omitió deliberadamente el fragmento inicial del primer video que menciona el nombre de una fragancia de otra marca, para no hacer un señalamiento directo a un competidor en una web comercial permanente.
- El logo (`logo.png/webp`, `crown-mark.png/webp`, `favicon-32/180.png`) sale de `source-material/logo-oficial.png` — el logo oficial real de la marca (reemplazó a un `LOGO2.png` de menor calidad usado antes de que el cliente entregara el definitivo). Se procesa quitándole el fondo blanco original (chroma-key por luminancia en `scripts/optimize-images.mjs`, función `makeTransparent`) para que se vea limpio sobre cualquier fondo, claro u oscuro; `crown-mark` (el emblema de corona+laurel solo, sin la palabra "NARCISO") se recorta del 70% superior del logo — ese punto de corte se midió fila por fila sobre el PNG fuente para que caiga justo en el espacio entre el emblema y el texto. El logo oficial usa degradados/biseles dorados (no colores planos como el anterior), así que sus PNG/WebP se generan con paleta + compresión lossy de alta calidad en vez de lossless — mismo resultado visual, ~70% más liviano (importa especialmente en `crown-mark`, que carga en el primer paint de cada página vía la pantalla de carga).
- Número de WhatsApp: `3229282884`. Dirección: Urbanización Santa Ana, Manzana 34 Casa 2, Ibagué, Tolima.

## Catálogo (262 productos)

`src/data/products.js` es la única fuente de verdad del catálogo. Arranca con
el catálogo original — 24 fragancias "Perfumería Caballero" + 24 "Perfumería
Dama", con los nombres, precio ($60.000 COP c/u) y categoría exactos que dio
el cliente — y se amplió en agosto de 2026 (ver más abajo) con 214
fragancias adicionales (81 Caballero + 64 Dama + 69 Unisex, incluidos 3
productos reales que el cruce con la hoja de fichas completas reveló que
faltaban), mismo precio plano. **Hoy son 285 productos; 283 tienen foto
propia** (ver "Fotos individuales por producto" y "Fotos del lote de
octubre" más abajo). Los 2 agregados el 26 de octubre (Hawas Black y 1
Million Black) usan por ahora la foto genérica compartida `catalog-bottle.*`
(el frasco Gentleman recortado, `source-material/botella-gentleman.png`),
que también es el respaldo si algún día falta un archivo. Her Elixir (Burberry), que estuvo un tiempo sin foto
porque varias tomas mostraban el frasco equivocado, se resolvió el
2026-09-05 (ver "Verificación frasco↔nombre", "Lote
NARCISO_NUEVOS_CABALLEROS", "Correcciones con fotos de referencia" y
"Lote NARCISO_NUEVOS_DAMAS / UNISEX" más abajo).

### Ampliación de catálogo (agosto 2026)

El cliente compartió una hoja de cálculo con 259 referencias de códigos
(DAMA/CABALLERO/UNISEX), muchas más que el catálogo de 48 ya existente.
Alcance confirmado explícitamente por el cliente: **solo agregar lo nuevo**
(no tocar los 48 originales) con **el mismo precio plano $60.000**.

Proceso seguido, por disciplina de no inventar datos:

1. **Deduplicación** contra el catálogo existente con un script de
   coincidencia difusa por tokens (normaliza texto, compara contra productos
   del mismo género) más revisión manual de los casos límite — de 259
   referencias, 50 ya estaban en el catálogo, 2 venían sin nombre (filas
   vacías, se descartaron) y 207 eran nuevas.
2. **Verificación de marca/título real** de las 207 referencias nuevas con 11
   agentes de investigación en paralelo (WebSearch) — el texto crudo del
   cliente venía abreviado o con errores de tipeo ("CK IN2U" → Calvin Klein,
   "Escada Sorbeto Roso" → Escada Sorbetto Rosso, etc.), así que cada marca y
   título se confirmó contra fuentes reales antes de publicarse. 195 de las
   207 se confirmaron sin ambigüedad. Las otras 12 no se pudieron confirmar
   con la misma certeza (marca sin producto especificado, como "Issey
   Miyake" o "Yves Saint Laurent" solos; nombres sin match real verificable,
   como "212 Gris NYC", "Creed Silver" o "ARRURU"; o casos ambiguos entre
   variantes, como "Paris Hilton Passport") — se avisó de esto al cliente
   antes de agregarlas, y el cliente confirmó explícitamente agregarlas
   igual ("agrega todos sin importar"), así que se agregaron usando el
   producto real más representativo de esa marca/línea en cada caso (ver los
   comentarios junto a cada una en `products.js`) — nunca un dato inventado
   de cero, sino la mejor coincidencia real disponible cuando el texto del
   cliente no alcanzaba para identificar un producto único.
3. Las 207 confirmadas se agregaron como tres arreglos nuevos en
   `products.js` (`caballeroAgosto2026`, `damaAgosto2026`, `unisex`) que se
   suman por spread al arreglo `products` final — el patrón de extensión que
   ya documentaba este archivo.
4. Como el catálogo nunca había tenido productos unisex reales, se agregó
   `CATEGORIES.UNISEX` y se conectó como una tercera categoría real en
   `Catalog.jsx` (filtro), `GenderFinder.jsx` (la tarjeta "Unisex" ahora
   filtra el catálogo en vivo en vez de ir directo a WhatsApp, y su foto
   pasó de un fotograma de video desactualizado —con la tapa esférica
   vieja— a `label-detail`, el mismo recorte real y actual que ya usa la
   ficha de producto) y `FindYourFragrance.jsx` (el quiz ahora ofrece
   Hombre/Mujer/Unisex).

**6 productos con ficha completa desde el día uno (mismo mes, pedido
aparte):** el cliente pidió agregar "9 PM Rebel" (Afnan), "Hawas Ice" y
"Hawas Fire" (Rasasi), "Club de Nuit Precieux I" y "Odyssey Mandarin Sky"
(Armaf) y "Supremacy Collector's Edition" (Afnan) — esta vez dando él mismo
las notas de salida/corazón/fondo y el perfil olfativo de cada uno en el
mensaje. Se verificó marca/título/género real de cada uno con un workflow
de investigación + verificación adversarial en paralelo (11 agentes:
investigación + segunda opinión escéptica por producto) antes de agregarlos,
pero las notas olfativas en sí se usaron tal cual las dio el cliente, sin
investigarlas de nuevo ni agregar nada que él no mencionó. "Odyssey Mandarin
Sky" es un producto real DISTINTO de "Odyssey Mandarin Sky Elixir" (ya en el
catálogo, con "Elixir" en el nombre) — la versión original está clasificada
como masculina, la "Elixir" como unisex.

### Fichas de perfil olfativo completas (agosto 2026, `fragranceInfo.js`)

El cliente compartió después `Catalogo_Perfumes_Fichas_Completas_1.xlsx`: la
MISMA lista de 259 referencias de la ampliación anterior, pero esta vez con
ficha completa por perfumista/fuente verificada para cada una (familia,
notas de salida/corazón/fondo, perfil olfativo, descripción comercial,
ideal para/momento/clima, nivel de confianza y observaciones) y una segunda
hoja "Por confirmar contigo" con 53 casos ambiguos que el propio archivo ya
había resuelto con su mejor criterio, documentando el razonamiento. Con
esto, `fragranceInfo.js` pasó de cubrir 53 productos (los 47 originales +
las 6 fichas de arriba) a cubrir **259 de los 262** — solo quedan sin ficha
los 3 casos donde no se pudo usar el dato sin riesgo de inventar o
atribuir mal (ver el comentario al inicio de `fragranceInfo.js`).

Proceso: cada una de las 259 filas se cruzó por nombre/marca (coincidencia
difusa por tokens, igual que la deduplicación anterior) contra los 262
productos reales del catálogo — más de 250 coincidencias limpias — y las
notas/familia/perfil de esa fila se usaron tal cual para completar o
**reemplazar** la ficha del producto correspondiente (incluidas varias de
los 47 originales, donde el archivo traía correcciones verificadas en vivo
contra Fragrantica). Las categorías de ocasión/momento del día/estación que
usa el sitio (`occasions`/`timeOfDay`/`season`) no venían en ese formato en
el archivo — se derivaron con reglas a partir de las columnas de texto libre
"Momento"/"Clima"/"Ideal para" del archivo, con el mismo criterio orientativo
que ya aplicaba el campo `style`.

Ese cruce, además, corrigió el catálogo mismo (no solo las fichas):

- **Nombres imprecisos corregidos**, misma marca/género/precio, solo cambia
  el texto: "CH Africa" → **"CH Men Africa"** (Carolina Herrera es un
  flanker distinto, femenino, del mismo nombre — el real para hombre es
  éste); "Y" → **"La Nuit de l'Homme"** (YSL, el masculino más vendido de la
  casa — verificado por votos/reseñas en Fragrantica, no el que se había
  supuesto antes); "9PM Night Out" → **"9PM"** ("Night Out" es un subtítulo
  de marketing de revendedores, no existe como producto propio en
  Fragrantica); "Red" → **"L.12.12 Rouge"** (Lacoste, nombre técnico real,
  igual que sus hermanas ya en el catálogo "L.12.12 Blanc"/"Noir");
  "Phantom Parfum" → **"Phantom Elixir"** (Paco Rabanne — no existía
  "Phantom Parfum" como tal); marca de "Libre" corregida de la abreviatura
  "YSL" a "Yves Saint Laurent" para que coincida con el resto del catálogo
  (evitaba que el cruce automático lo confundiera con otro producto de la
  misma casa).
- **Un producto duplicado eliminado:** "Black XS L'Aphrodisiaque" (Paco
  Rabanne) no existe como producto real — dos referencias distintas del
  archivo original del cliente (`C068` y `C082`) resultaron ser el MISMO
  producto real, "Black XS L'Excès", que ya estaba bien en el catálogo bajo
  ese nombre. Se quitó la entrada duplicada/inexistente.
- **3 productos reales que faltaban, agregados:** "Sauvage Elixir" (Dior,
  hombre — un falso positivo del dedup original lo había excluido por
  parecerse demasiado a "Sauvage EDT", pero es un producto real distinto),
  "Cloud" (Ariana Grande, mujer — distinto de "Cloud Pink", ya en el
  catálogo) y **"Good Girl"** (Carolina Herrera, mujer — el best-seller
  base de la línea, distinto de sus flankers "Good Girl Blush"/"Very Good
  Girl Glam"). De paso esto resolvió la única excepción documentada desde
  el inicio del proyecto: la referencia original del cliente que se había
  dejado como **"Good Girl Glam"** (sin ficha, por no existir ese nombre
  exacto) en realidad corresponde a **"Very Good Girl Glam"** — se corrigió
  el título y ya tiene ficha completa.

La foto del frasco actual reemplazó a una foto anterior de estudio
(`botellabien.png`, ya no se usa pero se deja en `source-material/` por si
sirve de referencia) porque el cliente cambió la tapa física del frasco (de
tapa esférica a la tapa tipo rociador/pico que se ve hoy) y actualizó la
etiqueta al logo oficial. El cliente mandó **la misma foto en dos
versiones**, y el sitio usa AMBAS, cada una para lo que sirve mejor:

- **`botella-oficial.png`** — versión ya recortada por el cliente, con
  **canal alfa real** (fondo transparente de verdad, no solo visualmente
  negro). Se usa tal cual (`sharp(bottleOficialSrc).trim()`, sin ninguna
  técnica de recorte) para `catalog-bottle.*` — el frasco solo, sobre las
  tarjetas del catálogo y "también podría gustarte".
- **`botella-oficial-ambiente.png`** — la foto de ambiente original (mismo
  frasco, mostrador de madera y estantería de botellas desenfocada de
  fondo, sin recortar). Se usa para `hero-bottle.*`, `spotlight-bottle.*`,
  `label-detail.*` (los recortes reales de la ficha de producto y la
  sección "Nuestra Fragancia") y `og-image.jpg` — ahí es donde tiene
  sentido mostrar el fondo real, no un recorte transparente.

(Antes de que llegara la versión recortada, se llegó a probar tanto
flood-fill como una silueta trazada a mano sobre la foto de ambiente —
medida con un escaneo de luminancia píxel por píxel en la zona del
rociador, traslúcido/reflectante y sin borde definido — pero quedó obsoleto
en cuanto el cliente subió la versión con alfa real.) `removeStudioBackground()`
(flood-fill) queda sin uso en el script por si el cliente manda una foto de
estudio con fondo plano a futuro.

### Fotos individuales por producto (agosto 2026)

El cliente compartió `Desktop\portadas`: una foto real por cada uno de los
259 códigos de la hoja de referencias (mismo esquema D/C/UNI de las
secciones anteriores). Cada foto muestra **el mismo frasco propio real**
(el de siempre) nítido en primer plano, con el frasco de la fragancia de
diseñador en la que se inspira ese producto **desenfocado** de fondo — así
cada producto tiene una foto distinta y reconocible sin dejar de mostrar
el frasco propio real que se vende.

**Nota para el cliente/futuras sesiones:** el frasco de fondo, aunque
desenfocado, puede tener texto de marca parcialmente legible (ej. "TOM
FORD" detrás de Costa Azzurra, "Black XS L'Excès" detrás de ese producto).
Es coherente con el modelo de negocio ya establecido del sitio ("Inspirado
en [marca]" en cada ficha, nunca se vende el producto original), pero
implica mostrar el empaque real de otra marca de forma más reconocible que
solo texto — es una decisión de contenido del cliente, no una que se tomó
por su cuenta esta sesión.

Proceso:
1. **Revisión visual de las 257 fotos** (259 códigos menos 2 filas vacías)
   con un `Workflow` de 13 agentes en paralelo (~20 fotos c/u, viendo cada
   imagen con la herramienta de lectura) — criterio: frasco propio
   completo (tapa a base), sin recortes feos, nítido. Solo **1 resultó
   defectuosa** (`C054`, Issey Miyake Pour Homme: un artefacto gráfico
   borroso superpuesto) — verificada a mano, se movió a
   `Desktop\portadas\defectuosa\`. El resto se revisó también a mano por
   muestreo antes de publicar.
2. **Cruce código → producto real**: mismo esquema de coincidencia difusa
   por tokens que la ampliación de catálogo, reutilizando ese trabajo. El
   cruce reveló y corrigió un patrón de bug del propio script (empatan
   token por token dos productos del catálogo que solo se diferencian por
   una palabra tipo "Parfum"/"Elixir" — ej. "Acqua di Gio" vs "Acqua di Gio
   Parfum", "212 NYC" vs "212 Sexy Men" — el script se quedaba con el
   primero que encontraba). Se corrigió con overrides manuales para cada
   caso encontrado.
3. `scripts/optimize-product-photos.mjs` genera `src/assets/img/products/
   <product.id>.{webp,avif,jpg}` (ancho 1100px, mismos parámetros de calidad
   que el resto del sitio) para las 255 fotos buenas y mapeadas (256
   productos tienen foto real, pero dos códigos del archivo original del
   cliente — `C068`/`C082` — resultaron ser el mismo producto real, "Black
   XS L'Excès"; se usó solo una).
4. `src/data/productImages.js` resuelve `product.image` (el id del
   producto, o `'catalog-bottle'` para los que no tienen foto propia) a sus
   3 formatos con `import.meta.glob` — `ProductCard.jsx`, `CartItemRow.jsx`,
   `ProductDetailPage.jsx` (foto principal de la ficha + relacionados) y
   `FindYourFragrance.jsx` ya no importan `catalog-bottle.*` directo, todos
   pasan por esta función. `CartContext.jsx` guarda `image` en cada línea
   del carrito para que se pueda mostrar ahí también.
5. **6 productos sin foto propia** (usan `catalog-bottle` de respaldo): los
   6 que se agregaron en un pedido aparte después de que el cliente mandara
   las fotos (9 PM Rebel, Hawas Ice, Hawas Fire, Club de Nuit Precieux I,
   Supremacy Collector's Edition, Odyssey Mandarin Sky) — no tienen código
   en el archivo original de fotos. El que resultó defectuoso (`L'Eau
   d'Issey Pour Homme`, `C054`) sí recuperó foto propia en la segunda tanda
   (ver más abajo).

En la ficha de producto (`/perfumes/:slug`), la foto propia es la primera
imagen de la galería (posición "principal"); las otras 3 miniaturas siguen
siendo los recortes reales compartidos del frasco físico (`hero-bottle`,
`spotlight-bottle`, `label-detail`), iguales para todo el catálogo.

**Nota de rendimiento:** las 261 fotos se cargan con `import.meta.glob(...,
{ eager: true })`, lo que agrega ~45KB gzip al bundle de JS (son solo las
rutas de archivo, no las imágenes en sí — esas siguen cargando bajo demanda
con `loading="lazy"`). Se aceptó el tradeoff por simplicidad; si en el
futuro esto pesa demasiado, la alternativa es un glob no-eager con
resolución async y un estado de carga en cada componente.

### Segunda tanda: comparación con `Catalogo_Narciso_3.pdf` (agosto 2026)

El cliente compartió un segundo catálogo PDF (257 páginas, 1 producto por
página, mismo esquema de códigos D/C/UNI) que resultó ser **otra sesión de
fotos/render distinta** de la misma composición (frasco propio nítido +
frasco de la marca de inspiración desenfocado de fondo) — no la misma foto
reprocesada. Pidió quedarse, por cada producto, con la que se viera mejor.

Proceso:
1. **Extracción de las fotos embebidas del PDF** con `pdfimages` (Poppler,
   `C:\Users\Lenovo\AppData\Local\poppler\poppler-24.08.0\Library\bin\`) —
   evita tener que recortar pie de foto/márgenes de una página renderizada.
   Las imágenes nuevas quedan en menor resolución nativa (880×1173) que las
   de la primera tanda (procesadas a 1080×1440).
2. **Mapeo página → código → producto** con `pdftotext -layout` para leer
   el texto de cada página y extraer su código; el cruce código→producto
   reutilizó el mismo `image-product-mapping.json` de la primera tanda (257
   de 257 coincidencias limpias, sin ambigüedades nuevas).
3. **Comparación 1-a-1 con un `Workflow` de 13 agentes en paralelo** (primer
   intento): cada agente vio, para ~20 productos, la foto actual del sitio y
   la nueva del PDF lado a lado, y eligió cuál se veía mejor (composición/
   iluminación, pero también nitidez/resolución). Resultado sobre 256
   productos comparados: 185 ganó la foto nueva, 71 se quedó con la actual —
   `scripts/apply-photo-v2-winners.mjs` aplicó solo esos 185 ganadores.
4. **Corrección inmediata pedida por el cliente:** al revisar los motivos de
   cada elección del workflow, quedó claro que las dos tandas de fotos NO
   son la misma sesión con calidad pareja — son dos sets de estudio
   visualmente distintos: la tanda original tiene luz plana y fondo liso
   sin superficie definida, mientras que la del PDF usa luz direccional
   cálida y un piso con reflejo/textura. Mezclar 185 fotos de un set con 71
   del otro se veía inconsistente en el catálogo (cada tarjeta con un
   fondo/iluminación distinta), así que el cliente pidió expresamente que
   **todas** usaran el fondo del PDF, sin excepción — no la que "se viera
   mejor" producto por producto. `scripts/apply-photo-v2-all.mjs`
   (reemplaza a `apply-photo-v2-winners.mjs` para este propósito) regenera
   los 3 formatos para los 256 productos SIEMPRE desde la fuente del PDF,
   ignorando el resultado de la comparación anterior.
5. Este PDF también le dio, por primera vez, una foto propia limpia a
   `L'Eau d'Issey Pour Homme` (Issey Miyake) — el único producto que había
   quedado sin foto en la primera tanda por ser la foto defectuosa (`C054`).
   Por eso el conteo sube de 255 a **256 productos con foto propia**, y los
   "7 restantes" de la primera tanda bajan a **6 restantes**.

Los mismos matices de contenido de la nota de la primera tanda (frasco de
marca de diseñador desenfocado pero a veces parcialmente legible de fondo)
aplican igual a las fotos de esta segunda tanda, ahora usadas en las 256.

### Verificación frasco↔nombre (agosto 2026)

El cliente pidió revisar "muy detalladamente" que el frasco desenfocado de
fondo de cada foto correspondiera de verdad a la marca/fragancia que ese
producto de Narciso dice representar (no solo que las fotos se vieran bien
o tuvieran el mismo fondo, sino que el CONTENIDO fuera correcto). Se corrió
un `Workflow` en dos fases sobre los 256 productos con foto propia:

1. **Revisión** — 13 agentes en paralelo (~20 productos c/u), cada uno leyó
   cada imagen con la herramienta de lectura y juzgó, usando su propio
   conocimiento de diseños reales de frascos de perfumería, si la forma/
   color/texto legible del frasco de fondo era consistente con la marca y
   el nombre del producto. Veredictos: "coincide", "no_coincide" o
   "indeterminado" (frasco de fondo demasiado oscuro/borroso para juzgar).
2. **Verificación** — cada caso marcado "no_coincide" pasó por una segunda
   revisión independiente (otro agente, sin ver el veredicto del primero
   como verdad, solo como hipótesis a confirmar o refutar), para filtrar
   falsos positivos antes de reportarlos.

Resultado sobre 256 productos: **228 coinciden**, **20 indeterminados** (no
se puede confirmar ni descartar por la calidad de la foto, no implica
error), y **8 confirmados como mal-emparejados** (los 8 que se marcaron
"no_coincide" en la fase 1 se confirmaron en la fase 2, 0 falsos positivos):
`her-elixir-burberry-mujer`, `her-edp-burberry-mujer`,
`luna-rossa-carbon-prada-hombre`,
`myslf-le-parfum-yves-saint-laurent-hombre`,
`scandal-jean-paul-gaultier-mujer`, `yara-tous-lattafa-mujer`,
`octans-ahli-unisex` y `rehab-initio-parfums-prives-unisex` — en todos
estos el frasco de fondo real es identificablemente otro producto (ej. el
Burberry Her Elixir real es rojo/granate intenso, la foto asignada muestra
un frasco crema pálido). No se encontró un "intercambio" evidente con
ningún otro producto del catálogo (no es que la foto correcta de uno haya
quedado asignada a otro por error de nuestro cruce código→producto) — todo
indica que el problema viene del material fuente en sí (la foto que llegó
con ese código específico), no de la lógica de emparejamiento del sitio.

A pedido explícito del cliente, estos 8 se sacaron de
`PRODUCTS_WITH_OWN_PHOTO` en `products.js` y vuelven a usar la foto
genérica compartida `catalog-bottle` hasta que el cliente consiga una foto
corregida — mostrar un frasco de marca ajena identificablemente incorrecto
se consideró peor que no mostrar ninguno específico. Es reversible: en
cuanto haya una foto correcta para alguno, basta con volver a incluir su id
en el set.

### Lote `NARCISO_NUEVOS_CABALLEROS` (agosto 2026)

El cliente mandó `Desktop\NARCISO_NUEVOS_CABALLEROS`: 11 fotos, cada
archivo nombrado con el nombre del producto (ej. `Myslf le parfum.jpg`,
`Hawas ice.jpg`). Se resolvió cada nombre de archivo contra `products.js`
por título+marca (sin adivinar por slug, comparando el texto exacto para
evitar el bug de coincidencia difusa ya conocido en este proyecto — ver
más abajo). De las 11:

- **6 reemplazos** de fotos que ya existían y estaban bien (`212 Sexy Men`,
  `The Scent Elixir`, `Euphoria` hombre, `Invictus Onyx`, `Invictus
  Parfum`, `Le Male Le Parfum`) — actualización/mejora general, no una
  corrección de error.
- **5 fotos nuevas**, de las cuales:
  - 2 son la corrección de productos de la lista de 8 mal-emparejados:
    `myslf-le-parfum-yves-saint-laurent-hombre` (ahora muestra la caja gris
    con el monograma YSL clásico, consistente con el empaque real de
    MYSLF) y `luna-rossa-carbon-prada-hombre`.
  - 3 son fotos por primera vez para productos que nunca tuvieron código en
    el esquema original de fotos: `hawas-ice-rasasi-hombre`,
    `odyssey-mandarin-sky-armaf-hombre` (cuidado: distinto del ya existente
    `odyssey-mandarin-sky-elixir-armaf-unisex`, es un producto real
    diferente) y `supremacy-collector-s-edition-afnan-hombre`.

`scripts/apply-nuevos-caballeros.mjs` (nuevo, permanente) hace el
procesamiento (mismos parámetros de `sharp` que el resto: 1100px,
webp q84/avif q58/jpeg q86 mozjpeg).

### Correcciones con fotos de referencia del cliente (agosto 2026)

Después de la verificación automática (13 agentes + segunda opinión), el
cliente empezó a mandar **fotos reales de producto** (capturas de tienda
online, no fotos del sitio) para confirmar o corregir el veredicto caso
por caso — resultó ser mucho más confiable que la sola verificación por
IA, que se había equivocado en varios casos por desconocer el diseño real
de frascos muy específicos/nicho:

- **`bade-e-al-oud-honor-glory-lattafa-unisex`** — el cliente mandó la foto
  real (blanco con detalle geométrico dorado estilo art déco). La foto que
  estábamos usando mostraba un frasco NEGRO de fondo — mal-emparejamiento
  real que la verificación automática no había detectado (lo había dado
  por bueno). Se sacó del set, vuelve a la foto genérica.
- **`her-edp-burberry-mujer`**, **`scandal-jean-paul-gaultier-mujer`** y
  **`yara-tous-lattafa-mujer`** — los 3 habían sido marcados como
  mal-emparejados por la verificación automática, pero las fotos reales
  que mandó el cliente coinciden con lo que YA teníamos: la verificación
  se equivocó (ej. asumió que el frasco real de Scandal no tiene ninguna
  figura humana, cuando en realidad su tapa SÍ es una figurilla dorada en
  forma de pierna/acróbata — visible tanto en la foto real del cliente
  como en la que ya usábamos). Se restauraron los 3 al set.
- **`her-elixir-burberry-mujer`** — el cliente pidió revisar si el PDF
  tenía otra foto de esta fragancia. Solo existe una página para "Her
  Elixir" en todo el esquema de códigos (`D009`) y muestra el mismo frasco
  pálido que `her-edp-burberry-mujer` (`D010`) en vez del rojo/granate real
  del Elixir — no hay ninguna foto mejor disponible, sigue con la foto
  genérica.

**Lección:** cuando la verificación por IA y una foto real del cliente
discrepan, la foto real gana — vale la pena volver a preguntar/confirmar
con el cliente antes de dar por buena una corrección automática en casos
de frascos de nicho poco documentados, en vez de asumir que el veredicto
del agente es correcto solo porque pasó una segunda revisión.

Catálogo final tras esta ronda: **255 de 262 productos con foto propia**.

### Lote `NARCISO_NUEVOS_DAMAS` / `NARCISO_NUEVOS_UNISEX` (septiembre 2026)

El cliente pidió revisar cuáles perfumes seguían sin foto y, sin decir la
ruta, avisó que ya había agregado imágenes nuevas al Escritorio. Se
encontraron `Desktop\NARCISO_NUEVOS_DAMAS` (11 fotos) y
`Desktop\NARCISO_NUEVOS_UNISEX` (8 fotos) — hermanas de
`NARCISO_NUEVOS_CABALLEROS` que nunca se habían procesado, mismo esquema
de nombre de archivo = nombre del producto. Se resolvió cada nombre contra
`products.js` por título+marca exacto (2 casos ambiguos por nombre
genérico se resolvieron viendo la foto: `Bond_No_9_labios.jpg` → el diseño
icónico de labios de Bond No. 9 es el de **Nolita**; `CH_212_Mujer.jpg` →
el frasco cilíndrico blanco con "212" en relieve vertical es el **212 NYC**
clásico, no una de las variantes VIP).

De las 18 fotos:
- **12 reemplazos** de fotos que ya estaban bien (actualización general).
- **6 nuevas** que cierran 6 de los 7 productos que quedaban sin foto:
  `octans-ahli-unisex` (ahora sí se lee "AHLI" en la etiqueta),
  `bade-e-al-oud-honor-glory-lattafa-unisex` (blanco con detalle art déco
  dorado, coincide con la foto de referencia que mandó el cliente),
  `rehab-initio-parfums-prives-unisex` (caja blanca con el rombo de marca
  de Initio — se verificó de cerca que es empaque real, no un error;
  el frasco de vidrio adentro sigue siendo negro),
  `club-de-nuit-precieux-i-armaf-unisex`, `hawas-fire-rasasi-unisex` y
  `9-pm-rebel-afnan-unisex` (primera foto real para los 3, antes usaban la
  genérica).
- **`her-elixir-burberry-mujer` sigue sin foto propia**: la foto nueva de
  este lote es la TERCERA toma distinta que manda el proveedor y sigue
  mostrando el mismo frasco pálido de "Her EDP" en vez del rojo/granate
  real del Elixir. Con 3 renders independientes mostrando lo mismo, parece
  una limitación real del material del proveedor (probablemente solo
  tienen un prop físico de Burberry "Her", no uno específico de Elixir) —
  no algo que un cuarto reenvío vaya a arreglar solo. Se le explicó esto al
  cliente en vez de reintentar sin más.

`scripts/apply-nuevos-damas-unisex.mjs` (nuevo, permanente) procesa las 18
(excluye a propósito la de Her Elixir). Catálogo final: **261 de 262
productos con foto propia** — el único que falta es Her Elixir.

El catálogo se agrupa en tres secciones (Perfumería Caballero / Perfumería
Dama / Perfumería Unisex, cada una con su encabezado) y cada sección es un **carrusel horizontal**
(`ProductRow.jsx` + `ProductCard.jsx`, tema oscuro ink-900/gold, flecha de
scroll en desktop, swipe en móvil) — sin numeración, sin scroll vertical
largo.

Para agregar más productos (nueva carga, categoría, promo, etc.): añadir
objetos al arreglo en `products.js` — `Catalog.jsx`, `ProductCard.jsx`, el
buscador y los filtros ya funcionan sobre cualquier tamaño de catálogo sin
tocarse. Carpetas `Desktop\DMPERFUMES` y `Desktop\perfumeria` son de otros
proyectos del cliente (marcas "DM Essence" y "Perfumes Peralta") — **no se
usaron**, confirmado explícitamente por el cliente.

## Rediseño editorial (referencia externa)

El cliente pasó capturas de una tienda de perfumería ajena como **referencia de
principios de diseño** (espaciado editorial, tarjetas grandes, jerarquía
tipográfica) — explícitamente NO para copiar su marca/logo/textos/colores.
Cambios aplicados, todos con datos y fotos reales de Narciso:

- **Hero**: pasó a una tarjeta oscura de esquinas redondeadas con margen
  (estilo "inset card"), pills de beneficios reales, y una fila de confianza
  con hechos verificados (Ibagué/Tolima, atención personalizada). No se
  agregaron rating ni cifras de clientes ni envíos nacionales — no hay dato
  real que lo respalde.
- **`GenderFinder.jsx`** ("Tu fragancia empieza aquí"): 3 tarjetas grandes
  Hombre/Mujer/Unisex, cada una con su propia foto de ambiente real
  (`gender-caballero`/`gender-dama`/`gender-unisex` en
  `source-material/`, procesadas por `optimize-images.mjs`) — el cliente
  mandó estas 3 fotos específicamente para las tarjetas (antes reutilizaban
  `hero-bottle`/`spotlight-bottle`/`label-detail`, que son genéricos y se
  usan en otras secciones del sitio, así que se sacaron a assets propios
  para no pisar esos usos compartidos). Las 3 filtran el catálogo en vivo
  (evento `gentleman-co:filter-category` que Catalog.jsx escucha). Unisex era
  WhatsApp-only originalmente porque no existían productos unisex reales en
  el catálogo — pasó a filtro real en la ampliación de agosto 2026, ver
  arriba.
- **`WhyGentlemanCo.jsx`** (antes `WhyNarciso.jsx`, renombrado en el
  rebranding — "¿Por qué Gentleman Co?", reemplaza a `Benefits.jsx`):
  checklist con los 6 hechos reales confirmados por el cliente, con una
  miniatura del frasco completo (`spotlight-bottle`) al lado — antes usaba
  `label-detail` (recorte muy cerrado, solo etiqueta/tapa) y el cliente
  pidió ver el frasco completo, no solo la etiqueta.
- **`Experience.jsx`** ("Tu aroma. Tu presencia."): foto real (fotograma del
  video "La fragancia") en tarjeta oscura grande.
- **`FindYourFragrance.jsx`** ahora es un mini-quiz de 2 pasos (género +
  estilo olfativo) que muestra hasta 4 productos reales del catálogo que
  calzan. El campo `style` en `products.js` (Fresco/Dulce/Intenso/Elegante)
  es una clasificación orientativa de conocimiento público sobre estas
  fragancias reales — no una característica inventada del producto ni un dato
  provisto por el cliente.

## Fichas individuales de producto (`/perfumes/:slug`)

Cada uno de los 262 perfumes del catálogo tiene su propia página
(`src/pages/ProductDetailPage.jsx`, un solo componente reutilizable
alimentado por `product.id` vía `react-router-dom`) con breadcrumbs, galería
(reutiliza las fotos reales ya existentes del sitio), precio, CTA de
WhatsApp con mensaje específico del producto, perfil olfativo (salida /
corazón / fondo), "¿cuándo usarlo?" y una sección "también podría gustarte"
con hasta 4 productos reales relacionados (`getRelatedProducts` en
`products.js`: prioriza mismo género, luego mismo estilo/marca — nunca
mezcla Caballero/Dama ni recomienda al azar).

**Investigación real por fragancia** (`src/data/fragranceInfo.js`): familia
olfativa, notas de salida/corazón/fondo, ocasión, estación y momento del día
para **259 de los 262** productos del catálogo — los 47 originales
investigados con un workflow de 8 agentes en paralelo con WebSearch, y el
resto completado con la hoja de fichas verificadas que compartió el cliente
(ver "Fichas de perfil olfativo completas" más arriba). Reglas seguidas
estrictamente:

- **Nunca se muestra un dato que no se pudo verificar.** Solo quedan 3
  excepciones sin ficha, a propósito: **"Eros Pour Femme"** (Versace, dama —
  la fuente disponible documentaba la versión masculina "Eros", con notas
  distintas, así que no se usó para no atribuirle la pirámide equivocada) y
  **"Vega"**/**"Arrurrú"** (Ahli y Arrurrú, unisex — ninguna de las dos
  marcas publica una pirámide olfativa real). Sus fichas no muestran
  familia/notas/ocasión y usan el texto genérico de respaldo, pero siguen
  teniendo precio, WhatsApp y productos relacionados normalmente. (La
  excepción original del proyecto, "Good Girl Glam", ya se resolvió — ver
  "Fichas de perfil olfativo completas" más arriba.)
- **Nunca se afirma una duración exacta** ("dura 12 horas") — no se incluyó
  ningún dato de rendimiento/duración por marca por no encontrarse fuentes
  confiables y consistentes entre sí.
- **"Inspirado en [marca]" en todas partes**, nunca se implica que Narciso
  vende el producto original — el texto de descripción, los `<meta>` y el
  JSON-LD describen siempre el perfil de la fragancia en la que Narciso se
  inspira, no el producto de la marca original. No se usa ningún logo de
  marca ajena.
- El campo `profile` ("¿A qué huele?") de cada ficha es un texto corto
  escrito a partir de las notas investigadas — no una plantilla genérica
  repetida: cada una de las 47 fichas tiene su propia redacción.

**SEO por página** (`src/hooks/useDocumentMeta.js`, sin dependencias): título,
meta description, Open Graph, canonical y JSON-LD (`schema.org/Product`) se
generan automáticamente a partir de los datos del producto y se limpian al
salir de la página. Es una solución client-side (esta es una SPA, no
SSR/prerender) — funciona para compartir enlaces y para crawlers que
ejecutan JS; si en el futuro se necesita SEO a nivel de servidor habría que
migrar a Next.js o añadir prerender.

`vercel.json` incluye un rewrite catch-all a `index.html` para que
`/perfumes/<slug>` funcione al entrar directo o recargar (necesario para
cualquier host estático con `react-router-dom` en modo `BrowserRouter`).

## Carrito de compras y checkout

`src/context/CartContext.jsx` es el estado global del carrito (React
Context + `useReducer`, sin librerías externas), persistido en
`localStorage` (`narciso-cart-v1`) con una bandera `hydrated` para evitar
que StrictMode borre el carrito guardado al montar dos veces en desarrollo
(ver [[feedback_carrito_localstorage_strictmode]]). Se agrega desde la
tarjeta del catálogo (`ProductCard.jsx`) o la ficha individual
(`ProductDetailPage.jsx`) — ambas mantienen intacto el botón directo de
"Comprar por WhatsApp" ya existente; el carrito es una vía adicional, no un
reemplazo.

- **`CartDrawer.jsx`** — panel lateral desde la derecha (overlay +
  `backdrop-blur`, trampa de foco, Escape para cerrar, igual que
  `ProductModal.jsx`). Estado vacío ilustrado con botón a `/#catalogo`.
- **`CartItemRow.jsx`** — selector de cantidad, subtotal en vivo, y
  eliminación (manual o automática al llegar a 0) con una animación de
  salida antes de quitar la línea.
- **`CheckoutModal.jsx`** — formulario (nombre, teléfono, ciudad,
  dirección, barrio, indicaciones, método de pago) con validación de
  campos obligatorios y resumen del pedido.
- **`data/cart.js`** (`buildOrderMessage`) — arma el mensaje estructurado
  de WhatsApp al confirmar; se abre `wa.me/3229282884` y el carrito se
  vacía tras el envío.
- **Tamaños/presentaciones**: la arquitectura ya soporta `product.sizes`
  (cada producto podría tener 30/50/100 ML a precios distintos como
  líneas separadas en el carrito), pero como los productos reales de hoy
  venden una sola presentación a $60.000, no se inventó ningún selector de
  tallas — sencillamente no aparece hasta que el cliente tenga tallas
  reales que cargar en `products.js`.

## Edición Halloween (octubre 2026)

Transformación puramente visual de toda la ambientación. **No cambia
contenido ni funcionalidad**: catálogo, precios, notas, categorías, botones,
carrito, checkout, WhatsApp, Addi y métodos de pago son los mismos. Solo
cambian los rótulos de campaña (`data/campaign.js`, `halloweenCopy`), que
antes decían "San Valentín".

**Segunda versión (6 de octubre, "mucho más evidente")**: la primera quedó
demasiado sutil; ahora Halloween se reconoce en los primeros segundos sin
dejar de ser perfumería premium.

- **Interruptor**: `HALLOWEEN_ACTIVE` en `src/data/campaign.js`. En `false`
  desaparecen la escena nocturna del hero (vuelve la foto del mostrador),
  luna, murciélagos, arañas, telarañas, velas, calabazas, niebla, brasas,
  separadores, la barra superior, `GiftGuide`, los rótulos y el banner HTML
  de la promo (vuelve la imagen original del cliente).
- **Paleta** (`tailwind.config.js`): negro `#080808` / carbón `#151515`
  (`night`), dorado `#C9A45C` / `#E8C77A` (`gold`), crema `#EDE5D5`
  (`cream`), naranja Halloween `#FF6A00` / ámbar `#C85A00` (`ember`) y
  borgoña `#4A0D16` (`wine`). El naranja es acento (luces, CTA clave), no
  fondo. `addi` = azul de marca de Addi, solo para su distintivo.
- **Tipografía**: se mantienen Playfair Display + Jost; los rótulos
  "Halloween Edition" usan **Grenze Gotisch** (gótica sutil) recortada con
  `text=` en Google Fonts (~11 KB).
- **Dónde va cada cosa**: barra superior negra con calabaza/luna/murciélago
  encima del header; header con luz naranja, polvo dorado, lunas entre
  enlaces y telarañas en las esquinas (≥1400 px); **hero** con escena
  cinematográfica (frasco real recortado del catálogo sobre mesa negra,
  luna de cosecha, rama, murciélagos, velas, calabaza tallada, niebla,
  brasas, destello en la tapa, barrido de luz al entrar y paralaje);
  banners lado a lado (`PromoStrip`) con la promo 3×$130.000 recompuesta en
  HTML (misma información, escena nocturna) y el de Addi ambientado por
  encima sin tocar la pieza; categorías con arco gótico y noche propia
  (Hombre fuego/humo, Mujer borgoña/rosas/velas, Unisex luna); tarjetas de
  producto con foco de vela, filo naranja, mini icono por categoría y
  telaraña en una de cada tres; separadores temáticos entre secciones
  (`SectionDivider`: araña, luna, calabaza, vela, calavera, murciélago,
  rosa); producto destacado como "mansión" (muro de piedra, arco gótico,
  esquineras doradas, repisa de madera negra y velas); murciélagos que
  cruzan el fondo una vez al llegar a ciertas secciones; FinalCTA con luna
  y calabazas; footer con niebla, polvo dorado y calavera en medallón;
  carrito y checkout negros con detalles naranja/dorado.
- **Código**: clases `.hw-*` en `src/index.css`; `HalloweenFx.jsx`
  (brasas, polvo, humo, niebla, grano, llama, rótulo gótico),
  `HalloweenArt.jsx` (luna, murciélagos, bandada, araña, telaraña,
  calabazas, rama, vela, rosa, destello — SVG/CSS estáticos),
  `SectionDivider.jsx`, `HalloweenPromoBar.jsx`. Niebla:
  `src/assets/img/fog.webp` (12 KB, repetible en x) generada con
  `scripts/generate-fog.mjs`.
- **Rendimiento**: sin librerías nuevas; todo el movimiento es
  `transform`/`opacity`, las capas se montan al verse
  (`hooks/useInView.js`) y todo queda quieto con `prefers-reduced-motion`.
  Ojo: React escucha `animationiteration` en la raíz y con eso Chrome
  despierta al hilo principal en **cada vuelta** de una animación infinita
  (3 aleteos de 0,42 s = ~50 recálculos de estilo/s). Por eso las
  animaciones infinitas tienen vueltas largas (varios aleteos/parpadeos por
  ciclo de keyframes) y `hooks/usePauseOffscreen.js` pausa las de las
  secciones lejos de la pantalla (`[data-hw-idle]`); también la marquesina
  de la barra superior, que lejos del viewport Chrome animaba en el hilo
  principal (~125 recálculos/s al llegar al footer, ya pasaba en la v1).
  Medido con la CPU 4× más lenta (ms/s de hilo principal en reposo, v1 →
  v2): móvil arriba 156 → 318 (recálculos 9,2 → 8,9), producto destacado
  198 → 125, footer 988 → 305; escritorio arriba 163 → 369, producto
  destacado 276 → 153, footer 299 → 304. En el build de producción, móvil
  arriba: 171 ms/s. LCP sin scroll (build local): frasco del hero ~1,1 s en
  escritorio/tablet, titular en móvil; la niebla, el grano y la textura de
  la luna van como `mask-image` sobre color (las imágenes de fondo
  decorativas competían por el LCP). CLS ≤ 0,005, sin desbordes de 360 a
  1920 px y, con `prefers-reduced-motion`, ninguna animación corriendo.
- Las fotos de producto no se tocaron (el frasco del hero es la misma foto
  recortada que usan las tarjetas del catálogo).

## Banners y opción de compra con Addi (6 de octubre de 2026)

- **Banners más pequeños**: la promo y el banner de Addi iban a todo el
  ancho (~725 px de alto cada uno en escritorio); ahora `PromoStrip` los
  pone lado a lado desde 640 px (~532 × 355 px cada uno) y apilados en
  móvil. `BannerCard` sirve una versión de 960 px (`*-960.*`, generadas con
  `scripts/optimize-banners.mjs` desde `source-material/`) y la original de
  1536 px solo a pantallas retina (`srcSet`/`sizes`).
- **Addi al comprar**: además del checkout, cada punto de compra ofrece
  pagar con Addi (`AddiOption.jsx`): línea "Hasta 3 cuotas con Addi" en
  cada tarjeta del catálogo, botón en la ficha de producto y en el modal de
  la fragancia insignia, nota en el carrito y, en el checkout, la opción
  Addi con "Hasta 3 cuotas · 0% de interés". Todo abre WhatsApp con el
  mensaje listo (producto, presentación, precio y "pagar con Addi"); el
  pedido del checkout sigue diciendo `Método de pago: Addi`. Datos de Addi
  tomados del banner oficial del cliente (hasta 3 cuotas, 0% de interés).

### Lote de 17 fragancias (6 de octubre de 2026)

Lista informal del cliente verificada contra Fragrantica y la web de cada
marca (6 agentes en paralelo), con ficha completa en `fragranceInfo.js`:
12 en Caballero, 2 en Dama y 3 en Unisex (catálogo: 283 productos). "Cloud"
de Ariana Grande ya existía y no se duplicó. "Faraón ramses" se tomó como
Bharara Pharaoh Ramesses **I** (existe también la II) y el frasco que mandó
el cliente lo confirma; "The Most Wanted" como la Eau de Parfum Intense
(2021), coherente con el frasco negro mate que mandaron. Queda por confirmar
con el cliente: Emeer, Cedrat Boisé y Vulcan Baie figuran como unisex en
Fragrantica pero se dejaron en la sección que pidió.

### Fotos del lote de octubre (10 de octubre de 2026)

Hasta esta fecha los 17 usaban la foto genérica. El material que llegó
(`Downloads\Catalogo Perfumes\Nuevos sin fondo`, versión v2 del 7 de
octubre) trae el fondo dorado de estudio vacío y un recorte PNG del frasco
real de cada inspiración, **sin el frasco propio**. Como todas las demás
fotos del catálogo muestran el frasco propio nítido adelante a la derecha y
la inspiración desenfocada atrás, se compusieron así con
`scripts/compose-nuevos-octubre.mjs`:

- Fondo: `source-material/nuevos-octubre-2026/fondo-limpio.jpg` (mismo
  fondo y mismo tamaño 1114x1412 que `Desktop\NARCISO\amber.png`, de donde
  salen las medidas y posiciones).
- Inspiración (`source-material/nuevos-octubre-2026/<id>.png`): sin el halo
  claro del recorte (alfa erosionado 2 px), luz cálida con brillo ajustado a
  lo claro del frasco, desenfoque leve, reflejo en el piso y sombra.
- Frasco propio: el recorte real `source-material/botella-oficial.png` con
  la luz dorada de la escena (lado izquierdo en sombra, borde derecho
  iluminado), reflejo y sombra de contacto.
- Salida con el pipeline de siempre (1100 px; webp q84, avif q58, jpeg q86).

El recorte de "Cloud" que venía en el mismo lote no se usó: ese producto ya
tenía foto propia del cliente.

## Etiqueta Gentleman Co en todas las fotos (24 de octubre de 2026)

El cliente mandó el frasco con la etiqueta nueva ("Perfume Gentleman Co. de
Lujo.png", guardado como `source-material/botella-gentleman-original.png`):
es el mismo render y el mismo encuadre que `botella-oficial.png`, solo cambia
la etiqueta. Se reemplazó la etiqueta NARCISO en todas las imágenes:

- **266 fotos de producto del cliente** — `scripts/relabel-bottles.mjs` +
  `scripts/lib/relabel.mjs`: detecta la etiqueta vieja (rectángulo claro
  rodeado del vidrio negro y con el mismo diseño: logo arriba, nombre grande,
  líneas de texto; así no confunde cuadros o cajas del fondo), ajusta sus
  cuatro bordes (los de arriba y abajo curvos, porque el frasco es redondo),
  endereza la etiqueta nueva y la vuelve a curvar sobre esa forma, y le pasa
  la luz y el color del papel original punto a punto, más un ajuste final de
  tinte. Parte siempre de las fotos originales del commit `20b3e2c` (o de su
  fuente de mejor calidad en `source-material/`), así que se puede volver a
  correr sin degradar nada.
- **17 fotos del lote de octubre** — se recompusieron con
  `scripts/compose-nuevos-octubre.mjs` usando `source-material/botella-gentleman.png`
  (la foto nueva con la silueta transparente del recorte oficial).
- **Frasco recortado, foto de ambiente (portada, producto destacado, detalle
  de etiqueta), 3 categorías y 2 lanzamientos** — las escenas con la
  etiqueta nueva están en `source-material/gentleman/` y las usan
  `optimize-images.mjs` y `apply-launch-teasers.mjs`.

Verificación: en las 283 fotos finales la etiqueta detectada se parece más al
diseño Gentleman que al Narciso (0 marcadas), más revisión visual de todas.

**Sección "Hecho a mano" oculta** (`SHOW_PROCESS_VIDEOS = false` en
`data/site.js`): sus 3 videos muestran frascos reales con el nombre NARCISO y
un video no se puede corregir con la misma calidad. Al tener videos con el
frasco Gentleman, cambiar los archivos de `src/assets/video/` y poner `true`
(vuelven la sección y el enlace "Proceso" del menú).

## Revisión general (24 de octubre de 2026)

Auditoría completa: datos del catálogo, las 283 fichas una por una, compra
completa en escritorio y celular, anchos de 320 a 1920 px, accesibilidad con
axe-core, servidor de Hostinger y el sitio con Halloween apagado. Se
corrigió:

- **Checkout**: ya no vacía el carrito ni dice "Pedido enviado" antes de
  tiempo. Al confirmar se abre WhatsApp (si el navegador bloquea la ventana,
  se abre en la misma pestaña) y aparece el paso "Tu pedido está listo en
  WhatsApp" con "Abrir WhatsApp" y "Listo, ya lo envié" (solo eso vacía el
  carrito). Los datos del formulario se conservan al volver al carrito, y
  tocar el fondo solo cierra si el toque empezó y terminó ahí.
- **Carrito guardado**: al cargar se rehace desde el catálogo actual
  (precio vigente, productos retirados fuera, talla "Presentación" vieja →
  "50 ml", líneas repetidas unidas, cantidades inválidas fuera) y se
  sincroniza entre pestañas.
- **Promoción 3 x $130.000** (`PROMO_3X` en `data/campaign.js`): independiente
  de Halloween, sigue visible al apagar la campaña. Siempre es la pieza HTML
  con la marca Gentleman Co (la imagen original del cliente dice "NARCISO
  PARFUM"); sin campaña queda en negro y dorado. Con 3 o más fragancias el
  carrito y el pedido avisan que la promo se aplica al confirmar por
  WhatsApp ("Total sin promoción").
- **Búsqueda**: por palabras en cualquier orden y sin importar signos ni
  tildes ("dior sauvage", "l immensite"); también "caballero", "dama",
  "unisex".
- **Catálogo**: Hombre/Mujer/Unisex limpian el filtro de marca; búsqueda y
  filtros se conservan al volver de una ficha; el "Desde $55.000 COP · 50 ml"
  se calcula del catálogo.
- **Navegación** (`ScrollManager.jsx`): "Atrás" vuelve al mismo punto de la
  página; las demás navegaciones suben de inmediato; un enlace a la sección
  en la que ya se está también funciona. Direcciones inexistentes van al
  inicio (`path="*"`). Cada ficha arranca de cero (`key`), sin arrastrar la
  foto o talla de la anterior.
- **Red de seguridad**: `ErrorBoundary.jsx` muestra "Recargar / Escribir por
  WhatsApp" en vez de una página en blanco si algo falla.
- **SEO**: el canonical ya no va fijo en `index.html` (se servía igual en las
  283 fichas); lo pone `useDocumentMeta` con `SITE_URL` (`data/site.js`) en el
  inicio y en cada ficha. `sitemap.xml` se genera solo en cada build con las
  283 fichas (`scripts/generate-sitemap.mjs`). La imagen para compartir es
  `public/og-gentleman-co.jpg` (logo de Gentleman Co,
  `scripts/generate-og-image.mjs`); la anterior mostraba la etiqueta
  "NARCISO PARFUM".
- **Servidor** (`public/.htaccess`): www → sin www (301), `/default.php` de
  Hostinger → inicio, `index.html` se revalida en cada visita y el JS (que
  Hostinger sirve como `application/x-javascript`) se cachea un año.
- Accesibilidad: el botón flotante de WhatsApp va dentro de un `<aside>`
  con nombre; axe-core sin observaciones.

Halloween sigue siendo manual (decisión del usuario): para apagarlo, poner
`HALLOWEEN_ACTIVE = false` en `data/campaign.js`, compilar y subir con
`scripts/ftp-sync.mjs`. Ya se probó el sitio en ese modo: sin restos de la
campaña, sin errores ni desbordes.

## Estructura

```
src/
  components/   Header, Hero, GenderFinder, Catalog, ProductCard, ProductRow,
                WhyGentlemanCo, ProductSpotlight, ProductModal, CraftProcess,
                Experience, FindYourFragrance, BrandSection, Location,
                Socials, FinalCTA, Footer, WhatsAppButton, LoadingScreen,
                Breadcrumbs, CartDrawer, CartItemRow, CartToast, CheckoutModal,
                HalloweenFx, HalloweenArt, HalloweenPromoBar, GiftGuide,
                SectionDivider, PromoStrip, PromoBanner, AddiBanner,
                BannerCard, AddiOption, FeaturedLaunches,
                ErrorBoundary, ScrollManager
  context/CartContext.jsx  estado global del carrito (persistido en localStorage)
  pages/            HomePage, ProductDetailPage (ficha individual /perfumes/:slug)
  data/site.js      marca, WhatsApp, enlaces
  data/cart.js      buildOrderMessage (mensaje de pedido estructurado para WhatsApp)
  data/products.js  catálogo (285 productos), formatCOP, searchProducts,
                    getProductById, getRelatedProducts
  data/fragranceInfo.js  perfil olfativo real por fragancia — 282 de los 285
                    productos, ver "Fichas de perfil olfativo completas"
  data/campaign.js  interruptor y rótulos de la campaña estacional (Halloween)
  hooks/            useReveal (scroll reveal), useInView (monta efectos al ver
                    la sección), usePauseOffscreen (pausa animaciones fuera de
                    pantalla), useDocumentMeta (SEO por página)
```
