import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { authApi } from '../api/endpoints'
import { TOKEN_KEY } from '../api/client'

const AuthContext = createContext(null)
const USER_KEY = 'nexus_user'

function readUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY))
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY))
  const [user, setUser] = useState(readUser)

  const saveSession = useCallback((session) => {
    localStorage.setItem(TOKEN_KEY, session.token)
    localStorage.setItem(USER_KEY, JSON.stringify(session.user))
    setToken(session.token)
    setUser(session.user)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setToken(null)
    setUser(null)
  }, [])

  // The API client fires this event on any HTTP 401
  useEffect(() => {
    window.addEventListener('auth:unauthorized', logout)
    return () => window.removeEventListener('auth:unauthorized', logout)
  }, [logout])

  const login = useCallback(async (credentials) => {
    const { data } = await authApi.login(credentials)
    saveSession(data)
    return data.user
  }, [saveSession])

  const register = useCallback(async (payload) => {
    const { data } = await authApi.register(payload)
    saveSession(data)
    return data.user
  }, [saveSession])

  const value = useMemo(
    () => ({ token, user, role: user?.role ?? null, isAuthenticated: Boolean(token), login, register, logout }),
    [token, user, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)