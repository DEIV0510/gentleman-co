import { formatCOP } from './products'
import { DEFAULT_SIZE_LABEL } from '../context/CartContext'
import { PROMO_3X } from './campaign'

// Gentleman Co no maneja pago contra entrega. Métodos reales del negocio —
// si se agrega otro más adelante, basta con añadirlo aquí.
export const paymentMethods = ['Transferencia bancaria', 'Addi']

// Texto de la promoción 3 x $130.000 cuando el pedido ya alcanza para un
// combo. El descuento no se calcula aquí: lo aplica el negocio al confirmar
// por WhatsApp (ver PROMO_3X en data/campaign.js).
export function promoNotice(totalUnits) {
  if (!PROMO_3X.active || totalUnits < PROMO_3X.units) return null
  return `Promoción ${PROMO_3X.units} x ${formatCOP(PROMO_3X.price)}: la aplicamos al confirmar tu pedido por WhatsApp.`
}

// Arma el mensaje estructurado de pedido para WhatsApp a partir del carrito
// y los datos del cliente. El envío no se suma al total porque se calcula
// al finalizar (no hay tarifa real conocida que mostrar sin inventarla).
export function buildOrderMessage(items, customer) {
  const lines = items.map((item) => {
    const sizeLine = item.sizeLabel && item.sizeLabel !== DEFAULT_SIZE_LABEL ? `\nPresentación: ${item.sizeLabel}` : ''
    return `${item.qty} x ${item.fullName}${sizeLine}\nPrecio: ${formatCOP(item.price)}`
  })

  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0)
  const units = items.reduce((sum, item) => sum + item.qty, 0)
  const promo = PROMO_3X.active && units >= PROMO_3X.units

  return [
    'Hola, quiero realizar el siguiente pedido en Gentleman Co:',
    '',
    'PEDIDO:',
    '',
    lines.join('\n\n'),
    '',
    `Subtotal: ${formatCOP(subtotal)}`,
    ...(promo ? [`Promoción: ${PROMO_3X.units} fragancias por ${formatCOP(PROMO_3X.price)} (por aplicar al confirmar)`] : []),
    '',
    'DATOS DEL CLIENTE:',
    '',
    `Nombre: ${customer.name}`,
    `Teléfono: ${customer.phone}`,
    `Ciudad: ${customer.city}`,
    `Dirección: ${customer.address}`,
    `Barrio: ${customer.neighborhood}`,
    `Indicaciones: ${customer.notes ? customer.notes : '—'}`,
    '',
    `Método de pago: ${customer.paymentMethod}`,
    '',
    `${promo ? 'TOTAL SIN PROMOCIÓN' : 'TOTAL DEL PEDIDO'}: ${formatCOP(subtotal)}`,
  ].join('\n')
}
