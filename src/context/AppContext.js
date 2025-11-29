import React, { createContext, useContext, useState } from 'react';
import { StorageManager } from '../utils/StorageManager';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [data, setData] = useState(StorageManager.getData());

  // Refresh data from storage
  const refreshData = () => {
    setData(StorageManager.getData());
  };

  // Add a new daily log
  const addDailyLog = (log) => {
    const updatedData = StorageManager.addDailyLog(log);
    setData(updatedData);
    return updatedData;
  };

  // Complete a task
  const completeTask = (taskId) => {
    const today = new Date().toISOString().split('T')[0];
    const updatedData = StorageManager.getData();
    const todayLog = updatedData.dailyLogs.find(log => log.date === today);
    
    if (todayLog) {
      if (!todayLog.tasksCompleted) {
        todayLog.tasksCompleted = [];
      }
      if (!todayLog.tasksCompleted.includes(taskId)) {
        todayLog.tasksCompleted.push(taskId);
        const index = updatedData.dailyLogs.findIndex(log => log.date === today);
        updatedData.dailyLogs[index] = todayLog;
        StorageManager.saveData(updatedData);
        StorageManager.updateBadges(updatedData);
        setData(updatedData);
      }
    }
  };

  // Get today's log
  const getTodayLog = () => {
    const today = new Date().toISOString().split('T')[0];
    return data.dailyLogs.find(log => log.date === today) || null;
  };

  // Get recent logs for charts
  const getRecentLogs = (days = 7) => {
    return StorageManager.getRecentLogs(days);
  };

  return (
    <AppContext.Provider
      value={{
        data,
        refreshData,
        addDailyLog,
        completeTask,
        getTodayLog,
        getRecentLogs
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

