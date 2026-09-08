import { useState, useEffect } from "react"
import { ArrowUp } from "lucide-react"
import MainHeader from "../components/MainHeader"
import SubtleBackground from "../components/SubtleBackground"
import BannerSlider from "../components/BannerSlider"
import FeaturedCategories from "../components/FeaturedCategories"
import PromoBanner from "../components/PromoBanner"
import TopSearchSection from "../components/TopSearchSection"
import DailyDiscover from "../components/DailyDiscover"
import CategoryDirectory from "../components/CategoryDirectory"
import AuthFooter from "../components/AuthFooter"

export default function HomePage() {
  const [showScrollTop, setShowScrollTop] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowScrollTop(true)
      } else {
        setShowScrollTop(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] text-slate-800 antialiased relative selection:bg-orange-100 selection:text-[#ee4d2d]">
      {/* Background nhẹ nhàng, tinh tế, êm dịu cho mắt */}
      <SubtleBackground />

      {/* 1. Header with Search Bar, Suggestion Chips, Cart Logo (Sticky z-50) */}
      <div className="relative z-50">
        <MainHeader />
      </div>

      {/* Main Page Sections: Nổi bật sạch sẽ trên nền subtle background */}
      <main className="relative z-10 flex-1 space-y-3 pb-8">
        {/* 2. Hero Banner Slider + 2 Side Banners + 8 Quick Service Badges */}
        <BannerSlider />

        {/* 3. Featured Categories */}
        <FeaturedCategories />

        {/* 4. Secondary Promotional Banner (Mega Sale) */}
        <PromoBanner />

        {/* 5. Top Search Products */}
        <TopSearchSection />

        {/* 6. Daily Discover Products (Gợi ý hôm nay) */}
        <DailyDiscover />

        {/* 7. Comprehensive 5-Column Category Tree */}
        <CategoryDirectory />
      </main>

      {/* 8. Full E-Commerce Footer */}
      <div className="relative z-10">
        <AuthFooter />
      </div>

      {/* Floating Scroll-to-Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-50 w-11 h-11 rounded-full bg-white hover:bg-[#ee4d2d] text-slate-700 hover:text-white shadow-xl border border-slate-200 hover:border-[#ee4d2d] flex items-center justify-center transition-all duration-200 cursor-pointer hover:scale-110 group"
          aria-label="Cuộn lên đầu trang"
        >
          <ArrowUp className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
        </button>
      )}
    </div>
  )
}
