import { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import LoadingScreen from './components/LoadingScreen'
import Header from './components/Header'
import HalloweenPromoBar from './components/HalloweenPromoBar'
import ScrollManager from './components/ScrollManager'
import Footer from './components/Footer'
import WhatsAppButton from './components/WhatsAppButton'
import CartDrawer from './components/CartDrawer'
import CheckoutModal from './components/CheckoutModal'
import CartToast from './components/CartToast'
import { CartProvider } from './context/CartContext'
import HomePage from './pages/HomePage'
import ProductDetailPage from './pages/ProductDetailPage'
import usePauseOffscreen from './hooks/usePauseOffscreen'

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  usePauseOffscreen()

  return (
    <CartProvider>
      <LoadingScreen />
      <ScrollManager />
      <HalloweenPromoBar />
      <Header open={menuOpen} onOpenChange={setMenuOpen} />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/perfumes/:slug" element={<ProductDetailPage />} />
          {/* Cualquier otra dirección (enlaces viejos o mal escritos) vuelve al inicio. */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
      <WhatsAppButton hideForMenu={menuOpen} />
      <CartDrawer />
      <CheckoutModal />
      <CartToast />
    </CartProvider>
  )
}
