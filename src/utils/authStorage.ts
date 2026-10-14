const ACCESS_TOKEN_KEY = 'token'
const REFRESH_TOKEN_KEY = 'refreshToken'
const SESSION_KEYS = [ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, 'user', 'username', 'current_seller_shop']

export interface AuthTokens {
  accessToken: string
  refreshToken?: string | null
}

const read = (key: string): string | null =>
  localStorage.getItem(key) || sessionStorage.getItem(key)

// "Remember me" sessions live in localStorage, others in sessionStorage.
// When unspecified, keep writing to whichever storage currently holds the session.
const isRememberedSession = (): boolean =>
  !!localStorage.getItem(REFRESH_TOKEN_KEY) ||
  !!localStorage.getItem(ACCESS_TOKEN_KEY) ||
  !sessionStorage.getItem(ACCESS_TOKEN_KEY)

export const getAccessToken = (): string | null => read(ACCESS_TOKEN_KEY)

export const getRefreshToken = (): string | null => read(REFRESH_TOKEN_KEY)

export const hasSession = (): boolean => !!getAccessToken() || !!getRefreshToken()

export const saveTokens = (tokens: AuthTokens, remember?: boolean): void => {
  const useLocal = remember ?? isRememberedSession()
  const target = useLocal ? localStorage : sessionStorage
  const other = useLocal ? sessionStorage : localStorage

  target.setItem(ACCESS_TOKEN_KEY, tokens.accessToken)
  if (tokens.refreshToken) {
    target.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken)
  }
  other.removeItem(ACCESS_TOKEN_KEY)
  other.removeItem(REFRESH_TOKEN_KEY)
}

export const clearAuth = (): void => {
  SESSION_KEYS.forEach((key) => {
    localStorage.removeItem(key)
    sessionStorage.removeItem(key)
  })
}
