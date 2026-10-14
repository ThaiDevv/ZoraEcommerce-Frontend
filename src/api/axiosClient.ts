import axios from 'axios'
import type { AxiosError, InternalAxiosRequestConfig } from 'axios'
import { clearAuth, getAccessToken, getRefreshToken, hasSession, saveTokens } from '../utils/authStorage'

const baseURL = import.meta.env.VITE_API_BASE_URL || '/api/v1'

const defaultConfig = {
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
}

export const axiosClient = axios.create(defaultConfig)

// Bare client for the refresh call so it never goes through the 401 interceptor below
const refreshClient = axios.create(defaultConfig)

// Endpoints where a 401 means bad credentials, not an expired access token
const NO_REFRESH_PATHS = ['/auth/login', '/auth/register', '/auth/refresh-token', '/auth/logout']

const SESSION_EXPIRED_MESSAGE = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.'

interface RetriableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean
}

class SessionExpiredError extends Error {}

let refreshPromise: Promise<string> | null = null

const extractBearer = (config: InternalAxiosRequestConfig): string | null => {
  const header = config.headers?.Authorization
  return typeof header === 'string' && header.startsWith('Bearer ') ? header.slice(7) : null
}

// Serialise refreshes across tabs: the backend rotates refresh tokens and treats reuse of
// a rotated token as theft (revoking every session), so two tabs must never refresh at once.
const withRefreshLock = <T>(task: () => Promise<T>): Promise<T> => {
  if (typeof navigator !== 'undefined' && navigator.locks?.request) {
    return navigator.locks.request('zora-auth-refresh', task)
  }
  return task()
}

const requestNewAccessToken = async (): Promise<string> => {
  const refreshToken = getRefreshToken()
  if (!refreshToken) {
    throw new SessionExpiredError(SESSION_EXPIRED_MESSAGE)
  }
  try {
    const res = await refreshClient.post('/auth/refresh-token', { refreshToken })
    const payload = res.data?.body ?? res.data?.data ?? res.data
    if (!payload?.accessToken) {
      throw new SessionExpiredError(SESSION_EXPIRED_MESSAGE)
    }
    saveTokens({ accessToken: payload.accessToken, refreshToken: payload.refreshToken })
    return payload.accessToken
  } catch (err) {
    const status = (err as AxiosError).response?.status
    // Network errors / 5xx keep the session so a backend hiccup does not log the user out
    if (err instanceof SessionExpiredError || status === 400 || status === 401 || status === 403) {
      throw new SessionExpiredError(SESSION_EXPIRED_MESSAGE)
    }
    throw err
  }
}

export const refreshAccessToken = (failedToken?: string | null): Promise<string> => {
  if (!refreshPromise) {
    refreshPromise = withRefreshLock(async () => {
      // Another request or tab may already have rotated the tokens while we waited
      const current = getAccessToken()
      if (current && failedToken && current !== failedToken) {
        return current
      }
      return requestNewAccessToken()
    }).finally(() => {
      refreshPromise = null
    })
  }
  return refreshPromise
}

const handleSessionExpired = () => {
  clearAuth()
  window.dispatchEvent(new Event('authChanged'))
  window.dispatchEvent(new Event('cartUpdated'))

  if (!window.location.pathname.startsWith('/login')) {
    const redirect = encodeURIComponent(window.location.pathname + window.location.search)
    window.location.assign(`/login?redirect=${redirect}`)
  }
}

const toFriendlyError = (error: AxiosError<any>): Error => {
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
  } else if (message === "Old password doesn't match") {
    message = 'Mật khẩu hiện tại không chính xác.'
  } else if (message === 'Network Error' || error.code === 'ERR_NETWORK') {
    message = 'Không thể kết nối đến máy chủ backend (http://localhost:8080). Hãy đảm bảo ứng dụng backend đã khởi động.'
  }

  return new Error(message)
}

// Request interceptor: add auth token
axiosClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken()
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor: extract response body, refresh expired access tokens & handle error messages
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
  async (error: AxiosError<any>) => {
    const original = error.config as RetriableRequestConfig | undefined
    const isRefreshable =
      error.response?.status === 401 &&
      !!original &&
      !original._retry &&
      hasSession() &&
      !NO_REFRESH_PATHS.some((path) => original.url?.startsWith(path))

    if (!isRefreshable || !original) {
      return Promise.reject(toFriendlyError(error))
    }

    // Retry only once: if the retried call is still 401 (e.g. wrong old password),
    // the session itself is fine and the error is passed through as-is.
    original._retry = true
    try {
      const newToken = await refreshAccessToken(extractBearer(original))
      original.headers.Authorization = `Bearer ${newToken}`
      return axiosClient(original)
    } catch (refreshError) {
      if (refreshError instanceof SessionExpiredError) {
        handleSessionExpired()
        return Promise.reject(refreshError)
      }
      return Promise.reject(toFriendlyError(refreshError as AxiosError<any>))
    }
  }
)

export default axiosClient
