// src/components/Admin/AuditLogs.jsx
import React, { useEffect, useState } from 'react';
import { auditApi } from '../../services/auditLog'
import { format } from 'date-fns';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await auditApi.getLogs();
        setLogs(res.logs || []);
      } catch (err) {
        console.error('Failed to fetch audit logs:', err);
        setError('Failed to load audit logs');
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Audit Logs</h2>

      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 text-left border">Date</th>
                <th className="p-2 text-left border">User</th>
                <th className="p-2 text-left border">Action</th>
                <th className="p-2 text-left border">Resource</th>
                <th className="p-2 text-left border">Details</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log._id} className="border-b">
                  <td className="p-2 border">{format(new Date(log.createdAt), 'PPpp')}</td>
                  <td className="p-2 border">{log.userId?.email || 'N/A'}</td>
                  <td className="p-2 border capitalize">{log.action}</td>
                  <td className="p-2 border capitalize">{log.resourceType}</td>
                  <td className="p-2 border text-gray-600 text-xs whitespace-pre-wrap">
                    {JSON.stringify(log.details, null, 2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AuditLogs;
