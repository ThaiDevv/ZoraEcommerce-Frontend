import { Link } from "react-router-dom"
import { Flame, ChevronRight, TrendingUp } from "lucide-react"

// Pure Mock Data for Top Search Products (Tính năng mock hoàn toàn theo yêu cầu)
const MOCK_TOP_SEARCH_PRODUCTS = [
  {
    id: 1,
    rank: 1,
    name: "Áo Thun Nam Cổ Tròn Cotton 100% Co Giãn 4 Chiều Basic",
    sales: "Bán 68.2k+ / tháng",
    price: "159.000₫",
    image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=400&auto=format&fit=crop&q=80",
    badgeColor: "bg-gradient-to-r from-amber-400 to-amber-600 text-white shadow-amber-500/20",
  },
  {
    id: 2,
    rank: 2,
    name: "Tai Nghe Không Dây Bluetooth 5.3 Chống Ồn ENC Pro",
    sales: "Bán 45.1k+ / tháng",
    price: "389.000₫",
    image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&auto=format&fit=crop&q=80",
    badgeColor: "bg-gradient-to-r from-slate-400 to-slate-600 text-white shadow-slate-500/20",
  },
  {
    id: 3,
    rank: 3,
    name: "Kem Chống Nắng Kiềm Dầu Nâng Tông Tự Nhiên 50ml",
    sales: "Bán 39.4k+ / tháng",
    price: "265.000₫",
    image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&auto=format&fit=crop&q=80",
    badgeColor: "bg-gradient-to-r from-amber-600 to-orange-700 text-white shadow-orange-500/20",
  },
  {
    id: 4,
    rank: 4,
    name: "Nồi Chiên Không Dầu Điện Tử 6.5L Đa Năng Cao Cấp",
    sales: "Bán 28.7k+ / tháng",
    price: "890.000₫",
    image: "https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=400&auto=format&fit=crop&q=80",
    badgeColor: "bg-slate-800 text-white",
  },
  {
    id: 5,
    rank: 5,
    name: "Giày Sneaker Unisex Cổ Thấp Phong Cách Trẻ Trung Năng Động",
    sales: "Bán 24.3k+ / tháng",
    price: "310.000₫",
    image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&auto=format&fit=crop&q=80",
    badgeColor: "bg-slate-800 text-white",
  },
  {
    id: 6,
    rank: 6,
    name: "Bàn Phím Cơ Không Dây 3 Chế Độ Kết Nối RGB Hot-swap",
    sales: "Bán 19.8k+ / tháng",
    price: "580.000₫",
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&auto=format&fit=crop&q=80",
    badgeColor: "bg-slate-800 text-white",
  },
]

export default function TopSearchSection() {
  return (
    <section className="w-full py-3">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-4 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-100 text-[#ee4d2d] flex items-center justify-center">
              <Flame className="w-5 h-5 text-[#ee4d2d]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-800 tracking-tight">
                  TÌM KIẾM HÀNG ĐẦU
                </h2>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-semibold">
                  <TrendingUp className="w-3 h-3" />
                  Cập nhật liên tục
                </span>
              </div>
              <p className="text-[12px] text-slate-400">
                Các sản phẩm có lượt tìm kiếm và chọn mua nhiều nhất 24 giờ qua
              </p>
            </div>
          </div>

          <button className="text-xs font-semibold text-[#ee4d2d] hover:text-[#d93c1d] flex items-center gap-1 self-start sm:self-center transition-colors cursor-pointer group">
            <span>Xem tất cả top tìm kiếm</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* Top Search Grid (6 products on desktop, 3 on tablet, 2 on mobile) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {MOCK_TOP_SEARCH_PRODUCTS.map((product) => (
            <Link
              key={product.id}
              to={`/product/${product.id}`}
              className="group bg-white rounded-xl overflow-hidden border border-slate-200/80 hover:border-[#ee4d2d] shadow-2xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between hover:-translate-y-1 relative"
            >
              {/* TOP Rank Badge */}
              <div className="relative w-full aspect-square bg-slate-50 overflow-hidden">
                <span className={`absolute top-2 left-2 z-10 px-2 py-0.5 rounded-md text-[10px] font-black tracking-wider uppercase shadow-xs ${product.badgeColor}`}>
                  TOP {product.rank}
                </span>

                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />

                {/* Sales overlay pill */}
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-2 pt-4 text-center">
                  <p className="text-[11px] font-medium text-white line-clamp-1">
                    {product.sales}
                  </p>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-3 flex flex-col justify-between flex-1">
                <h3 className="text-[12px] font-medium text-slate-800 group-hover:text-[#ee4d2d] line-clamp-2 leading-snug transition-colors">
                  {product.name}
                </h3>

                <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-[#ee4d2d]">
                    {product.price}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400 group-hover:text-[#ee4d2d] transition-colors">
                    Mua ngay
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  )
}
