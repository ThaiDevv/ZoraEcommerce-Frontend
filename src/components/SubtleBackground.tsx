import { useState, useEffect } from "react"

export default function SubtleBackground() {
  // Parallax chuyển động nhẹ theo chuột giống hệt trang Đăng nhập
  const [pageMouse, setPageMouse] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window
      const x = (e.clientX / innerWidth - 0.5) * 2
      const y = (e.clientY / innerHeight - 0.5) * 2
      setPageMouse({
        x: Number(x.toFixed(3)),
        y: Number(y.toFixed(3)),
      })
    }

    window.addEventListener("mousemove", handleMouseMove, { passive: true })
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 select-none">
      {/* 1. Nền base xám sáng ngọc trai như trang Login */}
      <div className="absolute inset-0 bg-[#F8FAFC]" />

      {/* 2. Lưới điểm kiến trúc Blueprint Dot Grid với Breathing Mask giống Login */}
      <div
        className="absolute inset-0 opacity-[0.38] transition-opacity duration-1000"
        style={{
          backgroundImage: "radial-gradient(#94A3B8 1.1px, transparent 1.1px)",
          backgroundSize: "32px 32px",
          maskImage: "radial-gradient(ellipse 75% 75% at 50% 50%, black 30%, transparent 85%)",
          WebkitMaskImage: "radial-gradient(ellipse 75% 75% at 50% 50%, black 30%, transparent 85%)",
        }}
      />

      {/* 3. Interactive Parallax Aurora Fluid Mesh - 4 Quầng sáng Luxury giống hệt trang Login */}
      <div
        className="absolute inset-0 transition-transform duration-700 ease-out"
        style={{
          transform: `translate3d(${pageMouse.x * 25}px, ${pageMouse.y * 25}px, 0)`,
        }}
      >
        {/* Orb 1: Coral Sunrise (Góc trên bên trái) */}
        <div className="absolute -top-[15%] -left-[10%] w-[55vw] h-[55vw] max-w-[700px] max-h-[700px] rounded-full bg-gradient-to-tr from-[#ee4d2d]/25 via-orange-300/30 to-amber-200/25 blur-[110px] animate-aurora-1" />

        {/* Orb 2: Champagne Amber (Góc dưới bên phải) */}
        <div className="absolute -bottom-[20%] -right-[10%] w-[60vw] h-[60vw] max-w-[750px] max-h-[750px] rounded-full bg-gradient-to-br from-amber-200/30 via-orange-200/25 to-[#ee4d2d]/20 blur-[120px] animate-aurora-2" />

        {/* Orb 3: Soft Rose Quartz (Khu vực giữa bên phải) */}
        <div className="absolute top-[25%] -right-[5%] w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] rounded-full bg-gradient-to-bl from-rose-200/30 via-pink-100/25 to-orange-200/20 blur-[90px] animate-aurora-3" />

        {/* Orb 4: Pearl Mist (Góc dưới bên trái) */}
        <div className="absolute -bottom-[10%] left-[15%] w-[45vw] h-[45vw] max-w-[600px] max-h-[600px] rounded-full bg-gradient-to-t from-slate-200/40 via-blue-50/20 to-transparent blur-[100px] animate-ambient-pulse" />
      </div>

      {/* 4. Hạt bụi sáng lấp lánh (Luxury Micro-Sparkles) giống hệt trang Login */}
      <div className="absolute inset-0">
        {[
          { top: "18%", left: "15%", delay: "0s", dur: "6s", size: "w-1.5 h-1.5" },
          { top: "28%", left: "84%", delay: "1.5s", dur: "7.5s", size: "w-2 h-2" },
          { top: "76%", left: "18%", delay: "3s", dur: "8s", size: "w-1 h-1" },
          { top: "65%", left: "88%", delay: "2s", dur: "6.5s", size: "w-1.5 h-1.5" },
          { top: "15%", left: "72%", delay: "4s", dur: "7s", size: "w-1 h-1" },
          { top: "84%", left: "42%", delay: "0.8s", dur: "9s", size: "w-2 h-2" },
        ].map((sparkle, idx) => (
          <div
            key={idx}
            className={`absolute ${sparkle.size} rounded-full bg-[#ee4d2d]/45 blur-[0.5px] pointer-events-none`}
            style={{
              top: sparkle.top,
              left: sparkle.left,
              animation: `sparkle-float ${sparkle.dur} ease-in-out infinite`,
              animationDelay: sparkle.delay,
            }}
          />
        ))}
      </div>
    </div>
  )
}
