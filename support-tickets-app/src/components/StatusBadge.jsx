// src/components/StatusBadge.jsx
import React from 'react'
import { clsx } from 'clsx'

const statusConfig = {
  open: {
    label: 'Open',
    className: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: '🔵'
  },
  'in-progress': {
    label: 'In Progress',
    className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: '⚡'
  },
  resolved: {
    label: 'Resolved',
    className: 'bg-green-100 text-green-800 border-green-200',
    icon: '✅'
  },
  closed: {
    label: 'Closed',
    className: 'bg-gray-100 text-gray-800 border-gray-200',
    icon: '✖️'
  }
}

const priorityConfig = {
  low: {
    label: 'Low',
    className: 'bg-green-100 text-green-800 border-green-200',
    icon: '🟢'
  },
  medium: {
    label: 'Medium',
    className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: '🟡'
  },
  high: {
    label: 'High',
    className: 'bg-red-100 text-red-800 border-red-200',
    icon: '🔴'
  }
}

export const StatusBadge = ({ status, type = 'status', className = '' }) => {
  const config = type === 'status' ? statusConfig : priorityConfig
  const { label, className: baseClassName, icon } = config[status] || {}

  if (!label) return null

  return (
    <span
      className={clsx(
        'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border',
        baseClassName,
        className
      )}
    >
      {icon && <span className="mr-1">{icon}</span>}
      {label}
    </span>
  )
}