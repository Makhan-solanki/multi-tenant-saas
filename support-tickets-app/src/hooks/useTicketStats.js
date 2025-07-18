// src/hooks/useTicketStats.js
import { useState, useEffect, useCallback } from 'react'
import { ticketApi } from '../services/ticketApi'

export const useTicketStats = () => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchStats = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await ticketApi.getTicketStats()
      setStats(response)
    } catch (err) {
      setError(err.message)
      setStats(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
  },[fetchStats])

  return {
    stats,
    loading,
    error,
    refreshStats: fetchStats
  }
}