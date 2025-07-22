import axios from 'axios'

const API_URL = import.meta.env.VITE_AUTH_URL || 'http://localhost:3001'
console.log("auth service",import.meta.env.VITE_AUTH_URL);

const authService = {
  login: async (email, password) => {
    return await axios.post(`${API_URL}/api/auth/login`, { email, password }) // Added /api/ prefix
  },

  register: async (userData) => {
    return await axios.post(`${API_URL}/api/auth/register`, userData) // Added /api/ prefix
  },

  refreshToken: async () => {
    const token = localStorage.getItem('token')
    return await axios.post(`${API_URL}/api/auth/refresh`, {}, { // Added /api/ prefix
      headers: { Authorization: `Bearer ${token}` }
    })
  }
}

export { authService }