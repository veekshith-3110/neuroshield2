/**
 * Upload Component
 * 
 * Handles file upload with drag & drop functionality.
 * Supports .csv, .fit, and .gpx file formats.
 * 
 * Features:
 * - Drag & drop file upload
 * - File type validation
 * - Upload progress indication
 * - Error handling
 * - History display
 */

import React, { useState, useRef } from 'react';
import axios from 'axios';

const Upload = ({ onUploadSuccess, history, onLoadHistory }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

  /**
   * Handle drag events
   */
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  /**
   * Handle file drop
   */
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  /**
   * Handle file input change
   */
  const handleFileInputChange = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  /**
   * Validate and upload file
   * 
   * @param {File} file - Selected file
   */
  const handleFileSelect = async (file) => {
    // Reset error state
    setError(null);
    setUploadProgress(0);

    // Validate file type
    const allowedTypes = ['.csv', '.fit', '.gpx'];
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();

    if (!allowedTypes.includes(fileExtension)) {
      setError(`Invalid file type. Please upload a ${allowedTypes.join(', ')} file.`);
      return;
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setError('File size exceeds 10MB limit. Please upload a smaller file.');
      return;
    }

    // Upload file
    await uploadFile(file);
  };

  /**
   * Upload file to backend
   * 
   * @param {File} file - File to upload
   */
  const uploadFile = async (file) => {
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);

      // Upload with progress tracking
      const response = await axios.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        },
      });

      // Success - pass data to parent
      onUploadSuccess(response.data);
      setUploadProgress(100);

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Upload error:', error);
      
      // Handle different error types
      if (error.response) {
        // Server responded with error
        setError(error.response.data.message || error.response.data.error || 'Upload failed. Please try again.');
      } else if (error.request) {
        // Request made but no response
        setError('Unable to connect to server. Please make sure the backend is running on port 5000.');
      } else {
        // Error setting up request
        setError(error.message || 'An unexpected error occurred.');
      }
    } finally {
      setIsUploading(false);
      // Reset progress after a delay
      setTimeout(() => {
        setUploadProgress(0);
      }, 2000);
    }
  };

  /**
   * Trigger file input click
   */
  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-8">
      {/* Upload Section */}
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          Upload HRV / Heart Rate File
        </h2>
        <p className="text-gray-600 mb-6">
          Upload a .csv, .fit, or .gpx file containing heart rate or RR interval data
        </p>

        {/* Drag & Drop Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
            isDragging
              ? 'border-indigo-500 bg-indigo-50'
              : 'border-gray-300 bg-gray-50 hover:border-indigo-400 hover:bg-indigo-50'
          } ${isUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={!isUploading ? handleClick : undefined}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.fit,.gpx"
            onChange={handleFileInputChange}
            className="hidden"
            disabled={isUploading}
          />

          {isUploading ? (
            <div className="space-y-4">
              <div className="text-4xl">⏳</div>
              <p className="text-lg font-semibold text-gray-700">Uploading...</p>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-indigo-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600">{uploadProgress}%</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-6xl">📤</div>
              <div>
                <p className="text-xl font-semibold text-gray-700">
                  Drag & drop your file here
                </p>
                <p className="text-gray-500 mt-2">or click to browse</p>
              </div>
              <p className="text-sm text-gray-400">
                Supported formats: .csv, .fit, .gpx (Max 10MB)
              </p>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 font-semibold">⚠️ Error</p>
            <p className="text-red-600 mt-1">{error}</p>
          </div>
        )}
      </div>

      {/* History Section */}
      {history.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">📜 Upload History</h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {history.map((entry, index) => (
              <div
                key={index}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => onLoadHistory(entry)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-800">{entry.fileName}</p>
                    <p className="text-sm text-gray-600">
                      HRV: <span className="font-semibold">{entry.hrv} ms</span> • 
                      Status: <span className={`font-semibold ${
                        entry.status === 'Relaxed' ? 'text-green-600' :
                        entry.status === 'Normal' ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>{entry.status}</span>
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(entry.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-2xl">
                    {entry.status === 'Relaxed' ? '🟢' :
                     entry.status === 'Normal' ? '🟡' : '🔴'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Upload;

