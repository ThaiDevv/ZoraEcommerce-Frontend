import { useState, useEffect, useRef } from "react"
import { 
  ChevronLeft, 
  ChevronRight, 
  Tag, 
  Truck, 
  Zap, 
  ShieldCheck, 
  Gift, 
  Smartphone, 
  Coins, 
  Clock, 
  Sparkles,
  ArrowRight
} from "lucide-react"

// Mock hero slides
const SLIDES = [
  {
    id: 1,
    title: "ĐẠI TIỆC CÔNG NGHỆ 2026",
    subtitle: "Giảm sâu đến 50% cho Flagship & Phụ kiện",
    tag: "DEAL ĐỘC QUYỀN",
    cta: "Mua Ngay",
    image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&auto=format&fit=crop&q=80",
    gradient: "from-slate-900/80 via-slate-900/40 to-transparent",
  },
  {
    id: 2,
    title: "BỘ SƯU TẬP XUÂN HÈ MỚI",
    subtitle: "Xu hướng thời trang tối giản & thanh lịch",
    tag: "NEW ARRIVAL",
    cta: "Khám Phá",
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&auto=format&fit=crop&q=80",
    gradient: "from-slate-900/80 via-slate-900/40 to-transparent",
  },
  {
    id: 3,
    title: "GIA DỤNG THÔNG MINH HIỆN ĐẠI",
    subtitle: "Tiện nghi nâng tầm chuẩn sống gia đình",
    tag: "VOUCHER 1 TRIỆU",
    cta: "Săn Voucher",
    image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=1200&auto=format&fit=crop&q=80",
    gradient: "from-slate-900/80 via-slate-900/40 to-transparent",
  },
  {
    id: 4,
    title: "MỸ PHẨM CHÍNH HÃNG ZORA MALL",
    subtitle: "Cam kết 100% auth, hoàn tiền 200% nếu giả",
    tag: "CHÍNH HÃNG 100%",
    cta: "Xem Ngay",
    image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=1200&auto=format&fit=crop&q=80",
    gradient: "from-slate-900/80 via-slate-900/40 to-transparent",
  },
]

// 8 Quick Service Icons
const QUICK_SERVICES = [
  {
    id: 1,
    title: "Zora Mall",
    desc: "Chính hãng 100%",
    icon: ShieldCheck,
    color: "bg-red-500 text-white",
  },
  {
    id: 2,
    title: "Mã Giảm Giá",
    desc: "Voucher đến 500k",
    icon: Tag,
    color: "bg-orange-500 text-white",
  },
  {
    id: 3,
    title: "Khung Giờ Săn Sale",
    desc: "Deal chớp nhoáng 1k",
    icon: Zap,
    color: "bg-amber-500 text-white",
  },
  {
    id: 4,
    title: "Freeship Đơn 0Đ",
    desc: "Toàn quốc 0 đồng",
    icon: Truck,
    color: "bg-emerald-500 text-white",
  },
  {
    id: 5,
    title: "Nạp Thẻ & Dịch Vụ",
    desc: "Hoàn xu đến 10%",
    icon: Smartphone,
    color: "bg-blue-500 text-white",
  },
  {
    id: 6,
    title: "Đơn 0Đ Mua Hết",
    desc: "Quà tặng 0 đồng",
    icon: Gift,
    color: "bg-pink-500 text-white",
  },
  {
    id: 7,
    title: "Zora Xu Thưởng",
    desc: "Điểm danh nhận xu",
    icon: Coins,
    color: "bg-yellow-500 text-white",
  },
  {
    id: 8,
    title: "Giao Hỏa Tốc 2H",
    desc: "Nhận hàng trong 2h",
    icon: Clock,
    color: "bg-indigo-500 text-white",
  },
]

