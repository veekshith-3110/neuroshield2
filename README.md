# 🔥 Digital Burnout Early-Warning System

A web-based wellness application designed to detect early signs of digital burnout in Gen Z users by analyzing self-reported behavioral data like screen time, sleep hours, mood, and daily activities.

## ✨ Features

- **Login System**: Beautiful password input with light effect + Google OAuth integration
- **Daily Check-In System**: Track sleep, screen time, and mood
- **Burnout Risk Analyzer**: Real-time risk score calculation
- **Gamified Dashboard**: Health bars, trend charts, and mood distribution
- **Personalized Microtasks**: Recovery tips based on your data
- **Offline Support**: Works completely offline with localStorage
- **PWA Ready**: Installable on mobile devices

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Nexathon
```

2. Install dependencies:
```bash
npm install
```

3. (Optional) Set up Google OAuth:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Enable Google+ API
   - Go to Credentials → Create Credentials → OAuth client ID
   - Choose "Web application"
   - Add authorized JavaScript origins: `http://localhost:3000` (for development)
   - Copy your Client ID
   - Create a `.env` file in the root directory:
   ```
   REACT_APP_GOOGLE_CLIENT_ID=your_client_id_here
   ```
   - Note: Google Sign-In will show a message if Client ID is not configured, but email/password login will still work

4. Start the development server:
```bash
npm start
```

The app will open at `http://localhost:3000`

### Build for Production

```bash
npm run build
```

## 🧮 Burnout Risk Calculation

The risk score is calculated based on:
- **Sleep < 6 hrs**: +3 risk
- **Sleep 6-7 hrs**: +1 risk
- **Screen Time > 8 hrs**: +3 risk
- **Screen Time 6-8 hrs**: +2 risk
- **Screen Time 4-6 hrs**: +1 risk
- **Mood = "Stressed"**: +3 risk
- **Mood = "Tired"**: +2 risk
- **Mood = "Anxious"**: +2 risk
- **Mood = "Overwhelmed"**: +3 risk

## 📊 Data Storage

All data is stored locally in your browser's localStorage. No data is sent to any server, ensuring complete privacy.

## 🎮 Gamification

- **Streaks**: Track consecutive low-risk days
- **Badges**: Earn achievements like "Digital Detox Champ" and "Wellness Warrior"
- **Task Completion**: Complete personalized recovery tips

## 🛠️ Tech Stack

- React.js
- Tailwind CSS
- Recharts (for data visualization)
- React Context API (state management)
- PWA (Progressive Web App)

## 📱 PWA Support

The app is installable as a Progressive Web App. When you visit the site on a mobile device, you'll be prompted to install it to your home screen.

## 🌐 Deployment

The app can be deployed to:
- **Vercel**: `vercel deploy`
- **Netlify**: Drag and drop the `build` folder
- **GitHub Pages**: Use `gh-pages` package

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

Built for Gen Z digital wellness and burnout prevention.

