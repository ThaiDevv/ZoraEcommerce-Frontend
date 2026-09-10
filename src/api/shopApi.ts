import axiosClient from './axiosClient'

export interface ShopProfile {
  id: number
  name: string
  description?: string
  logoUrl: string
  bannerUrl?: string
  rating: number
  ratingCount?: number
  totalProducts: number
  totalFollowers: number
  followingCount?: number
  responseRate: string
  responseTime: string
  joinedTime: string
  isMall: boolean
  isOfficial: boolean
  location: string
  categories: { id: string; label: string; count?: number }[]
  vouchers: { code: string; discount: string; minSpend: string; expiry: string }[]
}

export const SHOPS_DATABASE: Record<number, ShopProfile> = {
  1: {
    id: 1,
    name: 'Shop Official Vietnam (Đã Cập Nhật)',
    description: 'Gian hàng công nghệ cao cấp phân phối chính hãng Apple, ASUS ROG, NuPhy và các thiết bị di động hàng đầu. Cam kết 100% nguyên seal chính hãng, bảo hành điện tử toàn quốc, hỗ trợ 1 đổi 1 trong 30 ngày nếu phát sinh lỗi từ nhà sản xuất.',
    logoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200',
    bannerUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1600&auto=format&fit=crop&q=80',
    rating: 4.9,
    ratingCount: 5210,
    totalProducts: 4,
    totalFollowers: 128500,
    followingCount: 8,
    responseRate: '99%',
    responseTime: 'Trong vài phút',
    joinedTime: '3 Năm Trước',
    isMall: true,
    isOfficial: true,
    location: 'TP. Hồ Chí Minh',
    categories: [
      { id: 'all', label: 'Tất Cả Sản Phẩm' },
      { id: 'apple', label: 'Apple & iPhone' },
      { id: 'laptop', label: 'Laptop Gaming' },
      { id: 'watch', label: 'Đồng Hồ Thông Minh' },
      { id: 'keyboard', label: 'Bàn Phím Cơ' },
    ],
    vouchers: [
      { code: 'TECH100K', discount: 'Giảm 100k', minSpend: 'Đơn Tối Thiểu 2.000.000₫', expiry: 'HSD: 30.09.2026' },
      { code: 'TECH500K', discount: 'Giảm 500k', minSpend: 'Đơn Tối Thiểu 10.000.000₫', expiry: 'HSD: 30.09.2026' },
      { code: 'ZORAFREESHIP', discount: 'Freeship Xtra', minSpend: 'Miễn phí vận chuyển toàn quốc', expiry: 'HSD: 31.12.2026' },
    ],
  },
  2: {
    id: 2,
    name: 'Shopee Fashion World',
    description: 'Thương hiệu thời trang nam nữ phong cách năng động, trẻ trung dẫn đầu xu hướng Gen Z. Chuyên cung cấp áo thun cotton 100%, giày sneaker thể thao, trang phục dạo phố chất lượng cao với giá thành cạnh tranh nhất.',
    logoUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=200',
    bannerUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&auto=format&fit=crop&q=80',
    rating: 4.8,
    ratingCount: 6810,
    totalProducts: 2,
    totalFollowers: 86400,
    followingCount: 12,
    responseRate: '98%',
    responseTime: 'Trong 15 phút',
    joinedTime: '2 Năm Trước',
    isMall: true,
    isOfficial: true,
    location: 'Hà Nội',
    categories: [
      { id: 'all', label: 'Tất Cả Sản Phẩm' },
      { id: 'áo', label: 'Áo Thun & Polo' },
      { id: 'giày', label: 'Giày Thể Thao Sneaker' },
      { id: 'cotton', label: 'Trang Phục Cotton' },
    ],
    vouchers: [
      { code: 'FASHION15K', discount: 'Giảm 15k', minSpend: 'Đơn Tối Thiểu 150.000₫', expiry: 'HSD: 20.09.2026' },
      { code: 'FASHION30K', discount: 'Giảm 30k', minSpend: 'Đơn Tối Thiểu 300.000₫', expiry: 'HSD: 25.09.2026' },
      { code: 'FASHION10P', discount: 'Giảm 10%', minSpend: 'Giảm tối đa 50k - Đơn từ 200k', expiry: 'HSD: 30.09.2026' },
    ],
  },
  3: {
    id: 3,
    name: 'Electro Mini Superstore',
    description: 'Chuyên cung cấp đồ điện tử âm thanh Hi-Res, tai nghe chống ồn Sony và thiết bị gia dụng nhà bếp tự động DeLonghi chính hãng Châu Âu. Cam kết chuẩn chất lượng quốc tế, hỗ trợ kỹ thuật và bảo hành chính hãng.',
    logoUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200',
    bannerUrl: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=1600&auto=format&fit=crop&q=80',
    rating: 4.8,
    ratingCount: 810,
    totalProducts: 2,
    totalFollowers: 34200,
    followingCount: 5,
    responseRate: '99%',
    responseTime: 'Trong vài phút',
    joinedTime: '1 Năm Trước',
    isMall: true,
    isOfficial: true,
    location: 'TP. Hồ Chí Minh',
    categories: [
      { id: 'all', label: 'Tất Cả Sản Phẩm' },
      { id: 'tai nghe', label: 'Tai Nghe & Âm Thanh' },
      { id: 'cà phê', label: 'Máy Pha Cà Phê' },
      { id: 'sony', label: 'Thiết Bị Sony' },
    ],
    vouchers: [
      { code: 'ELECTRO50K', discount: 'Giảm 50k', minSpend: 'Đơn Tối Thiểu 1.000.000₫', expiry: 'HSD: 30.09.2026' },
      { code: 'ELECTRO200K', discount: 'Giảm 200k', minSpend: 'Đơn Tối Thiểu 4.000.000₫', expiry: 'HSD: 30.09.2026' },
      { code: 'FREESHIPXTRA', discount: 'Freeship Xtra', minSpend: 'Miễn phí vận chuyển toàn quốc', expiry: 'HSD: 31.12.2026' },
    ],
  },
  4: {
    id: 4,
    name: 'TechShop',
    description: 'Chuyên smartphone quốc tế zin nguyên bản, iPhone likenew và phụ kiện công nghệ chất lượng với giá tốt nhất thị trường. Kiểm tra máy kỹ càng trước khi giao hàng.',
    logoUrl: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=200',
    bannerUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1600&auto=format&fit=crop&q=80',
    rating: 4.7,
    ratingCount: 120,
    totalProducts: 1,
    totalFollowers: 1200,
    followingCount: 2,
    responseRate: '95%',
    responseTime: 'Trong 30 phút',
    joinedTime: '6 Tháng Trước',
    isMall: false,
    isOfficial: false,
    location: 'Hà Nội',
    categories: [
      { id: 'all', label: 'Tất Cả Sản Phẩm' },
      { id: 'iphone', label: 'Điện Thoại iPhone' },
      { id: 'promax', label: 'Dòng Pro Max' },
    ],
    vouchers: [
      { code: 'TECHSHOP20K', discount: 'Giảm 20k', minSpend: 'Đơn Tối Thiểu 200.000₫', expiry: 'HSD: 30.09.2026' },
    ],
  },
}

