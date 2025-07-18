import React from 'react'
import { StatusBadge } from './StatusBadge'
import { format } from 'date-fns'
import { Edit, Trash2, Eye } from 'lucide-react'

export const TicketCard = ({ ticket, onEdit, onDelete, onViewDetails, currentUserRole }) => {
  const handleEditClick = () => {
    onEdit(ticket)
  }

  const handleDeleteClick = () => {
    onDelete(ticket._id)
  }

  const handleViewDetailsClick = () => {
    onViewDetails(ticket)
  }

  const isAdmin = currentUserRole === 'Admin'

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-xl font-semibold text-gray-800 truncate pr-2">{ticket.title}</h3>
          <StatusBadge status={ticket.priority} type="priority" />
        </div>

        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{ticket.description}</p>

        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center space-x-2">
            <span className="font-medium">Status:</span>
            <StatusBadge status={ticket.status} type="status" />
          </div>
          <span>Created: {format(new Date(ticket.createdAt), 'MMM dd, yyyy')}</span>
        </div>

        {ticket.assignedTo && (
          <p className="text-sm text-gray-600 mb-4">
            Assigned to: <span className="font-medium">{ticket.assignedTo.email || 'N/A'}</span>
          </p>
        )}

        <div className="flex flex-wrap gap-2 mb-4">
          {ticket.tags?.map((tag, index) => (
            <span key={index} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs">
              {tag}
            </span>
          ))}
        </div>

        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={handleViewDetailsClick}
            className="p-2 rounded-full text-gray-600 hover:bg-gray-100 transition-colors"
            title="View Details"
            data-testid="view-details-btn"
          >
            <Eye className="w-5 h-5" />
          </button>

          <button
            onClick={handleEditClick}
            className="p-2 rounded-full text-blue-600 hover:bg-blue-100 transition-colors"
            title="Edit Ticket"
            data-testid="edit-ticket-btn"
          >
            <Edit className="w-5 h-5" />
          </button>

          {isAdmin && (
            <button
              onClick={handleDeleteClick}
              className="p-2 rounded-full text-red-600 hover:bg-red-100 transition-colors"
              title="Delete Ticket"
              data-testid="delete-ticket-btn"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
