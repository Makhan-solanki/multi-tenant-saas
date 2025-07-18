// src/components/TicketList.jsx
import React, { useEffect, useState } from 'react';
import { ticketApi } from '../services/ticketApi';
import { TicketCard } from './TicketCard';
import { LoadingSpinner } from './LoadingSpinner';

export const TicketList = ({ onCreateNew, onEditTicket, onViewDetails, currentUserRole }) => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ status: '', priority: '', search: '' });

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams(Object.entries(filters).filter(([_, v]) => v)).toString();
      const res = await ticketApi.getTickets(query);
      setTickets(res.tickets || []);
    } catch (err) {
      console.error('Failed to fetch tickets:', err);
      setError('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [filters]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">My Tickets</h2>
        <button
          onClick={onCreateNew}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + New Ticket
        </button>
      </div>

      <div className="flex flex-wrap gap-4">
        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          className="border border-gray-300 px-3 py-2 rounded"
        >
          <option value="">All Statuses</option>
          <option value="open">Open</option>
          <option value="in-progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>

        <select
          value={filters.priority}
          onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
          className="border border-gray-300 px-3 py-2 rounded"
        >
          <option value="">All Priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>

        <input
          type="text"
          placeholder="Search tickets..."
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          className="border border-gray-300 px-3 py-2 rounded w-64"
        />

        <button
          onClick={fetchTickets}
          className="bg-gray-100 border px-4 py-2 rounded hover:bg-gray-200"
        >
          Apply
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-32">
          <LoadingSpinner size="lg" />
        </div>
      ) : error ? (
        <div className="text-red-500 text-center">{error}</div>
      ) : (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {tickets.length === 0 ? (
            <p className="text-gray-600 col-span-full text-center">No tickets found</p>
          ) : (
            tickets.map((ticket) => (
              <TicketCard
                key={ticket._id}
                ticket={ticket}
                onEdit={onEditTicket}
                onDelete={() => fetchTickets()}
                onViewDetails={onViewDetails}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
};
