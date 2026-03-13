import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authAPI } from '../services/api'
import { USE_BACKEND, getCurrentUser as getLocalCurrentUser } from '../utils/localDemo'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loading, setLoading] = useState(true)

  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem('token')
    
    if (!token) {
      setUser(null)
      setIsLoggedIn(false)
      setLoading(false)
      return
    }

    if (USE_BACKEND) {
      try {
        const { data } = await authAPI.getMe()
        const userData = data.user || data
        setUser(userData)
        setIsLoggedIn(true)
      } catch (error) {
        console.error('Erreur lors de la vérification de l\'authentification:', error)
        localStorage.removeItem('token')
        setUser(null)
        setIsLoggedIn(false)
      }
    } else {
      const localUser = getLocalCurrentUser()
      if (localUser) {
        setUser(localUser)
        setIsLoggedIn(true)
      } else {
        setUser(null)
        setIsLoggedIn(false)
      }
    }
    
    setLoading(false)
  }, [])

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  const login = useCallback((token, userData = null) => {
    localStorage.setItem('token', token)
    if (userData) {
      setUser(userData)
      setIsLoggedIn(true)
    } else {
      checkAuth()
    }
  }, [checkAuth])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    setUser(null)
    setIsLoggedIn(false)
  }, [])

  const value = {
    user,
    isLoggedIn,
    loading,
    login,
    logout,
    checkAuth,
  }

  return (
    <AuthContext.Provider value={value}>
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
