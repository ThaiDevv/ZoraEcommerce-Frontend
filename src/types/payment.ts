export type PaymentMethod = 'COD' | 'BANK_TRANSFER' | 'VNPAY' | 'MOMO' | 'CREDIT_CARD'

export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED'

export interface PaymentResponse {
  transactionId: string
  paymentMethod: PaymentMethod
  amount: number
  provider: string
  status: PaymentStatus
  paidAt: string | null
}
