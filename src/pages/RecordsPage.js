import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import DashboardNavigation from '../components/DashboardNavigation';
import AnimatedLogoutButton from '../components/AnimatedLogoutButton';
import ProfileIcon from '../components/ProfileIcon';
import {
  getUserRecords,
  addRecord,
  updateRecord,
  deleteRecord
} from '../utils/RecordsService';

const RecordsPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'general',
    date: new Date().toISOString().split('T')[0],
    value: '',
    notes: ''
  });

  const loadRecords = useCallback(() => {
    if (user?.id) {
      const userRecords = getUserRecords(user.id);
      setRecords(userRecords);
    }
  }, [user]);

  useEffect(() => {
    if (user?.id) {
      loadRecords();
    }
  }, [user, loadRecords]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      alert('Please enter a title');
      return;
    }

    try {
      if (editingRecord) {
        // Update existing record
        updateRecord(user.id, editingRecord.id, formData);
      } else {
        // Add new record
        addRecord(user.id, formData);
      }
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        category: 'general',
        date: new Date().toISOString().split('T')[0],
        value: '',
        notes: ''
      });
      setShowAddForm(false);
      setEditingRecord(null);
      loadRecords();
    } catch (error) {
      console.error('Error saving record:', error);
      alert('Failed to save record. Please try again.');
    }
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    setFormData({
      title: record.title || '',
      description: record.description || '',
      category: record.category || 'general',
      date: record.date || new Date().toISOString().split('T')[0],
      value: record.value || '',
      notes: record.notes || ''
    });
    setShowAddForm(true);
  };

  const handleDelete = (recordId) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      try {
        deleteRecord(user.id, recordId);
        loadRecords();
      } catch (error) {
        console.error('Error deleting record:', error);
        alert('Failed to delete record. Please try again.');
      }
    }
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingRecord(null);
    setFormData({
      title: '',
      description: '',
      category: 'general',
      date: new Date().toISOString().split('T')[0],
      value: '',
      notes: ''
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getCategoryColor = (category) => {
    const colors = {
      general: 'bg-gray-100 text-gray-800',
      health: 'bg-red-100 text-red-800',
      fitness: 'bg-blue-100 text-blue-800',
      mood: 'bg-yellow-100 text-yellow-800',
      sleep: 'bg-purple-100 text-purple-800',
      nutrition: 'bg-green-100 text-green-800',
      other: 'bg-indigo-100 text-indigo-800'
    };
    return colors[category] || colors.general;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-2">
              📋 My Records
            </h1>
            <div className="flex items-center gap-3">
              {user?.picture && (
                <img 
                  src={user.picture} 
                  alt={user.name} 
                  className="w-10 h-10 rounded-full border-2 border-purple-500"
                />
              )}
              <p className="text-gray-600 text-lg">
                {user?.name || 'User'}'s Records
                {user?.email && <span className="text-sm text-gray-500 ml-2">({user.email})</span>}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ProfileIcon />
            <AnimatedLogoutButton onLogout={handleLogout} />
          </div>
        </header>

        {/* Navigation */}
        <DashboardNavigation />

        {/* Add Record Button */}
        <div className="mt-8 mb-6">
          {!showAddForm ? (
            <button
              onClick={() => setShowAddForm(true)}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg shadow-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 font-semibold flex items-center gap-2"
            >
              <span>➕</span> Add New Record
            </button>
          ) : null}
        </div>

        {/* Add/Edit Record Form */}
        {showAddForm && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              {editingRecord ? '✏️ Edit Record' : '➕ Add New Record'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter record title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="general">General</option>
                    <option value="health">Health</option>
                    <option value="fitness">Fitness</option>
                    <option value="mood">Mood</option>
                    <option value="sleep">Sleep</option>
                    <option value="nutrition">Nutrition</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter description"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Value (optional)
                  </label>
                  <input
                    type="text"
                    name="value"
                    value={formData.value}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="e.g., 75, 8.5, etc."
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Additional notes..."
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 font-semibold"
                >
                  {editingRecord ? '💾 Update Record' : '💾 Save Record'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all duration-300 font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Records List */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">
              📚 All Records ({records.length})
            </h2>
          </div>

          {records.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg mb-4">No records yet!</p>
              <p className="text-gray-400">Click "Add New Record" to create your first record.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {records.map((record) => (
                <div
                  key={record.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-800">
                          {record.title}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getCategoryColor(record.category)}`}>
                          {record.category}
                        </span>
                        {record.value && (
                          <span className="text-lg font-semibold text-purple-600">
                            {record.value}
                          </span>
                        )}
                      </div>
                      
                      {record.description && (
                        <p className="text-gray-600 mb-2">{record.description}</p>
                      )}
                      
                      {record.notes && (
                        <p className="text-gray-500 text-sm mb-2 italic">
                          {record.notes}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>📅 {formatDate(record.date || record.createdAt)}</span>
                        {record.updatedAt !== record.createdAt && (
                          <span>✏️ Updated: {formatDate(record.updatedAt)}</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleEdit(record)}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-semibold"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDelete(record.id)}
                        className="px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-semibold"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center text-gray-500 text-sm">
          <p>Your records are stored securely in your browser and associated with your Google account</p>
        </footer>
      </div>
    </div>
  );
};

export default RecordsPage;

