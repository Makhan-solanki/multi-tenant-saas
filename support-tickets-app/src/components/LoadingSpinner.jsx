// src/components/LoadingSpinner.jsx
import React from 'react'

export const LoadingSpinner = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  }

  return (
    <div
      className={`animate-spin rounded-full border-4 border-t-4 border-blue-500 border-opacity-25 border-t-blue-500 ${sizeClasses[size]} ${className}`}
      role="status"
    >
      <span className="sr-only">Loading...</span>
    </div>
  )
}