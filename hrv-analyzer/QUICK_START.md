# Quick Start Guide

## Installation & Setup

### 1. Install Backend Dependencies

```bash
cd hrv-analyzer/backend
npm install
```

### 2. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

## Running the Application

### Option 1: Run Both Servers (Recommended)

**Terminal 1 - Backend:**
```bash
cd hrv-analyzer/backend
npm start
```
Backend will run on `http://localhost:5000`

**Terminal 2 - Frontend:**
```bash
cd hrv-analyzer/frontend
npm start
```
Frontend will automatically open at `http://localhost:3000`

### Option 2: Development Mode (Auto-reload)

**Terminal 1 - Backend (with nodemon):**
```bash
cd hrv-analyzer/backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd hrv-analyzer/frontend
npm start
```

## Testing with Sample Data

1. Use the sample CSV file provided: `backend/samples/sample-hrv-data.csv`
2. Upload it through the web interface
3. View the HRV analysis results

## File Format Examples

### CSV with Heart Rate
```csv
timestamp,heart_rate
2024-01-01 10:00:00,70
2024-01-01 10:00:01,73
2024-01-01 10:00:02,68
```

### CSV with RR Intervals
```csv
timestamp,rr_interval
2024-01-01 10:00:00,857
2024-01-01 10:00:01,822
2024-01-01 10:00:02,882
```

## Troubleshooting

### Backend won't start
- Check if port 5000 is already in use
- Make sure all dependencies are installed: `npm install`

### Frontend can't connect to backend
- Ensure backend is running on port 5000
- Check browser console for CORS errors
- Verify proxy setting in `frontend/package.json`

### File upload fails
- Check file size (max 10MB)
- Verify file format (.csv, .fit, or .gpx)
- Ensure file contains valid heart rate or RR interval data

### Charts not displaying
- Check browser console for errors
- Verify Recharts is installed: `npm install recharts`
- Clear browser cache and reload

## Next Steps

- Customize HRV thresholds in `backend/utils/hrvCalculator.js`
- Add more chart types in `frontend/src/components/HrvDashboard.js`
- Extend file format support in `backend/utils/fileParsers.js`

