import axios from 'axios'
import type { AxiosError, InternalAxiosRequestConfig } from 'axios'

const baseURL = import.meta.env.VITE_API_BASE_URL || '/api/v1'

export const axiosClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
})

// Request interceptor: add auth token
axiosClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token')
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor: extract response body & handle error messages
axiosClient.interceptors.response.use(
  (response) => {
    const resData = response.data
    // Spring Boot ApiResponse puts actual payload in 'body' or 'data'
    if (resData && typeof resData === 'object') {
      if ('body' in resData && resData.body !== undefined) {
        return resData.body
      }
      if ('data' in resData && resData.data !== undefined) {
        return resData.data
      }
    }
    return resData
  },
  (error: AxiosError<any>) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
      sessionStorage.removeItem('token')
    }

    const data = error.response?.data
    let message = 'Có lỗi xảy ra khi kết nối máy chủ'

    if (data) {
      if (Array.isArray(data.details) && data.details.length > 0) {
        message = data.details.join('. ')
      } else if (data.message) {
        message = data.message
      } else if (data.error) {
        message = data.error
      }
    } else if (error.message) {
      message = error.message
    }

    // Friendly translations for common backend messages
    if (message === 'Email already exists') {
      message = 'Email này đã tồn tại trong hệ thống. Vui lòng đăng nhập hoặc sử dụng email khác.'
    } else if (message === 'Phone already exists') {
      message = 'Số điện thoại này đã được đăng ký cho tài khoản khác.'
    } else if (
      message === 'Wrong email or password' ||
      message === 'Bad credentials' ||
      message === 'Unauthorized access: Wrong email or password'
    ) {
      message = 'Email hoặc mật khẩu không chính xác.'
    } else if (message === 'Network Error' || error.code === 'ERR_NETWORK') {
      message = 'Không thể kết nối đến máy chủ backend (http://localhost:8080). Hãy đảm bảo ứng dụng backend đã khởi động.'
    }

    return Promise.reject(new Error(message))
  }
)

export default axiosClient
