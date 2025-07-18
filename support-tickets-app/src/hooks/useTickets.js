import { useState, useEffect, useCallback } from 'react';
import { ticketApi } from '../services/ticketApi';

export const useTickets = (initialFilters = {}) => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(initialFilters);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  const fetchTickets = useCallback(async (customFilters = filters) => {
    setLoading(true);
    setError(null);

    try {
      const response = await ticketApi.getTickets(customFilters);
      setTickets(response.tickets || []);
      setPagination(response.pagination || pagination);
    } catch (err) {
      setError(err.message);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchTickets(filters);
    // ONLY depend on filters to avoid refetch loop
  }, [filters]);

  const createTicket = async (ticketData) => {
    setLoading(true);
    setError(null);

    try {
      const newTicket = await ticketApi.createTicket(ticketData);
      return newTicket;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateTicket = async (ticketId, updateData) => {
    setLoading(true);
    setError(null);
    try {
      const updatedTicket = await ticketApi.updateTicket(ticketId, updateData);
      setTickets(prev => prev.map(ticket => ticket._id === ticketId ? updatedTicket : ticket));
      return updatedTicket;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteTicket = async (ticketId) => {
    setLoading(true);
    setError(null);
    try {
      await ticketApi.deleteTicket(ticketId);
      setTickets(prev => prev.filter(ticket => ticket._id !== ticketId));
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    tickets,
    pagination,
    loading,
    error,
    setFilters,
    fetchTickets,
    createTicket,
    updateTicket,
    deleteTicket
  };
};
