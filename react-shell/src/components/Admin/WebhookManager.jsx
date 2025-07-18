// src/components/Admin/WebhookManager.jsx
import React, { useEffect, useState } from 'react';
import { Plus, Trash2, RefreshCcw, Save } from 'lucide-react';
import { apiService } from '../../services/apiService';

const WebhookManager = () => {
  const [webhooks, setWebhooks] = useState([]);
  const [newWebhook, setNewWebhook] = useState({ url: '', events: [] });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const availableEvents = [
    'ticket.created',
    'ticket.updated',
    'ticket.deleted',
    'comment.added'
  ];

  const fetchWebhooks = async () => {
    setLoading(true);
    try {
      const res = await apiService.get('/api/webhooks');
      setWebhooks(res.webhooks);
    } catch (err) {
      console.error('Failed to fetch webhooks', err);
      setError('Failed to fetch webhooks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWebhooks();
  }, []);

  const handleCreate = async () => {
    try {
      const res = await apiService.post('/api/webhooks', newWebhook);
      setWebhooks([...webhooks, res.webhook]);
      setNewWebhook({ url: '', events: [] });
    } catch (err) {
      console.error('Failed to create webhook', err);
      setError('Create failed');
    }
  };

  const handleDelete = async (id) => {
    try {
      await apiService.delete(`/api/webhooks/${id}`);
      setWebhooks(webhooks.filter((w) => w._id !== id));
    } catch (err) {
      console.error('Delete failed', err);
      setError('Delete failed');
    }
  };

  const handleUpdate = async (id, updated) => {
    try {
      const sanitized = {
        url: updated.url,
        events: updated.events ?? [] // default to empty array if missing
      };
  
      const res = await apiService.put(`/api/webhooks/${id}`, sanitized);
      setWebhooks(webhooks.map((w) => (w._id === id ? res.webhook : w)));
      setEditingId(null);
    } catch (err) {
      console.error('Update failed', err.response?.data || err.message);
      setError('Update failed: ' + (err.response?.data?.error || 'Unknown error'));
    }
  };
  
  

  const toggleEvent = (events, event) =>
    events.includes(event)
      ? events.filter((e) => e !== event)
      : [...events, event];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Webhook Management</h2>
        <button onClick={fetchWebhooks} className="flex items-center gap-1 text-blue-600 hover:underline">
          <RefreshCcw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {error && <p className="text-red-600">{error}</p>}

      {/* Create Form */}
      <div className="p-4 bg-white shadow rounded space-y-4">
        <h3 className="font-semibold">Add New Webhook</h3>
        <input
          type="url"
          placeholder="Webhook URL"
          value={newWebhook.url}
          onChange={(e) => setNewWebhook({ ...newWebhook, url: e.target.value })}
          className="w-full p-2 border rounded"
        />
        <div className="flex flex-wrap gap-2">
          {availableEvents.map((event) => (
            <label key={event} className="flex items-center gap-1">
              <input
                type="checkbox"
                checked={newWebhook.events.includes(event)}
                onChange={() =>
                  setNewWebhook({
                    ...newWebhook,
                    events: toggleEvent(newWebhook.events, event)
                  })
                }
              />
              {event}
            </label>
          ))}
        </div>
        <button onClick={handleCreate} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-1">
          <Plus size={16} /> Add Webhook
        </button>
      </div>

      {/* Webhook List */}
      <div className="space-y-4">
        {webhooks.map((webhook) => (
          <div key={webhook._id} className="bg-white p-4 rounded shadow">
            {editingId === webhook._id ? (
              <>
                <input
                  type="url"
                  value={webhook.url}
                  onChange={(e) =>
                    setWebhooks(webhooks.map((w) =>
                      w._id === webhook._id ? { ...w, url: e.target.value } : w
                    ))
                  }
                  className="w-full p-2 border rounded mb-2"
                />
                <div className="flex flex-wrap gap-2 mb-2">
                  {availableEvents.map((event) => (
                    <label key={event} className="flex items-center gap-1">
                      <input
                        type="checkbox"
                        checked={webhook.events.includes(event)}
                        onChange={() =>
                          setWebhooks(webhooks.map((w) =>
                            w._id === webhook._id
                              ? { ...w, events: toggleEvent(w.events, event) }
                              : w
                          ))
                        }
                      />
                      {event}
                    </label>
                  ))}
                </div>
                <button
                  onClick={() => handleUpdate(webhook._id, webhook)}
                  className="bg-green-600 text-white px-3 py-1 rounded mr-2 hover:bg-green-700"
                >
                  <Save size={16} className="inline" /> Save
                </button>
                <button
                  onClick={() => setEditingId(null)}
                  className="text-gray-600 hover:underline"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <div className="flex justify-between">
                  <div>
                    <p className="font-medium">{webhook.url}</p>
                    <p className="text-sm text-gray-600">
                      Events: {webhook.events.join(', ')}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setEditingId(webhook._id)} className="text-blue-600 hover:underline">Edit</button>
                    <button onClick={() => handleDelete(webhook._id)} className="text-red-600 hover:underline">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default WebhookManager;
