import React, { useState, useEffect, } from 'react';
import { ticketApi } from '../services/ticketApi';
import { LoadingSpinner } from './LoadingSpinner';
import { StatusBadge } from './StatusBadge';
import { format } from 'date-fns';
import { ArrowLeft, MessageSquare, Send } from 'lucide-react';
// CORRECT: Import from the Module Federation remote name 'react-shell'
import { useAuth } from 'react-shell/AuthContext'; 

export const TicketDetails = ({ ticket: initialTicket, onBack, currentUserRole }) => {
  const [fullTicket, setFullTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentError, setCommentError] = useState(null);
  const { user: currentUser } = useAuth(); 

  useEffect(() => {
    const fetchTicketDetails = async () => {
      if (!initialTicket?._id) {
        setError('Ticket ID is missing.');
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const response = await ticketApi.getTicketById(initialTicket._id);
        setFullTicket(response.ticket); // Assuming the API returns { ticket: {...} }
      } catch (err) {
        console.error('Failed to fetch ticket details:', err);
        setError(err.message || 'Failed to load ticket details.');
      } finally {
        setLoading(false);
      }
    };

    fetchTicketDetails();
  }, [initialTicket?._id]);

  const handleAddComment = async () => {
    if (!commentText.trim()) {
      alert('Comment cannot be empty.');
      return;
    }
  
    if (!fullTicket?._id) {
      alert('Ticket ID is missing.');
      return;
    }
  
    setCommentLoading(true);
    try {
      const response = await ticketApi.addComment(fullTicket._id, {
        content: commentText // ✅ only content sent
      });
      setFullTicket(response.ticket); // update UI with comment
      setCommentText('');
    } catch (err) {
      console.error('Failed to add comment:', err);
      setCommentError(err.message || 'Failed to add comment.');
    } finally {
      setCommentLoading(false);
    }
  };
  

  const handleStatusChange = async (newStatus) => {
    if (!fullTicket?._id) return;
    setLoading(true);
    try {
      const updatedTicket = await ticketApi.updateTicketStatus(fullTicket._id, newStatus);
      setFullTicket(updatedTicket.ticket);
    } catch (err) {
      console.error('Failed to update status:', err);
      setError(err.message || 'Failed to update status.');
    } finally {
      setLoading(false);
    }
  };

  const isAgentOrAdmin = currentUserRole === 'Admin' || currentUserRole === 'Agent';

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
        <p className="ml-4 text-gray-600">Loading ticket details...</p>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-600 text-center p-4">Error: {error}</div>;
  }

  if (!fullTicket) {
    return <div className="text-gray-600 text-center p-4">No ticket details available.</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-xl p-8 mb-8 border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="text-blue-600 hover:text-blue-800 flex items-center transition-colors duration-200"
        >
          <ArrowLeft className="w-5 h-5 mr-2" /> Back to Tickets
        </button>
        <h2 className="text-3xl font-bold text-gray-800">{fullTicket.title}</h2>
        <div className="flex gap-2">
          <StatusBadge status={fullTicket.status} type="status" />
          <StatusBadge status={fullTicket.priority} type="priority" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 text-gray-700">
        <div className="md:col-span-2">
          <h3 className="text-xl font-semibold mb-3 border-b pb-2">Description</h3>
          <p className="text-base leading-relaxed whitespace-pre-wrap">{fullTicket.description}</p>
        </div>
        <div>
          <h3 className="text-xl font-semibold mb-3 border-b pb-2">Details</h3>
          <ul className="space-y-2">
            <li><strong>Created By:</strong> {fullTicket.userId?.email || 'N/A'}</li>
            <li><strong>Created At:</strong> {format(new Date(fullTicket.createdAt), 'MMM dd, yyyy hh:mm a')}</li>
            <li><strong>Last Updated:</strong> {format(new Date(fullTicket.updatedAt), 'MMM dd, yyyy hh:mm a')}</li>
            <li><strong>Assigned To:</strong> {fullTicket.assignedTo?.email || 'Unassigned'}</li>
            {fullTicket.resolvedAt && <li><strong>Resolved At:</strong> {format(new Date(fullTicket.resolvedAt), 'MMM dd, yyyy hh:mm a')}</li>}
            {fullTicket.closedAt && <li><strong>Closed At:</strong> {format(new Date(fullTicket.closedAt), 'MMM dd, yyyy hh:mm a')}</li>}
          </ul>
          {fullTicket.tags && fullTicket.tags.length > 0 && (
            <div className="mt-4">
              <h4 className="font-semibold mb-2">Tags:</h4>
              <div className="flex flex-wrap gap-2">
                {fullTicket.tags.map((tag, index) => (
                  <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {isAgentOrAdmin && (
            <div className="mt-6">
              <h4 className="font-semibold mb-2">Update Status:</h4>
              <select
                value={fullTicket.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="open">Open</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4 flex items-center border-b pb-2">
          <MessageSquare className="w-5 h-5 mr-2" /> Comments ({fullTicket.comments.length})
        </h3>
        <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
          {fullTicket.comments.length === 0 ? (
            <p className="text-gray-500 italic">No comments yet.</p>
          ) : (
            fullTicket.comments.map((comment, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <span className="font-semibold text-gray-800">{comment.userId?.email || 'Unknown User'}</span>
                  <span className="mx-2">•</span>
                  <span>{format(new Date(comment.createdAt), 'MMM dd, yyyy hh:mm a')}</span>
                </div>
                <p className="text-gray-800 whitespace-pre-wrap">{comment.content}</p>
              </div>
            ))
          )}
        </div>
        <div className="mt-6 flex items-center">
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Add a comment..."
            rows="3"
            className="flex-grow p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
          ></textarea>
          <button
            onClick={handleAddComment}
            className="ml-4 p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center"
            title="Add Comment"
          >
            <Send className="w-5 h-5" />
            <span className="ml-2 hidden sm:inline">Comment</span>
          </button>
        </div>
      </div>
    </div>
  );
};