import { SESSION_NAME } from '@/lib/utils/contants'
import {
  getSessionCookie,
  removeSessionCookie,
  setSessionCookie,
} from '@/lib/utils/cookies-secure'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'

export interface AuthContext {
  isAuthenticated: boolean
  login: (token: string) => Promise<void>
  logout: () => Promise<void>
  token: string | null
}

const AuthContext = createContext<AuthContext | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(
    getSessionCookie(SESSION_NAME)
  )
  const isAuthenticated = !!token

  const logout = useCallback(async () => {
    removeSessionCookie(SESSION_NAME)
    setToken(null)
  }, [])

  const login = useCallback(async (token: string) => {
    setSessionCookie(SESSION_NAME, token)
    setToken(token)
  }, [])

  useEffect(() => {
    setToken(getSessionCookie(SESSION_NAME))
  }, [])

  return (
    <AuthContext.Provider value={{ isAuthenticated, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
