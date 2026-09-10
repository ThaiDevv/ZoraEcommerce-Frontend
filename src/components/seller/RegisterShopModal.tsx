import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Store, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  RefreshCw, 
  ShieldCheck, 
  Star,
  Package,
  ArrowRight
} from 'lucide-react'
import { sellerApi, type ShopResponse } from '../../api/sellerApi'
import { authApi } from '../../api/authApi'

interface RegisterShopModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: (shop: ShopResponse) => void
}

export default function RegisterShopModal({ isOpen, onClose, onSuccess }: RegisterShopModalProps) {
  const navigate = useNavigate()
  
  const [shopName, setShopName] = useState<string>('')
  const [shopDescription, setShopDescription] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState<boolean>(false)
  const [createdShop, setCreatedShop] = useState<ShopResponse | null>(null)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    const trimmedName = shopName.trim()
    if (trimmedName.length < 3) {
      setErrorMessage('Tên gian hàng cần có tối thiểu 3 ký tự.')
      return
    }
    if (trimmedName.length > 50) {
      setErrorMessage('Tên gian hàng không được vượt quá 50 ký tự.')
      return
    }

    setIsSubmitting(true)
    try {
      // 1. Call POST /api/v1/shops
      const res = await sellerApi.createShop({
        name: trimmedName,
        description: shopDescription.trim() || 'Gian hàng chính hãng phân phối sản phẩm uy tín trên ZoraShop.'
      })

      setCreatedShop(res)

      // 2. Fetch updated user profile to get upgraded SELLER role
      try {
        const updatedProfile = await authApi.getProfile()
        localStorage.setItem('user', JSON.stringify(updatedProfile))
      } catch (err) {
        console.error('Lỗi khi làm mới hồ sơ người dùng:', err)
        // Fallback: update local role
        const currentUserStr = localStorage.getItem('user')
        if (currentUserStr) {
          const userObj = JSON.parse(currentUserStr)
          userObj.role = 'ROLE_SELLER'
          localStorage.setItem('user', JSON.stringify(userObj))
        }
      }

      // 3. Save current shop to localStorage
      localStorage.setItem('current_seller_shop', JSON.stringify({
        id: res.id,
        name: res.name,
        description: res.description
      }))

      setIsSuccess(true)
      if (onSuccess) {
        onSuccess(res)
      }
    } catch (err: any) {
      console.error('Lỗi khi đăng ký mở shop:', err)
      const msg = err.response?.data?.message || err.message || 'Đăng ký mở shop thất bại. Vui lòng kiểm tra lại.'
      if (msg.includes('already has a shop') || msg.includes('đã có shop')) {
        setErrorMessage('Tài khoản này đã đăng ký mở Shop trước đó rồi. Bạn có thể truy cập ngay vào Kênh Người Bán.')
      } else {
        setErrorMessage(msg)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGoToSeller = () => {
    onClose()
    navigate('/seller/orders')
    window.location.reload()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-linear-to-r from-orange-50/50 via-white to-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#ee4d2d] text-white flex items-center justify-center shadow-xs">
              <Store className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight flex items-center gap-1.5">
                <span>Đăng Ký Mở Shop</span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-orange-100 text-[#ee4d2d] px-2 py-0.5 rounded-full">
                  Miễn Phí
                </span>
              </h3>
              <p className="text-[11px] text-slate-500">Khởi tạo gian hàng và bắt đầu bán hàng trên ZoraShop</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          {isSuccess ? (
            <div className="py-6 text-center space-y-4 animate-in fade-in zoom-in-95 duration-300">
              <div className="w-16 h-16 bg-orange-50 text-[#ee4d2d] rounded-full flex items-center justify-center mx-auto border-2 border-orange-200 shadow-xs">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-900">Chúc Mừng Bạn Đã Mở Shop Thành Công!</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Gian hàng <strong className="text-slate-800 font-bold">"{createdShop?.name}"</strong> của bạn đã sẵn sàng trên hệ thống. Tài khoản đã được nâng cấp quyền Người bán.
                </p>
              </div>

              {/* Shop Badge Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-left max-w-sm mx-auto shadow-xs">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-orange-100 border border-orange-200 flex items-center justify-center text-[#ee4d2d] font-bold text-base shrink-0">
                    <Store className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900 text-sm">{createdShop?.name}</h5>
                    <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> Trạng thái: Đang hoạt động
                    </p>
                  </div>
                </div>
                <p className="text-[11px] text-slate-600 border-t border-slate-200/60 pt-2">
                  {createdShop?.description || 'Gian hàng chính hãng phân phối sản phẩm uy tín trên ZoraShop.'}
                </p>
              </div>

              <div className="pt-3">
                <button
                  onClick={handleGoToSeller}
                  className="w-full sm:w-auto px-6 py-2.5 bg-[#ee4d2d] hover:bg-[#d73f1f] text-white font-bold text-xs rounded-lg transition-colors shadow-xs inline-flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Truy Cập Kênh Người Bán Ngay</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Shop Name Field */}
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Tên gian hàng / Shop của bạn <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  placeholder="Ví dụ: TechShop - Phụ Kiện Điện Tử Thông Minh"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#ee4d2d] focus:ring-1 focus:ring-[#ee4d2d]"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Tên hiển thị công khai tới khách hàng trên sản phẩm và trang chi tiết Shop.
                </p>
              </div>

              {/* Shop Description Field */}
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Mô tả gian hàng
                </label>
                <textarea
                  rows={3}
                  value={shopDescription}
                  onChange={(e) => setShopDescription(e.target.value)}
                  placeholder="Giới thiệu về ngành hàng kinh doanh, cam kết sản phẩm, chính sách phục vụ khách hàng..."
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#ee4d2d] focus:ring-1 focus:ring-[#ee4d2d]"
                />
              </div>

              {/* Live Preview Card */}
              <div>
                <label className="block font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#ee4d2d]" />
                  <span>Xem trước thẻ Shop của bạn</span>
                </label>
                <div className="bg-slate-50 border border-dashed border-slate-300 rounded-lg p-3.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-lg bg-orange-100 border border-orange-200 flex items-center justify-center text-[#ee4d2d] shrink-0">
                      <Store className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-slate-800 text-xs truncate max-w-[240px]">
                        {shopName.trim() || 'Tên Shop Của Bạn'}
                      </h4>
                      <p className="text-[11px] text-slate-500 truncate max-w-[280px]">
                        {shopDescription.trim() || 'Mô tả gian hàng sẽ xuất hiện tại đây...'}
                      </p>
                      <div className="flex items-center gap-3 mt-1 text-[10px] text-slate-400">
                        <span className="flex items-center gap-0.5 text-amber-500 font-semibold">
                          <Star className="w-3 h-3 fill-amber-400" /> 5.0 (Mới)
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-0.5">
                          <Package className="w-3 h-3 text-slate-400" /> 0 Sản phẩm
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className="shrink-0 text-[10px] uppercase font-bold text-[#ee4d2d] bg-orange-50 border border-orange-200 px-2 py-1 rounded">
                    Đối tác
                  </span>
                </div>
              </div>

              {/* Agreement Notice */}
              <div className="bg-orange-50/60 border border-orange-200/60 rounded-lg p-3 text-[11px] text-slate-600">
                Bằng việc ấn nút <strong>"Xác Nhận Mở Shop"</strong>, bạn đồng ý tuân thủ Chính sách bảo vệ quyền lợi người mua, tiêu chuẩn hàng chính hãng và cam kết giao hàng của sàn thương mại điện tử ZoraShop.
              </div>

              {/* Form Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  Để sau
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !shopName.trim()}
                  className="px-5 py-2 text-xs font-bold text-white bg-[#ee4d2d] hover:bg-[#d73f1f] rounded-lg transition-colors flex items-center gap-1.5 shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Store className="w-4 h-4" />
                  )}
                  <span>Xác Nhận Mở Shop</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