export default function BannerSlider() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const slideTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Auto sliding effect (4 seconds interval)
  useEffect(() => {
    if (isHovered) {
      if (slideTimerRef.current) clearInterval(slideTimerRef.current)
      return
    }

    slideTimerRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length)
    }, 4000)

    return () => {
      if (slideTimerRef.current) clearInterval(slideTimerRef.current)
    }
  }, [isHovered])

  const goToPrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + SLIDES.length) % SLIDES.length)
  }

  const goToNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % SLIDES.length)
  }

  return (
    <section className="w-full bg-white pt-4 pb-6 border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* ================= 1. BANNERS GRID: CAROUSEL (2/3) + SIDE BANNERS (1/3) ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
          
          {/* Main Carousel (8 cols on lg) */}
          <div 
            className="relative lg:col-span-8 rounded-xl overflow-hidden shadow-sm h-[240px] sm:h-[300px] md:h-[340px] group select-none bg-slate-900"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* Slides Track */}
            <div 
              className="w-full h-full flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {SLIDES.map((slide) => (
                <div key={slide.id} className="w-full h-full shrink-0 relative">
                  <img 
                    src={slide.image} 
                    alt={slide.title}
                    className="w-full h-full object-cover"
                  />
                  {/* Gradient Overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-r ${slide.gradient} flex flex-col justify-end p-6 md:p-8`}>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#ee4d2d] text-white text-[11px] font-bold tracking-wider uppercase self-start mb-2 shadow-xs">
                      <Sparkles className="w-3 h-3" />
                      {slide.tag}
                    </span>
                    <h2 className="text-xl md:text-3xl font-black text-white tracking-tight leading-tight max-w-lg drop-shadow-sm">
                      {slide.title}
                    </h2>
                    <p className="text-xs md:text-sm text-slate-200 mt-1 max-w-md line-clamp-1">
                      {slide.subtitle}
                    </p>
                    <div className="mt-4">
                      <button className="px-4 py-2 bg-white hover:bg-[#ee4d2d] text-slate-900 hover:text-white rounded-lg text-xs font-bold tracking-wide transition-all shadow-md inline-flex items-center gap-1.5 cursor-pointer group/btn">
                        <span>{slide.cta}</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Navigation Arrows */}
            <button 
              onClick={goToPrevSlide}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-[#ee4d2d] text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 cursor-pointer backdrop-blur-xs"
              aria-label="Previous Slide"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={goToNextSlide}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-[#ee4d2d] text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 cursor-pointer backdrop-blur-xs"
              aria-label="Next Slide"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Dots Indicator */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20">
              {SLIDES.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`transition-all duration-300 rounded-full cursor-pointer ${
                    currentSlide === idx 
                      ? "w-6 h-2 bg-[#ee4d2d]" 
                      : "w-2 h-2 bg-white/60 hover:bg-white"
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>

          {/* 2 Side Banners (4 cols on lg) */}
          <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3.5">
            {/* Top Side Banner */}
            <div className="flex-1 rounded-xl overflow-hidden relative group cursor-pointer shadow-xs border border-orange-100 bg-gradient-to-br from-orange-500 to-[#ee4d2d] p-5 text-white flex flex-col justify-between min-h-[140px] sm:min-h-[160px]">
              <div className="relative z-10">
                <span className="px-2 py-0.5 rounded bg-white/20 text-[10px] font-bold tracking-wide uppercase">
                  VOUCHER XTRA
                </span>
                <h3 className="text-lg md:text-xl font-black mt-2 leading-tight">
                  GIẢM ĐẾN 50%
                </h3>
                <p className="text-xs text-orange-100 mt-1">
                  Áp dụng cho mọi đơn hàng hôm nay
                </p>
              </div>
              <div className="relative z-10 self-start mt-3">
                <span className="text-[11px] font-bold bg-white text-[#ee4d2d] px-3 py-1 rounded-md shadow-xs group-hover:bg-slate-900 group-hover:text-white transition-colors">
                  Mã: ZORAXTRA50
                </span>
              </div>
              {/* Background decorative graphic */}
              <div className="absolute -right-4 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />
              <img 
                src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=300&auto=format&fit=crop&q=80" 
                alt="Voucher Xtra"
                className="absolute right-0 bottom-0 w-28 h-28 object-contain opacity-25 group-hover:scale-105 transition-transform duration-300 pointer-events-none"
              />
            </div>

            {/* Bottom Side Banner */}
            <div className="flex-1 rounded-xl overflow-hidden relative group cursor-pointer shadow-xs border border-blue-100 bg-gradient-to-br from-slate-900 to-slate-800 p-5 text-white flex flex-col justify-between min-h-[140px] sm:min-h-[160px]">
              <div className="relative z-10">
                <span className="px-2 py-0.5 rounded bg-[#ee4d2d] text-[10px] font-bold tracking-wide uppercase">
                  FREESHIP 0Đ
                </span>
                <h3 className="text-lg md:text-xl font-black mt-2 leading-tight">
                  MIỄN PHÍ VẬN CHUYỂN
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  Đơn từ 0Đ · Giao siêu tốc toàn quốc
                </p>
              </div>
              <div className="relative z-10 self-start mt-3 flex items-center gap-1 text-[11px] font-bold text-amber-400">
                <span>Lấy Mã Ngay</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
              {/* Background decorative graphic */}
              <img 
                src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=300&auto=format&fit=crop&q=80" 
                alt="Freeship 0D"
                className="absolute right-0 bottom-0 w-28 h-28 object-contain opacity-20 group-hover:scale-105 transition-transform duration-300 pointer-events-none"
              />
            </div>
          </div>

        </div>

        {/* ================= 2. QUICK SERVICE BADGES (8 DỊCH VỤ TIỆN ÍCH) ================= */}
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 pt-3">
          {QUICK_SERVICES.map((item) => {
            const Icon = item.icon
            return (
              <div
                key={item.id}
                className="group flex flex-col items-center text-center p-2 rounded-xl hover:bg-orange-50/50 cursor-pointer transition-all duration-150"
              >
                <div className={`w-11 h-11 rounded-2xl ${item.color} flex items-center justify-center shadow-xs group-hover:-translate-y-1 transition-transform duration-200`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[12px] font-medium text-slate-700 group-hover:text-[#ee4d2d] mt-2 line-clamp-1 transition-colors">
                  {item.title}
                </span>
                <span className="text-[10px] text-slate-400 hidden sm:block mt-0.5 line-clamp-1">
                  {item.desc}
                </span>
              </div>
            )
          })}
        </div>

      </div>
    </section>
  )
}
