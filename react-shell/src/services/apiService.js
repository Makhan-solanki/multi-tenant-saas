import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002'


// Create axios instance with interceptors
const apiClient = axios.create({
  baseURL: API_URL,
})

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor to handle auth errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login' // Redirect to login on 401
    }
    return Promise.reject(error)
  }
)
const apiService = {
  // Screens
  getScreens: async () => apiClient.get('/api/screens/me/screens'),
  getUsers: () => apiClient.get('/api/users'),
  createUser: async (userData) => {
    return await apiClient.post('/api/users', userData);
  },
  updateUser: async (id, userData) => {
    return await apiClient.put(`/api/users/${id}`, userData);
  },
  deleteUser: async (id) => {
    return await apiClient.delete(`/api/users/${id}`);
  },

  // Tickets
  getTickets: async () => apiClient.get('/api/tickets'),
  getTicketById: async (id) => apiClient.get(`/api/tickets/${id}`), // ✅ added this
  createTicket: async (ticketData) => apiClient.post('/api/tickets', ticketData),
  updateTicket: async (id, updateData) => apiClient.put(`/api/tickets/${id}`, updateData),
  deleteTicket: async (id) => apiClient.delete(`/api/tickets/${id}`),
  addComment: async (ticketId, commentData) => {
    return await apiClient.post(`/api/tickets/${ticketId}/comments`, commentData);
  },
   updateTicketStatus: async (ticketId, status) => apiClient.patch(`/api/tickets/${ticketId}/status`, { status }),

  // Users (Admin only)
  getUsers: async () => apiClient.get('/api/users'),
  createUser: async (userData) => apiClient.post('/api/users', userData),
  updateUser: async (id, userData) => apiClient.put(`/api/users/${id}`, userData),
  deleteUser: async (id) => apiClient.delete(`/api/users/${id}`),

  get: async (url) => {
    const res = await apiClient.get(url); // ✅ uses interceptor
    return res.data;
  },
  post: async (url, body) => {
    const res = await apiClient.post(url, body); // ✅
    return res.data;
  },
  put: async (url, body) => {
    try {
      const res = await apiClient.put(url, body);
      return res.data;
    } catch (err) {
      console.error('PUT request failed:', err.response?.data || err.message);
      throw err; // rethrow to preserve existing error handling
    }
  },
  delete: async (url) => {
    const res = await apiClient.delete(url); // ✅
    return res.data;
  }
};


export { apiService }