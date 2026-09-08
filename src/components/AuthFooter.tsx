import { Award, Truck, RotateCcw, ShieldCheck } from 'lucide-react'

export default function AuthFooter() {
  return (
    <footer className="relative z-20 w-full bg-[#fbfbfa] text-slate-600 border-t border-slate-200/80 select-none text-xs mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        
        {/* ================= PHẦN 1: CAM KẾT DỊCH VỤ (SERVICE GUARANTEES) ================= */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pb-8 border-b border-slate-200/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center text-[#ee4d2d] shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-slate-800 text-[13px]">100% Chính hãng</p>
              <p className="text-[11px] text-slate-400">Bảo chứng nguồn gốc sản phẩm</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center text-[#ee4d2d] shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-slate-800 text-[13px]">Giao hàng hỏa tốc</p>
              <p className="text-[11px] text-slate-400">Đóng gói an toàn chuẩn VIP</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center text-[#ee4d2d] shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-slate-800 text-[13px]">Đổi trả 30 ngày</p>
              <p className="text-[11px] text-slate-400">Miễn phí thủ tục tận nhà</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center text-[#ee4d2d] shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-slate-800 text-[13px]">Bảo mật quốc tế</p>
              <p className="text-[11px] text-slate-400">Tiêu chuẩn PCI-DSS thanh toán</p>
            </div>
          </div>
        </div>

        {/* ================= PHẦN 2: 4 CỘT CHÂN TRANG CHUẨN SHOPEE ================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 pb-8 border-b border-slate-200/80">
          
          {/* Cột 1: CUSTOMER SERVICE / CHĂM SÓC KHÁCH HÀNG */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-['Plus_Jakarta_Sans']">
              CHĂM SÓC KHÁCH HÀNG
            </h3>
            <ul className="space-y-2 text-[12px] text-slate-500">
              <li>
                <a href="#help" onClick={(e) => e.preventDefault()} className="hover:text-[#ee4d2d] transition-colors">
                  Trung Tâm Trợ Giúp
                </a>
              </li>
              <li>
                <a href="#blog" onClick={(e) => e.preventDefault()} className="hover:text-[#ee4d2d] transition-colors">
                  Zora Blog
                </a>
              </li>
              <li>
                <a href="#mall" onClick={(e) => e.preventDefault()} className="hover:text-[#ee4d2d] transition-colors">
                  Zora Mall
                </a>
              </li>
              <li>
                <a href="#guide-buy" onClick={(e) => e.preventDefault()} className="hover:text-[#ee4d2d] transition-colors">
                  Hướng Dẫn Mua Hàng
                </a>
              </li>
              <li>
                <a href="#guide-sell" onClick={(e) => e.preventDefault()} className="hover:text-[#ee4d2d] transition-colors">
                  Hướng Dẫn Bán Hàng
                </a>
              </li>
              <li>
                <a href="#payment" onClick={(e) => e.preventDefault()} className="hover:text-[#ee4d2d] transition-colors">
                  Thanh Toán
                </a>
              </li>
              <li>
                <a href="#coins" onClick={(e) => e.preventDefault()} className="hover:text-[#ee4d2d] transition-colors">
                  Zora Xu (Coins)
                </a>
              </li>
              <li>
                <a href="#shipping" onClick={(e) => e.preventDefault()} className="hover:text-[#ee4d2d] transition-colors">
                  Vận Chuyển
                </a>
              </li>
              <li>
                <a href="#return" onClick={(e) => e.preventDefault()} className="hover:text-[#ee4d2d] transition-colors">
                  Trả Hàng & Hoàn Tiền
                </a>
              </li>
              <li>
                <a href="tel:0559826016" className="text-[#ee4d2d] font-semibold hover:underline">
                  Chăm Sóc Khách Hàng (0559 826 016)
                </a>
              </li>
              <li>
                <a href="#warranty" onClick={(e) => e.preventDefault()} className="hover:text-[#ee4d2d] transition-colors">
                  Chính Sách Bảo Hành
                </a>
              </li>
            </ul>
          </div>

          {/* Cột 2: ABOUT ZORA / VỀ ZORA */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-['Plus_Jakarta_Sans']">
              VỀ ZORA ECOMMERCE
            </h3>
            <ul className="space-y-2 text-[12px] text-slate-500">
              <li>
                <a href="#about" onClick={(e) => e.preventDefault()} className="hover:text-[#ee4d2d] transition-colors">
                  Giới Thiệu Về Zora Việt Nam
                </a>
              </li>
              <li>
                <a href="#careers" onClick={(e) => e.preventDefault()} className="hover:text-[#ee4d2d] transition-colors">
                  Tuyển Dụng
                </a>
              </li>
              <li>
                <a href="#terms" onClick={(e) => e.preventDefault()} className="hover:text-[#ee4d2d] transition-colors">
                  Điều Khoản Zora
                </a>
              </li>
              <li>
                <a href="#privacy" onClick={(e) => e.preventDefault()} className="hover:text-[#ee4d2d] transition-colors">
                  Chính Sách Bảo Mật
                </a>
              </li>
              <li>
                <a href="#official" onClick={(e) => e.preventDefault()} className="hover:text-[#ee4d2d] transition-colors">
                  Chính Hãng (Mall)
                </a>
              </li>
              <li>
                <a href="#seller-channel" onClick={(e) => e.preventDefault()} className="hover:text-[#ee4d2d] transition-colors">
                  Kênh Người Bán (Seller Centre)
                </a>
              </li>
              <li>
                <a href="#flash-deals" onClick={(e) => e.preventDefault()} className="hover:text-[#ee4d2d] transition-colors">
                  Flash Deals
                </a>
              </li>
              <li>
                <a href="#affiliate" onClick={(e) => e.preventDefault()} className="hover:text-[#ee4d2d] transition-colors">
                  Chương Trình Tiếp Thị Liên Kết
                </a>
              </li>
              <li>
                <a href="#media" onClick={(e) => e.preventDefault()} className="hover:text-[#ee4d2d] transition-colors">
                  Liên Hệ Truyền Thông
                </a>
              </li>
            </ul>
          </div>

          {/* Cột 3: PAYMENT & LOGISTICS / THANH TOÁN & VẬN CHUYỂN */}
          <div className="space-y-6">
            {/* Thanh toán (Payment) */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-['Plus_Jakarta_Sans']">
                THANH TOÁN (PAYMENT)
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {/* 1. VISA */}
                <div className="h-8 bg-white rounded border border-slate-200/90 shadow-2xs flex items-center justify-center p-1 hover:border-[#ee4d2d]/50 transition-colors">
                  <span className="text-[#1434CB] font-black text-xs italic tracking-wider font-sans">VISA</span>
                </div>

                {/* 2. Mastercard */}
                <div className="h-8 bg-white rounded border border-slate-200/90 shadow-2xs flex items-center justify-center p-1 hover:border-[#ee4d2d]/50 transition-colors">
                  <div className="relative flex items-center">
                    <div className="w-3.5 h-3.5 rounded-full bg-[#EB001B]" />
                    <div className="w-3.5 h-3.5 rounded-full bg-[#F79E1B] -ml-1.5 opacity-90" />
                  </div>
                </div>

                {/* 3. JCB */}
                <div className="h-8 bg-white rounded border border-slate-200/90 shadow-2xs flex items-center justify-center p-1 hover:border-[#ee4d2d]/50 transition-colors">
                  <div className="flex items-center gap-[1px]">
                    <span className="w-2.5 h-3.5 bg-[#00479d] rounded-l-[2px] flex items-center justify-center text-[6px] font-black text-white">J</span>
                    <span className="w-2.5 h-3.5 bg-[#cb002c] flex items-center justify-center text-[6px] font-black text-white">C</span>
                    <span className="w-2.5 h-3.5 bg-[#00873c] rounded-r-[2px] flex items-center justify-center text-[6px] font-black text-white">B</span>
                  </div>
                </div>

                {/* 4. American Express */}
                <div className="h-8 bg-[#016FD0] rounded border border-[#016FD0] shadow-2xs flex flex-col items-center justify-center p-0.5 hover:opacity-90 transition-opacity">
                  <span className="text-[5px] font-black text-white tracking-tight leading-none">AMERICAN</span>
                  <span className="text-[5px] font-black text-white tracking-tight leading-none">EXPRESS</span>
                </div>

                {/* 5. COD */}
                <div className="h-8 bg-white rounded border border-slate-200/90 shadow-2xs flex items-center justify-center gap-1 p-1 hover:border-[#ee4d2d]/50 transition-colors">
                  <div className="w-3 h-3 rounded bg-amber-500 text-white flex items-center justify-center text-[7px] font-bold">₫</div>
                  <span className="text-[8px] font-extrabold text-slate-800">COD</span>
                </div>

                {/* 6. Trả góp 0% */}
                <div className="h-8 bg-white rounded border border-slate-200/90 shadow-2xs flex items-center justify-center gap-1 p-1 hover:border-[#ee4d2d]/50 transition-colors">
                  <div className="leading-tight text-right">
                    <span className="text-[5px] font-bold text-slate-500 block">TRẢ GÓP</span>
                    <span className="text-[8.5px] font-black text-[#ee4d2d] -mt-1 block">0%</span>
                  </div>
                </div>

                {/* 7. SPay / ZoraPay */}
                <div className="h-8 bg-white rounded border border-slate-200/90 shadow-2xs flex items-center justify-center p-1 hover:border-[#ee4d2d]/50 transition-colors">
                  <div className="bg-[#ee4d2d] text-white px-1 py-0.5 rounded text-[7px] font-bold tracking-tight">
                    SPay
                  </div>
                </div>

                {/* 8. SPayLater */}
                <div className="h-8 bg-white rounded border border-slate-200/90 shadow-2xs flex items-center justify-center p-1 hover:border-[#ee4d2d]/50 transition-colors">
                  <span className="text-[7px] font-extrabold text-[#ee4d2d] tracking-tighter">SPayLater</span>
                </div>

                {/* 9. UnionPay */}
                <div className="h-8 bg-white rounded border border-slate-200/90 shadow-2xs flex items-center justify-center p-1 hover:border-[#ee4d2d]/50 transition-colors">
                  <div className="flex items-center -space-x-0.5">
                    <div className="w-2 h-3.5 bg-[#C8102E] rounded-xs -skew-x-12" />
                    <div className="w-2 h-3.5 bg-[#004B87] rounded-xs -skew-x-12" />
                    <div className="w-2 h-3.5 bg-[#009B77] rounded-xs -skew-x-12" />
                  </div>
                </div>
              </div>
            </div>

            {/* Vận chuyển (Logistics) */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-['Plus_Jakarta_Sans']">
                ĐƠN VỊ VẬN CHUYỂN (LOGISTICS)
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {/* 1. SPX Express */}
                <div className="h-8 bg-[#ee4d2d] rounded border border-[#ee4d2d] shadow-2xs flex items-center justify-center p-1 hover:opacity-90 transition-opacity">
                  <span className="text-white font-black italic text-[9px] tracking-tight">SPX</span>
                </div>

                {/* 2. Giao Hàng Nhanh (GHN) */}
                <div className="h-8 bg-white rounded border border-slate-200/90 shadow-2xs flex flex-col items-center justify-center p-0.5 hover:border-[#ee4d2d]/50 transition-colors">
                  <span className="text-[7px] font-black text-[#F26522] tracking-tight leading-none">GHN</span>
                  <span className="text-[4.5px] text-slate-400 font-medium">Giao Hàng Nhanh</span>
                </div>

                {/* 3. Viettel Post */}
                <div className="h-8 bg-white rounded border border-slate-200/90 shadow-2xs flex flex-col items-center justify-center p-0.5 hover:border-[#ee4d2d]/50 transition-colors">
                  <span className="text-[7px] font-bold text-[#E60000] tracking-tight leading-none">viettel</span>
                  <span className="text-[5.5px] font-medium text-slate-600">post</span>
                </div>

                {/* 4. Vietnam Post */}
                <div className="h-8 bg-white rounded border border-slate-200/90 shadow-2xs flex items-center justify-center gap-0.5 p-0.5 hover:border-[#ee4d2d]/50 transition-colors">
                  <span className="text-amber-500 text-[9px]">📯</span>
                  <span className="text-[5px] font-black text-[#003B7A] leading-tight">VIETNAM<br/>POST</span>
                </div>

                {/* 5. GrabExpress */}
                <div className="h-8 bg-white rounded border border-slate-200/90 shadow-2xs flex items-center justify-center p-0.5 hover:border-[#ee4d2d]/50 transition-colors">
                  <span className="text-[6.5px] font-bold text-[#00B14F] tracking-tight">GrabExpress</span>
                </div>

                {/* 6. be Delivery */}
                <div className="h-8 bg-[#FFDE00]/15 rounded border border-slate-200/90 shadow-2xs flex items-center justify-center p-0.5 hover:border-[#ee4d2d]/50 transition-colors">
                  <span className="text-xs font-black text-[#002D80] tracking-tight">be</span>
                </div>

                {/* 7. Ahamove */}
                <div className="h-8 bg-white rounded border border-slate-200/90 shadow-2xs flex items-center justify-center gap-0.5 p-0.5 hover:border-[#ee4d2d]/50 transition-colors">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#FA6400] text-white flex items-center justify-center text-[6px] font-bold">A</div>
                  <span className="text-[6px] font-bold text-slate-700">Ahamove</span>
                </div>

                {/* 8. BEST Express */}
                <div className="h-8 bg-white rounded border border-slate-200/90 shadow-2xs flex flex-col items-center justify-center p-0.5 hover:border-[#ee4d2d]/50 transition-colors">
                  <span className="text-[7px] font-black text-[#002855] tracking-wider leading-none">BEST</span>
                  <span className="text-[5px] font-black text-[#E31B23] tracking-tight">EXPRESS</span>
                </div>

                {/* 9. GREEN SM */}
                <div className="h-8 bg-white rounded border border-slate-200/90 shadow-2xs flex items-center justify-center gap-0.5 p-0.5 hover:border-[#ee4d2d]/50 transition-colors">
                  <span className="text-[#00A896] text-[7.5px] font-bold">✓</span>
                  <span className="text-[5.5px] font-black text-[#00A896] tracking-tight">GREEN SM</span>
                </div>
              </div>
            </div>

          </div>

          {/* Cột 4: FOLLOW US / THEO DÕI CHÚNG TÔI */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-['Plus_Jakarta_Sans']">
              THEO DÕI CHÚNG TÔI (FOLLOW US)
            </h3>
            
            <ul className="space-y-2.5 text-[12px]">
              {/* Facebook */}
              <li>
                <a
                  href="https://www.facebook.com/zanthei61"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 text-slate-600 hover:text-[#1877F2] transition-colors group font-medium"
                >
                  <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                    <svg className="w-3.5 h-3.5 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </div>
                  <span>Facebook</span>
                </a>
              </li>

              {/* Instagram */}
              <li>
                <a
                  href="https://www.facebook.com/zanthei61"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 text-slate-600 hover:text-[#E4405F] transition-colors group font-medium"
                >
                  <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-pink-50 transition-colors">
                    <svg className="w-3.5 h-3.5 text-[#E4405F]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                  </div>
                  <span>Instagram</span>
                </a>
              </li>

              {/* LinkedIn */}
              <li>
                <a
                  href="https://www.linkedin.com/in/tr%E1%BA%A7n-v%C4%83n-th%C3%A1i-089610370/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 text-slate-600 hover:text-[#0A66C2] transition-colors group font-medium"
                >
                  <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-sky-50 transition-colors">
                    <svg className="w-3.5 h-3.5 text-[#0A66C2]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.64a1.64 1.64 0 1 0 0 3.28 1.64 1.64 0 0 0 0-3.28z" />
                    </svg>
                  </div>
                  <span>LinkedIn</span>
                </a>
              </li>

              {/* GitHub */}
              <li>
                <a
                  href="https://github.com/ThaiDevv"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 text-slate-600 hover:text-slate-900 transition-colors group font-medium"
                >
                  <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-slate-200 transition-colors">
                    <svg className="w-3.5 h-3.5 text-slate-800" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                    </svg>
                  </div>
                  <span>GitHub</span>
                </a>
              </li>
            </ul>

            </div>

        </div>

        {/* ================= PHẦN 3: BẢN QUYỀN & QUỐC GIA (SHOPEE STYLE) ================= */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-2 text-[12px] text-slate-400">
          <div>
            © 2026 ZoraEcommerce. Tất cả các quyền được bảo lưu.
          </div>
          <div className="flex flex-wrap items-center justify-center gap-1 text-[11px] text-slate-500">
            <span className="font-semibold text-slate-600 mr-1">Quốc gia & Khu vực:</span>
            <span>Singapore</span>
            <span className="text-slate-300">|</span>
            <span>Indonesia</span>
            <span className="text-slate-300">|</span>
            <span>Thái Lan</span>
            <span className="text-slate-300">|</span>
            <span>Malaysia</span>
            <span className="text-slate-300">|</span>
            <span className="font-semibold text-[#ee4d2d]">Việt Nam</span>
            <span className="text-slate-300">|</span>
            <span>Philippines</span>
            <span className="text-slate-300">|</span>
            <span>Brazil</span>
            <span className="text-slate-300">|</span>
            <span>México</span>
            <span className="text-slate-300">|</span>
            <span>Đài Loan</span>
          </div>
        </div>

        {/* ================= PHẦN 4: ĐIỀU KHOẢN & PHÁP LÝ DOANH NGHIỆP ================= */}
        <div className="space-y-4 pt-4 border-t border-slate-200/60 text-center text-[11px] text-slate-400">
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-[11px] uppercase tracking-wider text-slate-500 font-medium">
            <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-[#ee4d2d] transition-colors">
              Chính sách bảo mật
            </a>
            <span className="text-slate-300">|</span>
            <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-[#ee4d2d] transition-colors">
              Quy chế hoạt động
            </a>
            <span className="text-slate-300">|</span>
            <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-[#ee4d2d] transition-colors">
              Chính sách vận chuyển
            </a>
            <span className="text-slate-300">|</span>
            <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-[#ee4d2d] transition-colors">
              Chính sách trả hàng & hoàn tiền
            </a>
            <span className="text-slate-300">|</span>
            <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-[#ee4d2d] transition-colors">
              Điều khoản dịch vụ
            </a>
          </div>

          <div className="space-y-1">
            <p className="font-medium text-slate-600">Công ty TNHH Thương Mại & Dịch Vụ Zora Ecommerce</p>
            <p>
              Địa chỉ: Tòa nhà Zora Tower, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh · Hotline:{' '}
              <a href="tel:0559826016" className="text-slate-700 font-semibold hover:text-[#ee4d2d]">
                0559 826 016
              </a>{' '}
              · Email: cskh@zora.vn
            </p>
            <p>Chịu Trách Nhiệm Quản Lý Nội Dung: Ban Giám Đốc Zora — Bản quyền thuộc về ZoraEcommerce © 2026</p>
          </div>
        </div>

      </div>
    </footer>
  )
}
