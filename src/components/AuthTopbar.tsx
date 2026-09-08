import { Link } from 'react-router-dom'
import { HelpCircle, ArrowLeft, PhoneCall } from 'lucide-react'
import ZoraLogo from './ZoraLogo'

interface AuthTopbarProps {
  title: 'Đăng nhập' | 'Đăng ký'
}

export default function AuthTopbar({ title }: AuthTopbarProps) {
  return (
    <header className="sticky top-0 z-30 w-full bg-white/85 backdrop-blur-md border-b border-slate-200/70 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Brand Logo + Divider + Page Context Title */}
        <div className="flex items-center gap-3.5 sm:gap-4">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-white border border-slate-200/60 shadow-xs flex items-center justify-center p-1 shrink-0 transition-transform group-hover:scale-105">
              <ZoraLogo className="w-full h-full" />
            </div>
            <span className="text-xl font-bold text-[#0F172A] tracking-tight font-['Plus_Jakarta_Sans']">
              Zora<span className="text-[#ee4d2d]">Ecommerce</span>
            </span>
          </Link>

          <div className="h-5 w-[1.5px] bg-slate-200 rounded-full" />

          <h1 className="text-base sm:text-lg font-semibold text-slate-800 tracking-tight font-['Plus_Jakarta_Sans']">
            {title}
          </h1>
        </div>

        {/* Right: Quick Help, Hotline & Back to Home */}
        <div className="flex items-center gap-4 sm:gap-6 text-xs">
          <a
            href="tel:0559826016"
            className="hidden sm:inline-flex items-center gap-1.5 text-slate-500 hover:text-[#ee4d2d] transition-colors"
          >
            <PhoneCall className="w-3.5 h-3.5 text-[#ee4d2d]" />
            <span>Hotline: <strong className="font-semibold text-slate-700">0559 826 016</strong></span>
          </a>

          <a
            href="https://www.facebook.com/zanthei61"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[#ee4d2d] hover:underline font-medium"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Bạn cần trợ giúp?</span>
          </a>

          <Link
            to="/"
            className="hidden md:inline-flex items-center gap-1 text-slate-500 hover:text-slate-800 transition-colors font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Về trang chủ</span>
          </Link>
        </div>
      </div>
    </header>
  )
}
