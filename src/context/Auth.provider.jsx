import { useState, useEffect } from 'react'
import api from '../api/axios'
import { AuthContext } from './auth.context'

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  const clearAuth = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    setUser(null)
    setIsAuthenticated(false)
  }

  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem('access_token')
      if (token) {
        try {
          const { data } = await api.get('/auth/me/')
          setUser(data)
          setIsAuthenticated(true)
        } catch {
          const refresh = localStorage.getItem('refresh_token')
          if (refresh) {
            try {
              const { data } = await api.post('/auth/token/refresh/', { refresh })
              localStorage.setItem('access_token', data.access)
              if (data.refresh) localStorage.setItem('refresh_token', data.refresh)
              const { data: u } = await api.get('/auth/me/')
              setUser(u)
              setIsAuthenticated(true)
            } catch { clearAuth() }
          } else { clearAuth() }
        }
      }
      setLoading(false)
    }
    init()
  }, [])

  const login = async (username, password) => {
    const { data } = await api.post('/auth/login/', { username, password })
    localStorage.setItem('access_token', data.access)
    localStorage.setItem('refresh_token', data.refresh)
    setUser(data.user)
    setIsAuthenticated(true)
    return data
  }

  const register = async (userData) => {
    const { data } = await api.post('/auth/register/', userData)
    localStorage.setItem('access_token', data.access)
    localStorage.setItem('refresh_token', data.refresh)
    setUser(data.user)
    setIsAuthenticated(true)
    return data
  }

const logout = async () => {
  const refresh = localStorage.getItem('refresh_token')
  if (refresh) {
    try {
      await api.post('/auth/logout/', { refresh })
    } catch (error) {
      // Логаут на сервере не критичен: даже если он упал, 
      // мы всё равно очищаем локальную сессию
      console.warn('Серверный логаут не выполнен:', error?.message)
    }
  }
  clearAuth()
}
  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}