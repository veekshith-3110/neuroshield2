import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { generateTips } from '../utils/tipsGenerator';

const Recommendations = () => {
  const { getTodayLog, completeTask } = useApp();
  const todayLog = getTodayLog();
  const [bmiData, setBmiData] = useState({
    weight: '',
    height: '',
    unit: 'metric' // 'metric' or 'imperial'
  });
  const [bmiResult, setBmiResult] = useState(null);

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

  const calculateBMI = () => {
    const weight = parseFloat(bmiData.weight);
    const height = parseFloat(bmiData.height);

    if (!weight || !height || weight <= 0 || height <= 0) {
      alert('Please enter valid weight and height values');
      return;
    }

    let bmi;
    if (bmiData.unit === 'metric') {
      // BMI = weight (kg) / (height (m))^2
      bmi = weight / ((height / 100) ** 2);
    } else {
      // BMI = (weight (lbs) / (height (inches))^2) * 703
      bmi = (weight / (height ** 2)) * 703;
    }

    let category, status, color;
    if (bmi < 18.5) {
      category = 'Underweight';
      status = 'You are underweight. Consider consulting a healthcare provider.';
      color = 'text-blue-600 bg-blue-50 border-blue-200';
    } else if (bmi < 25) {
      category = 'Normal';
      status = 'You have a healthy weight! Keep up the good work.';
      color = 'text-green-600 bg-green-50 border-green-200';
    } else if (bmi < 30) {
      category = 'Overweight';
      status = 'You are slightly overweight. Focus on balanced diet and regular exercise.';
      color = 'text-yellow-600 bg-yellow-50 border-yellow-200';
    } else {
      category = 'Obese';
      status = 'You are in the obese range. Consider consulting a healthcare provider for a personalized plan.';
      color = 'text-red-600 bg-red-50 border-red-200';
    }

    setBmiResult({
      bmi: bmi.toFixed(1),
      category,
      status,
      color
    });
  };

  const getFitnessRecommendations = (bmi) => {
    if (bmi < 18.5) {
      return {
        title: 'Fitness Recommendations for Underweight',
        recommendations: [
          'Strength training 3-4 times per week to build muscle mass',
          'Focus on compound exercises: squats, deadlifts, bench press',
          'Include resistance training with progressive overload',
          'Aim for 150-200 minutes of moderate exercise per week',
          'Rest days are important - allow muscles to recover',
          'Consider working with a personal trainer for proper form'
        ]
      };
    } else if (bmi < 25) {
      return {
        title: 'Fitness Recommendations for Healthy Weight',
        recommendations: [
          'Maintain 150 minutes of moderate aerobic activity per week',
          'Include strength training 2-3 times per week',
          'Mix cardio and resistance training for optimal health',
          'Try activities you enjoy: swimming, cycling, dancing, hiking',
          'Stay active daily - take stairs, walk during breaks',
          'Include flexibility exercises like yoga or stretching'
        ]
      };
    } else if (bmi < 30) {
      return {
        title: 'Fitness Recommendations for Overweight',
        recommendations: [
          'Aim for 200-300 minutes of moderate exercise per week',
          'Start with low-impact activities: walking, swimming, cycling',
          'Include strength training 3-4 times per week',
          'Gradually increase intensity and duration',
          'Focus on consistency over intensity initially',
          'Consider HIIT workouts 2-3 times per week for efficient calorie burn'
        ]
      };
    } else {
      return {
        title: 'Fitness Recommendations for Obese',
        recommendations: [
          'Start with 150 minutes of low-impact exercise per week',
          'Begin with walking, water aerobics, or stationary cycling',
          'Gradually increase duration before intensity',
          'Include strength training 2-3 times per week',
          'Work with a healthcare provider or certified trainer',
          'Focus on building sustainable habits, not quick fixes'
        ]
      };
    }
  };

  const getFoodRecommendations = (bmi) => {
    if (bmi < 18.5) {
      return {
        title: 'Food Recommendations for Underweight',
        recommendations: [
          'Eat nutrient-dense foods: nuts, avocados, whole grains',
          'Include healthy fats: olive oil, fatty fish, nuts',
          'Eat 5-6 smaller meals throughout the day',
          'Add protein to every meal: lean meats, eggs, legumes',
          'Include calorie-dense smoothies with protein powder',
          'Stay hydrated but avoid filling up on water before meals'
        ]
      };
    } else if (bmi < 25) {
      return {
        title: 'Food Recommendations for Healthy Weight',
        recommendations: [
          'Maintain balanced meals with all macronutrients',
          'Fill half your plate with vegetables and fruits',
          'Choose whole grains over refined carbohydrates',
          'Include lean proteins: chicken, fish, beans, tofu',
          'Limit processed foods and added sugars',
          'Stay hydrated with water throughout the day'
        ]
      };
    } else if (bmi < 30) {
      return {
        title: 'Food Recommendations for Overweight',
        recommendations: [
          'Create a moderate calorie deficit (500-750 calories/day)',
          'Focus on high-fiber foods: vegetables, fruits, whole grains',
          'Include lean proteins to maintain muscle mass',
          'Limit refined carbs and added sugars',
          'Practice portion control and mindful eating',
          'Stay hydrated - sometimes thirst is mistaken for hunger'
        ]
      };
    } else {
      return {
        title: 'Food Recommendations for Obese',
        recommendations: [
          'Work with a registered dietitian for personalized meal plan',
          'Focus on whole, unprocessed foods',
          'Create sustainable calorie deficit (consult healthcare provider)',
          'Include plenty of vegetables and lean proteins',
          'Limit or eliminate sugary drinks and processed snacks',
          'Practice portion control and track food intake initially'
        ]
      };
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBmiData(prev => ({
      ...prev,
      [name]: value
    }));
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
    <div className="space-y-6">
      {/* BMI Calculator Section */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          📊 BMI Calculator
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Unit System
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="unit"
                  value="metric"
                  checked={bmiData.unit === 'metric'}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                Metric (kg, cm)
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="unit"
                  value="imperial"
                  checked={bmiData.unit === 'imperial'}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                Imperial (lbs, inches)
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Weight ({bmiData.unit === 'metric' ? 'kg' : 'lbs'})
              </label>
              <input
                type="number"
                name="weight"
                value={bmiData.weight}
                onChange={handleInputChange}
                placeholder={bmiData.unit === 'metric' ? '70' : '150'}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Height ({bmiData.unit === 'metric' ? 'cm' : 'inches'})
              </label>
              <input
                type="number"
                name="height"
                value={bmiData.height}
                onChange={handleInputChange}
                placeholder={bmiData.unit === 'metric' ? '175' : '70'}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>

          <button
            onClick={calculateBMI}
            className="w-full md:w-auto px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold"
          >
            Calculate BMI
          </button>

          {bmiResult && (
            <div className={`mt-4 p-4 rounded-lg border-2 ${bmiResult.color}`}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-bold">Your BMI: {bmiResult.bmi}</h3>
                <span className="text-lg font-semibold">{bmiResult.category}</span>
              </div>
              <p className="text-sm">{bmiResult.status}</p>
            </div>
          )}

          {bmiResult && (
            <>
              {/* Fitness Recommendations */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="text-lg font-bold text-blue-800 mb-3">
                  💪 {getFitnessRecommendations(parseFloat(bmiResult.bmi)).title}
                </h3>
                <ul className="space-y-2">
                  {getFitnessRecommendations(parseFloat(bmiResult.bmi)).recommendations.map((rec, index) => (
                    <li key={index} className="text-sm text-blue-700 flex items-start">
                      <span className="mr-2">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Food Recommendations */}
              <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                <h3 className="text-lg font-bold text-green-800 mb-3">
                  🥗 {getFoodRecommendations(parseFloat(bmiResult.bmi)).title}
                </h3>
                <ul className="space-y-2">
                  {getFoodRecommendations(parseFloat(bmiResult.bmi)).recommendations.map((rec, index) => (
                    <li key={index} className="text-sm text-green-700 flex items-start">
                      <span className="mr-2">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Personalized Tips Section */}
      {todayLog ? (
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
      ) : (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            💡 Personalized Tips
          </h2>
          <p className="text-gray-500">
            Complete your daily check-in to get personalized wellness tips!
          </p>
        </div>
      )}
    </div>
  );
};

export default Recommendations;

