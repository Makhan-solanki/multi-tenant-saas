import React from 'react'
import { useAuth } from '../../contexts/AuthContext'

const AdminRoute = ({ children }) => {
  const { user, isAdmin } = useAuth()

  if (!isAdmin()) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access this area.</p>
        </div>
      </div>
    )
  }

  return children
}

export default AdminRoute