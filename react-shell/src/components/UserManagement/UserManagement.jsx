// src/components/UserManagement/UserManagement.jsx
import React, { useEffect, useState } from 'react'
import { apiService } from '../../services/apiService'
import { Users, Pencil, Trash2 } from 'lucide-react'

const initialFormState = {
  email: '',
  firstName: '',
  lastName: '',
  role: 'User',
  customerId: ''
}

const UserManagement = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [form, setForm] = useState(initialFormState)
  const [editingUserId, setEditingUserId] = useState(null)

  const fetchUsers = async () => {
    try {
      const response = await apiService.getUsers()
      setUsers(response.data.users || [])
    } catch (err) {
      console.error('Failed to fetch users:', err)
      setError('Failed to load users.')
    } finally {
      setLoading(false)
    }
  }
  console.log("✅ UserManagement mounted");

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingUserId) {
        await apiService.updateUser(editingUserId, form)
      } else {
        await apiService.createUser(form)
      }
      setForm(initialFormState)
      setEditingUserId(null)
      await fetchUsers()
    } catch (err) {
      console.error('Failed to save user:', err)
    }
  }

  const handleEdit = (user) => {
    setForm(user)
    setEditingUserId(user._id)
  }

  const handleDelete = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await apiService.deleteUser(userId)
        await fetchUsers()
      } catch (err) {
        console.error('Delete failed:', err)
      }
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 flex items-center">
        <Users className="w-6 h-6 mr-2" />
        User Management
      </h2>

      {/* User Form */}
      <form onSubmit={handleFormSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input name="email" value={form.email} onChange={handleInputChange} placeholder="Email" required className="p-2 border rounded" />
          <select name="role" value={form.role} onChange={handleInputChange} className="p-2 border rounded">
            <option value="User">User</option>
            <option value="Agent">Agent</option>
            <option value="Admin">Admin</option>
          </select>
          <input name="firstName" value={form.firstName} onChange={handleInputChange} placeholder="First Name" className="p-2 border rounded" />
          <input name="lastName" value={form.lastName} onChange={handleInputChange} placeholder="Last Name" className="p-2 border rounded" />
          <input name="customerId" value={form.customerId} onChange={handleInputChange} placeholder="Customer ID" className="p-2 border rounded" />
        </div>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          {editingUserId ? 'Update User' : 'Create User'}
        </button>
      </form>

      {/* User Table */}
      {loading ? (
        <p className="text-gray-500">Loading users...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full table-auto border-collapse mt-4">
            <thead>
              <tr className="bg-gray-100 text-left text-sm text-gray-600">
                <th className="p-2 border-b">Email</th>
                <th className="p-2 border-b">Role</th>
                <th className="p-2 border-b">Customer ID</th>
                <th className="p-2 border-b">First Name</th>
                <th className="p-2 border-b">Last Name</th>
                <th className="p-2 border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user._id} className="hover:bg-gray-50 text-sm">
                  <td className="p-2 border-b">{user.email}</td>
                  <td className="p-2 border-b">{user.role}</td>
                  <td className="p-2 border-b">{user.customerId}</td>
                  <td className="p-2 border-b">{user.firstName}</td>
                  <td className="p-2 border-b">{user.lastName}</td>
                  <td className="p-2 border-b space-x-2">
                    <button onClick={() => handleEdit(user)} className="text-blue-600 hover:underline">
                      <Pencil size={16} />
                    </button>
                    <button onClick={() => handleDelete(user._id)} className="text-red-600 hover:underline">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default UserManagement
