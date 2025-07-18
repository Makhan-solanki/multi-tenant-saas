// src/services/ticketApi.js
import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002'

// Create axios instance with interceptors
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')  // ✅ Corrected key
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login' // Assumes shell app handles /login
    }
    return Promise.reject(error)
  }
)

export const ticketApi = {
  // Get all tickets for the authenticated user's tenant
  // getTickets: async (filters = {}) => {
  //   try {
  //     const params = new URLSearchParams()

  //     if (filters.status) params.append('status', filters.status)
  //     if (filters.priority) params.append('priority', filters.priority)
  //     if (filters.search) params.append('search', filters.search)
  //     if (filters.page) params.append('page', filters.page)
  //     if (filters.limit) params.append('limit', filters.limit)
  //     if (filters.sortBy) params.append('sortBy', filters.sortBy)
  //     if (filters.sortOrder) params.append('sortOrder', filters.sortOrder)

  //     const response = await apiClient.get(`/api/tickets?${params.toString()}`)
  //     return response.data
  //   } catch (error) {
  //     throw new Error(error.response?.data?.message || 'Failed to fetch tickets')
  //   }
  // },
  getTickets: async (query = '') => {
    const url = query ? `/api/tickets?${query}` : '/api/tickets';
    const response = await apiClient.get(url);
    return response.data; // ✅ ensure this returns { tickets: [...] }
  },

  getTicketById: async (ticketId) => {
    try {
      const response = await apiClient.get(`/api/tickets/${ticketId}`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch ticket by ID')
    }
  },

  createTicket: async (ticketData) => {
    try {
      const response = await apiClient.post('/api/tickets', ticketData)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create ticket')
    }
  },

  updateTicket: async (ticketId, updateData) => {
    try {
      const response = await apiClient.put(`/api/tickets/${ticketId}`, updateData)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update ticket')
    }
  },

  deleteTicket: async (ticketId) => {
    try {
      await apiClient.delete(`/api/tickets/${ticketId}`)
      return { success: true }
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete ticket')
    }
  },

  getTicketStats: async () => {
    try {
      const response = await apiClient.get('/api/tickets/stats/overview')
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch ticket stats')
    }
  },

  updateTicketStatus: async (ticketId, status) => {
    try {
      const response = await apiClient.patch(`/api/tickets/${ticketId}/status`, { status })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update ticket status')
    }
  },

  addComment: async (ticketId, commentData) => {
    try {
      const response = await apiClient.post(`/api/tickets/${ticketId}/comments`, commentData)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to add comment')
    }
  }
}
