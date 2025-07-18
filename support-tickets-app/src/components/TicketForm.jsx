// src/components/TicketForm.jsx
import React, { useState, useEffect } from 'react';
import { ticketApi } from '../services/ticketApi';
import { LoadingSpinner } from './LoadingSpinner';
import { ArrowLeft, Save } from 'lucide-react';
import { useAuth } from 'react-shell/AuthContext' 
import { userApi} from '../services/userApi'

export const TicketForm = ({ ticket, onSave, onCancel }) => {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    tags: '',
    status: 'open',
    assignedTo: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [userList, setUserList] = useState([]);

  useEffect(() => {
    if (ticket) {
      setFormData({
        title: ticket.title || '',
        description: ticket.description || '',
        priority: ticket.priority || 'medium',
        tags: formData.tags ? formData.tags.split(/[, ]+/).map((tag) => tag.trim()).filter(Boolean) : [],
        status: ticket.status || 'open',
        assignedTo: ticket.assignedTo?._id || ''
      });
    } else {
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        tags: '',
        status: 'open',
        assignedTo: ''
      });
    }
    setError(null);
    setSuccess(false);
  }, [ticket]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const dataToSubmit = {
      ...formData,
      tags: typeof formData.tags === 'string'
        ? formData.tags.split(',').map((tag) => tag.trim()).filter(Boolean)
        : []
    };

    if (dataToSubmit.assignedTo === '') {
      delete dataToSubmit.assignedTo;
    }

    try {
      if (ticket) {
        await ticketApi.updateTicket(ticket._id, dataToSubmit);
        alert('Ticket updated successfully!');
      } else {
        await ticketApi.createTicket(dataToSubmit);
        alert('Ticket created successfully!');
      }
      setSuccess(true);
      onSave();
    } catch (err) {
      console.error('Submission error:', err);
      setError(err.message || 'An error occurred during submission.');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    const fetchUsers = async () => {
      if (user?.role === 'Admin') {
        try {
          const res = await userApi.getAllUsers(); 
          setUserList(res?.users || []);
        } catch (err) {
          console.error('Failed to fetch users', err);
        }
      }
    };
    fetchUsers();
  }, []);
  
  

  return (
    <div className="bg-white rounded-lg shadow-xl p-8 mb-8 border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onCancel}
          className="text-blue-600 hover:text-blue-800 flex items-center transition-colors duration-200"
        >
          <ArrowLeft className="w-5 h-5 mr-2" /> Back
        </button>
        <h2 className="text-3xl font-bold text-gray-800">{ticket ? 'Edit Ticket' : 'Create New Ticket'}</h2>
        <div className="w-24" />
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-gray-700 font-bold mb-2">Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            maxLength="200"
            className="w-full border px-4 py-2 rounded shadow-sm"
          />
        </div>

        <div>
          <label className="block text-gray-700 font-bold mb-2">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            required
            maxLength="2000"
            className="w-full border px-4 py-2 rounded shadow-sm"
          ></textarea>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 font-bold mb-2">Priority</label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="w-full border px-4 py-2 rounded shadow-sm"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-700 font-bold mb-2">Tags (comma-separated)</label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="e.g., bug, frontend, urgent"
              className="w-full border px-4 py-2 rounded shadow-sm"
            />
          </div>
          {user.role === 'Admin' && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Assign To</label>
              <select
                value={formData.assignedTo || ''}
                onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
              >
                <option value="">Unassigned</option>
                {userList.map(user => (
                  <option key={user._id} value={user._id}>
                    {user.email}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
          >
            {loading ? <LoadingSpinner size="sm" className="mr-2" /> : <Save className="w-5 h-5 mr-2" />}
            {ticket ? 'Update Ticket' : 'Create Ticket'}
          </button>
        </div>
      </form>
    </div>
  );
};