export const isProductFromShop = (productShopName: string | undefined, shop: ShopProfile): boolean => {
  if (!productShopName) return false
  const pName = productShopName.toLowerCase().trim()
  const sName = shop.name.toLowerCase().trim()

  if (pName === sName) return true
  if (pName.includes(sName) || sName.includes(pName)) return true

  if (shop.id === 1 && (pName.includes('official') || pName.includes('vietnam'))) return true
  if (shop.id === 2 && (pName.includes('fashion') || pName.includes('shopee'))) return true
  if (shop.id === 3 && (pName.includes('electro') || pName.includes('superstore'))) return true
  if (shop.id === 4 && (pName.includes('techshop') || pName.includes('tech'))) return true

  return false
}

export const shopApi = {
  getShopById: async (id: number): Promise<ShopProfile> => {
    try {
      const res = await axiosClient.get<any, any>(`/shops/${id}`)
      if (res && (res.name || res.id)) {
        const defaultProfile = SHOPS_DATABASE[id] || SHOPS_DATABASE[1]
        return {
          ...defaultProfile,
          id: res.id || id,
          name: res.name || defaultProfile.name,
          description: res.description || defaultProfile.description,
          logoUrl: res.logoUrl || defaultProfile.logoUrl,
          bannerUrl: res.bannerUrl || defaultProfile.bannerUrl,
          rating: res.rating || defaultProfile.rating,
          totalProducts: res.totalProducts || defaultProfile.totalProducts,
          totalFollowers: res.totalFollowers || defaultProfile.totalFollowers,
        }
      }
      return SHOPS_DATABASE[id] || SHOPS_DATABASE[1]
    } catch {
      return SHOPS_DATABASE[id] || SHOPS_DATABASE[1]
    }
  },
}
