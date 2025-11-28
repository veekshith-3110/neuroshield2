import React from 'react';
import { useApp } from '../context/AppContext';
import { generateTips } from '../utils/tipsGenerator';

const Recommendations = () => {
  const { getTodayLog, completeTask } = useApp();
  const todayLog = getTodayLog();

  if (!todayLog) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          💡 Personalized Tips
        </h2>
        <p className="text-gray-500">
          Complete your daily check-in to get personalized wellness tips!
        </p>
      </div>
    );
  }

  const tips = generateTips(
    todayLog.riskScore,
    todayLog.sleep,
    todayLog.screenTime,
    todayLog.mood
  );

  const completedTasks = todayLog.tasksCompleted || [];

  const handleTaskComplete = (taskId) => {
    completeTask(taskId);
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Mind':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'Body':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'Digital Detox':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        💡 Personalized Recovery Tips
      </h2>
      
      <p className="text-gray-600 mb-4 text-sm">
        Based on your check-in, here are some activities to help you feel better:
      </p>

      <div className="space-y-4">
        {tips.map((tip) => {
          const isCompleted = completedTasks.includes(tip.id);
          
          return (
            <div
              key={tip.id}
              className={`border-2 rounded-lg p-4 transition-all ${
                isCompleted
                  ? 'bg-gray-50 border-gray-300 opacity-75'
                  : 'bg-white hover:shadow-md'
              }`}
            >
              <div className="flex items-start gap-3">
                <label className="notebook-checkbox small cursor-pointer flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={isCompleted}
                    onChange={() => handleTaskComplete(tip.id)}
                    disabled={isCompleted}
                  />
                  <span className="checkmark"></span>
                  <span className="text">
                    <span className="text-content">{tip.title}</span>
                    <svg preserveAspectRatio="none" viewBox="0 0 400 20" className="cut-line">
                      <path d="M0,10 H400"></path>
                    </svg>
                  </span>
                </label>
                <div className="flex-1 pt-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl">{tip.icon}</span>
                    <span className={`text-xs font-semibold px-2 py-1 rounded border ${getCategoryColor(tip.category)}`}>
                      {tip.category}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-1">
                    {tip.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {tip.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {completedTasks.length > 0 && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800">
            🎉 Great job! You've completed {completedTasks.length} task{completedTasks.length !== 1 ? 's' : ''} today!
          </p>
        </div>
      )}
    </div>
  );
};

export default Recommendations;

