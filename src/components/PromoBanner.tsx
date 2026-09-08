import { useState, useEffect } from "react"
import { Sparkles, ArrowRight, Clock, ShieldCheck, Flame, Gift } from "lucide-react"

export default function PromoBanner() {
  // Live ticking countdown timer (mock)
  const [timeLeft, setTimeLeft] = useState({
    hours: 8,
    minutes: 42,
    seconds: 15,
  })

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 }
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: 59, seconds: 59 }
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 }
        }
        return { hours: 12, minutes: 0, seconds: 0 }
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const formatNumber = (num: number) => num.toString().padStart(2, "0")

  return (
    <section className="w-full py-2">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-2xl overflow-hidden shadow-md bg-gradient-to-r from-[#b91c1c] via-[#ee4d2d] to-[#ea580c] p-6 sm:p-8 text-white">
          
          {/* Subtle background decorative shapes */}
          <div className="absolute -right-16 -top-16 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute right-1/3 -bottom-10 w-48 h-48 bg-yellow-400/10 rounded-full blur-xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
            
            {/* Left Info */}
            <div className="space-y-3 text-center lg:text-left max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-xs font-bold uppercase tracking-wider text-yellow-300">
                <Flame className="w-3.5 h-3.5 text-yellow-300 animate-pulse" />
                <span>SIÊU ĐẠI TIỆC MUA SẮM 2026</span>
              </div>

              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight drop-shadow-sm">
                GIẢM ĐẾN 50% &middot; VOUCHER 1 TRIỆU ĐỒNG
              </h2>

              <p className="text-xs sm:text-sm text-orange-100 max-w-xl">
                Hơn 500,000+ sản phẩm hàng hiệu chính hãng đồng loạt mở bán với giá hủy diệt. Miễn phí vận chuyển toàn quốc cho đơn từ 0Đ!
              </p>

              {/* Guarantees chips */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-1 text-[11px] font-semibold text-white">
                <span className="flex items-center gap-1.5 bg-black/20 px-2.5 py-1 rounded-md">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                  100% Chính Hãng Zora Mall
                </span>
                <span className="flex items-center gap-1.5 bg-black/20 px-2.5 py-1 rounded-md">
                  <Gift className="w-3.5 h-3.5 text-yellow-300" />
                  Tặng Quà Độc Quyền
                </span>
              </div>
            </div>

            {/* Right Countdown & CTA */}
            <div className="flex flex-col items-center gap-4 bg-black/25 backdrop-blur-md p-5 rounded-xl border border-white/20 shrink-0 w-full sm:w-auto">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-yellow-300">
                <Clock className="w-3.5 h-3.5" />
                <span>KẾT THÚC TRONG</span>
              </div>

              {/* Countdown Digits */}
              <div className="flex items-center gap-2">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-lg bg-white text-slate-900 font-black text-xl flex items-center justify-center shadow-inner">
                    {formatNumber(timeLeft.hours)}
                  </div>
                  <span className="text-[9px] uppercase tracking-wider text-orange-200 mt-1">Giờ</span>
                </div>
                <span className="text-xl font-bold text-white mb-4">:</span>
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-lg bg-white text-slate-900 font-black text-xl flex items-center justify-center shadow-inner">
                    {formatNumber(timeLeft.minutes)}
                  </div>
                  <span className="text-[9px] uppercase tracking-wider text-orange-200 mt-1">Phút</span>
                </div>
                <span className="text-xl font-bold text-white mb-4">:</span>
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-lg bg-white text-[#ee4d2d] font-black text-xl flex items-center justify-center shadow-inner">
                    {formatNumber(timeLeft.seconds)}
                  </div>
                  <span className="text-[9px] uppercase tracking-wider text-orange-200 mt-1">Giây</span>
                </div>
              </div>

              {/* Action Button */}
              <button className="w-full py-2.5 px-6 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black text-xs uppercase tracking-wider rounded-lg shadow-lg hover:shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2 group">
                <Sparkles className="w-4 h-4 text-slate-900" />
                <span>SĂN DEAL NGAY</span>
                <ArrowRight className="w-4 h-4 text-slate-900 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

          </div>
        </div>
      </div>
    </section>
  )
}
