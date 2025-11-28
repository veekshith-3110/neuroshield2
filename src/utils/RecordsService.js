/**
 * Records Service
 * Manages user records stored in localStorage, associated with their Google account
 */

/**
 * Get storage key for a specific user
 * @param {string} userId - User ID from Google account
 * @returns {string} Storage key
 */
const getStorageKey = (userId) => {
  return `userRecords_${userId}`;
};

/**
 * Get all records for a user
 * @param {string} userId - User ID from Google account
 * @returns {Array} Array of records
 */
export const getUserRecords = (userId) => {
  if (!userId) return [];
  
  try {
    const storageKey = getStorageKey(userId);
    const recordsJson = localStorage.getItem(storageKey);
    if (recordsJson) {
      return JSON.parse(recordsJson);
    }
    return [];
  } catch (error) {
    console.error('Error loading records:', error);
    return [];
  }
};

/**
 * Add a new record for a user
 * @param {string} userId - User ID from Google account
 * @param {Object} record - Record object to add
 * @returns {Object} The added record with ID and timestamp
 */
export const addRecord = (userId, record) => {
  if (!userId) {
    throw new Error('User ID is required');
  }

  try {
    const records = getUserRecords(userId);
    const newRecord = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      ...record,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    records.unshift(newRecord); // Add to beginning
    const storageKey = getStorageKey(userId);
    localStorage.setItem(storageKey, JSON.stringify(records));
    
    return newRecord;
  } catch (error) {
    console.error('Error adding record:', error);
    throw error;
  }
};

/**
 * Update an existing record
 * @param {string} userId - User ID from Google account
 * @param {string} recordId - ID of the record to update
 * @param {Object} updates - Fields to update
 * @returns {Object} Updated record
 */
export const updateRecord = (userId, recordId, updates) => {
  if (!userId || !recordId) {
    throw new Error('User ID and Record ID are required');
  }

  try {
    const records = getUserRecords(userId);
    const recordIndex = records.findIndex(r => r.id === recordId);
    
    if (recordIndex === -1) {
      throw new Error('Record not found');
    }

    records[recordIndex] = {
      ...records[recordIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    const storageKey = getStorageKey(userId);
    localStorage.setItem(storageKey, JSON.stringify(records));
    
    return records[recordIndex];
  } catch (error) {
    console.error('Error updating record:', error);
    throw error;
  }
};

/**
 * Delete a record
 * @param {string} userId - User ID from Google account
 * @param {string} recordId - ID of the record to delete
 * @returns {boolean} Success status
 */
export const deleteRecord = (userId, recordId) => {
  if (!userId || !recordId) {
    throw new Error('User ID and Record ID are required');
  }

  try {
    const records = getUserRecords(userId);
    const filteredRecords = records.filter(r => r.id !== recordId);
    
    const storageKey = getStorageKey(userId);
    localStorage.setItem(storageKey, JSON.stringify(filteredRecords));
    
    return true;
  } catch (error) {
    console.error('Error deleting record:', error);
    throw error;
  }
};

/**
 * Get a single record by ID
 * @param {string} userId - User ID from Google account
 * @param {string} recordId - ID of the record
 * @returns {Object|null} Record or null if not found
 */
export const getRecordById = (userId, recordId) => {
  if (!userId || !recordId) return null;
  
  const records = getUserRecords(userId);
  return records.find(r => r.id === recordId) || null;
};

/**
 * Get records count for a user
 * @param {string} userId - User ID from Google account
 * @returns {number} Number of records
 */
export const getRecordsCount = (userId) => {
  return getUserRecords(userId).length;
};

