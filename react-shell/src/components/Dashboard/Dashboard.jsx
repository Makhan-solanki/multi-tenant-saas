import React from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { Ticket, Users, TrendingUp, Clock } from 'lucide-react'
import { Outlet, useLocation } from 'react-router-dom'
import { Navigate } from 'react-router-dom';


const Dashboard = () => {
  const { user } = useAuth()
  const location = useLocation()

  if (user.role !== 'Admin') {
    return <Navigate to="/support-center" replace />
  }

  // Only show stats if at /admin
  const isRootDashboard = ['/admin', '/', '/dashboard'].includes(location.pathname)

  const stats = [
    {
      title: 'Active Tickets',
      value: '12',
      icon: Ticket,
      color: 'bg-blue-500',
      change: '+2 from last week'
    },
    {
      title: 'Total Users',
      value: '48',
      icon: Users,
      color: 'bg-green-500',
      change: '+5 from last week'
    },
    {
      title: 'Resolution Rate',
      value: '94%',
      icon: TrendingUp,
      color: 'bg-purple-500',
      change: '+1.2% from last week'
    },
    {
      title: 'Avg Response Time',
      value: '2.4h',
      icon: Clock,
      color: 'bg-yellow-500',
      change: '-0.3h from last week'
    }
  ]

  return (
    <div className="space-y-6 p-6">
      {isRootDashboard && (
        <>
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <div className="text-sm text-gray-500">
              Welcome back, {user?.email}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <div key={stat.title} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`${stat.color} rounded-full p-3`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">{stat.change}</p>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Support Tickets</h2>
              <p className="text-sm text-gray-600">Manage and track support requests</p>
            </div>
            <div id="remote-app-container" data-testid="remote-app-container" className="p-6">
              <div className="text-center text-gray-500">
                <Ticket className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>Click "Support Tickets" in the sidebar to load the ticket management system</p>
              </div>
            </div>
          </div>
        </>
      )}
      <Outlet />
    </div>
  )
}

export default Dashboard
