import Hero from '../components/Hero'
import PromoStrip from '../components/PromoStrip'
import GenderFinder from '../components/GenderFinder'
import Catalog from '../components/Catalog'
import GiftGuide from '../components/GiftGuide'
import WhyGentlemanCo from '../components/WhyGentlemanCo'
import ProductSpotlight from '../components/ProductSpotlight'
import CraftProcess from '../components/CraftProcess'
import Experience from '../components/Experience'
import FindYourFragrance from '../components/FindYourFragrance'
import BrandSection from '../components/BrandSection'
import Location from '../components/Location'
import Socials from '../components/Socials'
import FinalCTA from '../components/FinalCTA'
import useDocumentMeta from '../hooks/useDocumentMeta'

export default function HomePage() {
  // Título, descripción y canonical del inicio (el canonical ya no va fijo en
  // index.html, porque ese archivo se sirve también para cada ficha).
  useDocumentMeta({ path: '/' })
  return (
    <>
      <Hero />
      <PromoStrip />
      <GenderFinder />
      <Catalog />
      <GiftGuide />
      <WhyGentlemanCo />
      <ProductSpotlight />
      <CraftProcess />
      <Experience />
      <FindYourFragrance />
      <BrandSection />
      <Location />
      <Socials />
      <FinalCTA />
    </>
  )
}
