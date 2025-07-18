import React from 'react'
import { Search, XCircle } from 'lucide-react'

export const TicketFilters = ({ filters, onFiltersChange, onClearFilters }) => {
  const handleFilterChange = (name, value) => {
    onFiltersChange({ ...filters, [name]: value, page: 1 }) // Reset page on filter change
  }

  const handleSearchChange = (e) => {
    handleFilterChange('search', e.target.value)
  }

  const handleStatusChange = (e) => {
    handleFilterChange('status', e.target.value === 'all' ? '' : e.target.value)
  }

  const handlePriorityChange = (e) => {
    handleFilterChange('priority', e.target.value === 'all' ? '' : e.target.value)
  }

  const handleSortChange = (e) => {
    const [sortBy, sortOrder] = e.target.value.split(':')
    onFiltersChange({ ...filters, sortBy, sortOrder })
  }

  const isFiltered = Object.values(filters).some(value => value !== '' && value !== undefined && value !== null && value !== 1 && value !== 10 && value !== 'createdAt' && value !== 'desc')

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
      <h3 className="text-lg font-semibold text-gray-800">Filter & Sort Tickets</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search Input */}
        <div className="relative col-span-full lg:col-span-1">
          <input
            type="text"
            placeholder="Search by title or description..."
            value={filters.search || ''}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            data-testid="search-input"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        </div>

        {/* Status Filter */}
        <select
          value={filters.status || 'all'}
          onChange={handleStatusChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          data-testid="status-filter"
        >
          <option value="all">All Status</option>
          <option value="open">Open</option>
          <option value="in-progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>

        {/* Priority Filter */}
        <select
          value={filters.priority || 'all'}
          onChange={handlePriorityChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          data-testid="priority-filter"
        >
          <option value="all">All Priority</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>

        {/* Sort By */}
        <select
          value={`${filters.sortBy || 'createdAt'}:${filters.sortOrder || 'desc'}`}
          onChange={handleSortChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          data-testid="sort-filter"
        >
          <option value="createdAt:desc">Sort by Date (Newest)</option>
          <option value="createdAt:asc">Sort by Date (Oldest)</option>
          <option value="priority:desc">Sort by Priority (High to Low)</option>
          <option value="priority:asc">Sort by Priority (Low to High)</option>
          <option value="status:asc">Sort by Status</option>
          <option value="title:asc">Sort by Title</option>
        </select>
      </div>

      {isFiltered && (
        <div className="flex justify-end">
          <button
            onClick={onClearFilters}
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            data-testid="clear-filters-btn"
          >
            <XCircle className="w-4 h-4 mr-2" /> Clear Filters
          </button>
        </div>
      )}
    </div>
  )
}