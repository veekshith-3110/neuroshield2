/**
 * Generate personalized recovery tips based on burnout risk score and data
 */
export function generateTips(riskScore, sleep, screenTime, mood) {
  const tips = [];

  // Sleep-related tips
  if (sleep < 6) {
    tips.push({
      id: 'sleep-1',
      category: 'Body',
      title: 'Improve Sleep Quality',
      description: 'Aim for 7-9 hours of sleep tonight. Try a bedtime routine.',
      icon: '🌙'
    });
  }

  // Screen time tips
  if (screenTime > 6) {
    tips.push({
      id: 'screen-1',
      category: 'Digital Detox',
      title: 'Take a Screen Break',
      description: 'No screens for 30 minutes. Go for a walk or read a book.',
      icon: '📱'
    });
    
    if (screenTime > 8) {
      tips.push({
        id: 'screen-2',
        category: 'Digital Detox',
        title: 'Blue Light Filter',
        description: 'Enable night mode on your devices to reduce eye strain.',
        icon: '👓'
      });
    }
  }

  // Mood-based tips
  if (mood === 'Stressed' || mood === 'Anxious' || mood === 'Overwhelmed') {
    tips.push({
      id: 'mind-1',
      category: 'Mind',
      title: '10-Minute Meditation',
      description: 'Take a moment to breathe deeply and clear your mind.',
      icon: '🧘'
    });
    
    tips.push({
      id: 'mind-2',
      category: 'Mind',
      title: 'Journal Your Thoughts',
      description: 'Write down what\'s on your mind to release tension.',
      icon: '📝'
    });
  }

  // General wellness tips
  tips.push({
    id: 'body-1',
    category: 'Body',
    title: 'Stay Hydrated',
    description: 'Drink a glass of water right now!',
    icon: '💧'
  });

  if (riskScore >= 4) {
    tips.push({
      id: 'body-2',
      category: 'Body',
      title: 'Stretch Break',
      description: 'Do 5 minutes of stretching to release tension.',
      icon: '🤸'
    });
  }

  // Low risk tips (encouragement)
  if (riskScore <= 3) {
    tips.push({
      id: 'mind-3',
      category: 'Mind',
      title: 'Gratitude Practice',
      description: 'Write down 3 things you\'re grateful for today.',
      icon: '🙏'
    });
  }

  // Limit to 5 tips
  return tips.slice(0, 5);
}

