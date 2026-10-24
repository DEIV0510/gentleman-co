import { Component } from 'react'
import { brand, waLink } from '../data/site'

// Red de seguridad: si algún componente falla al dibujarse, en vez de dejar
// la página en blanco se muestra este aviso con la opción de recargar o de
// escribir por WhatsApp (la compra nunca queda sin salida).
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { failed: false }
  }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error, info) {
    console.error('Error al mostrar la página:', error, info?.componentStack)
  }

  render() {
    if (!this.state.failed) return this.props.children
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-night-950 px-6 text-center">
        <p className="font-display text-3xl text-cream-50">{brand.name}</p>
        <p className="mt-4 max-w-sm font-body text-sm leading-relaxed text-cream-200/80">
          Algo salió mal al mostrar la página. Recárgala o escríbenos y te atendemos por WhatsApp.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-full bg-gold-500 px-7 py-3 font-body text-xs uppercase tracking-wide text-night-950 hover:bg-gold-400"
          >
            Recargar
          </button>
          <a
            href={waLink(`Hola, ${brand.name}. Quiero hacer un pedido.`)}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-[#25D366] px-7 py-3 font-body text-xs uppercase tracking-wide text-ink-900"
          >
            Escribir por WhatsApp
          </a>
        </div>
      </div>
    )
  }
}
