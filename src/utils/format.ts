export const formatPrice = (price: number | string | undefined | null): string => {
  if (price === undefined || price === null || isNaN(Number(price))) return '0 ₫'
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(Number(price))
}

export const formatDate = (dateString?: string): string => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export const getOrderStatusBadge = (status: string) => {
  switch (status) {
    case 'PENDING':
      return { label: 'Chờ xử lý', color: 'bg-amber-100 text-amber-800 border-amber-300' }
    case 'CONFIRMED':
      return { label: 'Đã xác nhận', color: 'bg-blue-100 text-blue-800 border-blue-300' }
    case 'SHIPPING':
      return { label: 'Đang giao hàng', color: 'bg-indigo-100 text-indigo-800 border-indigo-300' }
    case 'DELIVERED':
    case 'COMPLETED':
      return { label: 'Giao thành công', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' }
    case 'CANCELLED':
      return { label: 'Đã hủy', color: 'bg-rose-100 text-rose-800 border-rose-300' }
    default:
      return { label: status, color: 'bg-slate-100 text-slate-800 border-slate-300' }
  }
}
