import React, { createContext, useContext, useState, useEffect } from 'react'
import { apiService } from '../services/apiService';
import { authService} from '../services/authService';

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      // Decode JWT to get user info
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        if (payload.exp * 1000 > Date.now()) {
          setUser({
            id: payload.userId,
            email: payload.email,
            role: payload.role,
            customerId: payload.customerId
          })
        } else {
          localStorage.removeItem('token')
        }
      } catch (error) {
        localStorage.removeItem('token')
      }
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    try {
      const response = await authService.login(email, password)
      console.log('Login API success:', response.data)
  
      const { token, user } = response.data
  
      if (!token || !user) {
        console.error('Missing token or user in response:', response.data)
        return { success: false, error: 'Invalid login response from server.' }
      }
  
      localStorage.setItem('token', token)
      setUser(user)
  
      return { success: true }
    } catch (error) {
      console.error("Full login error:", error.response?.data || error.message)
      return {
        success: false,
        error: error.response?.data?.error || 'Login failed'
      }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  const isAdmin = () => {
    return user?.role === 'Admin'
  }

  const value = {
    user,
    login,
    logout,
    isAdmin,
    loading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export default {
  useAuth,
  AuthProvider,
  AuthContext
}