import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Layout from './components/Layout/Layout'
import Login from './components/Auth/Login'
import Dashboard from './components/Dashboard/Dashboard'
import ProtectedRoute from './components/Auth/ProtectedRoute'
import AdminRoute from './components/Auth/AdminRoute'
import UserManagement from './components/UserManagement/UserManagement'
import SupportCenterLoader from './components/RemoteApp/SupportCenterLoader'
import AuditLogs from './components/Admin/AuditLong'
import WebhookManager from './components/Admin/WebhookManager'
import './App.css'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Route */}
          <Route path="/login" element={<Login />} />

          {/* Authenticated routes under Layout */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            {/* Dashboard for all users */}
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />

            {/* Support center */}
            <Route path="support-center" element={<SupportCenterLoader />} />

            {/* Admin-specific routes */}
            <Route
              path="admin"
              element={
                <AdminRoute>
                  <Dashboard />
                </AdminRoute>
              }
            >
              <Route path="users" element={<UserManagement />} />
              <Route path="audit-logs" element={<AuditLogs />} /> 
              <Route path="/admin/webhooks" element={<WebhookManager />} />
            </Route>
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
