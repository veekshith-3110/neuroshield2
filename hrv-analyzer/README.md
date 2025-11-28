# HRV Analyzer

A complete web application for analyzing Heart Rate Variability (HRV) and heart rate data from various file formats.

## Features

- 📤 **File Upload**: Drag & drop support for .csv, .fit, and .gpx files
- 📊 **HRV Calculation**: RMSSD formula for accurate HRV analysis
- 📈 **Interactive Dashboards**: Multiple charts for heart rate and RR intervals
- 🎨 **Status Indicators**: Color-coded status (Relaxed/Normal/Stress)
- 💾 **History Management**: Save and view past analyses (localStorage)
- ⚡ **Real-time Processing**: Fast file parsing and calculation

## Tech Stack

- **Frontend**: React + Tailwind CSS + Recharts
- **Backend**: Node.js + Express
- **File Parsing**: csv-parser, fit-file-parser, gpx-parser

## Installation

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Backend Setup

```bash
cd backend
npm install
npm start
```

The backend will run on `http://localhost:5000`

### Frontend Setup

```bash
cd frontend
npm install
npm start
```

The frontend will run on `http://localhost:3000`

## Usage

1. **Start both servers** (backend on port 5000, frontend on port 3000)
2. **Open the app** in your browser at `http://localhost:3000`
3. **Upload a file**:
   - Drag & drop a .csv, .fit, or .gpx file
   - Or click to browse and select a file
4. **View results**:
   - HRV value with status indicator
   - Heart rate over time chart
   - RR interval graph
   - Statistics summary

## File Format Requirements

### CSV Format

Your CSV file should contain one of these column combinations:

**Option 1: With RR Intervals**
```csv
timestamp,rr_interval
2024-01-01 10:00:00,850
2024-01-01 10:00:01,820
2024-01-01 10:00:02,880
```

**Option 2: With Heart Rate**
```csv
timestamp,heart_rate
2024-01-01 10:00:00,70
2024-01-01 10:00:01,73
2024-01-01 10:00:02,68
```

**Supported column names:**
- Heart Rate: `heart_rate`, `heartrate`, `hr`, `bpm`, `HeartRate`
- RR Intervals: `rr_interval`, `rrinterval`, `rr`, `RR`, `RR_Interval`

### FIT Format

Garmin FIT files are automatically parsed to extract heart rate and RR interval data.

### GPX Format

GPX files with heart rate extensions (GPXTPX) are supported.

## HRV Interpretation

- **🟢 Relaxed (HRV > 70ms)**: Good recovery, low stress
- **🟡 Normal (40-70ms)**: Moderate stress, normal state
- **🔴 Stress (HRV < 40ms)**: High stress, poor recovery

## Sample Data

A sample CSV file (`sample-hrv-data.csv`) is included in the `backend/samples/` directory for testing.

## Project Structure

```
hrv-analyzer/
├── backend/
│   ├── server.js              # Express server
│   ├── utils/
│   │   ├── hrvCalculator.js  # HRV calculation logic
│   │   └── fileParsers.js     # File parsing utilities
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.jsx            # Main app component
│   │   ├── components/
│   │   │   ├── Upload.js      # File upload component
│   │   │   └── HrvDashboard.js # Analytics dashboard
│   │   └── index.js
│   └── package.json
└── README.md
```

## API Endpoints

### POST /upload

Upload and process HRV/heart rate files.

**Request:**
- Method: POST
- Content-Type: multipart/form-data
- Body: file (csv, fit, or gpx)

**Response:**
```json
{
  "fileName": "sample.csv",
  "heartRates": [70, 73, 68, ...],
  "rrIntervals": [857, 822, 882, ...],
  "hrv": 45.23,
  "status": "Normal",
  "timestamp": "2024-01-01T10:00:00.000Z",
  "dataPoints": 100
}
```

### GET /health

Health check endpoint.

**Response:**
```json
{
  "status": "OK",
  "message": "HRV Analyzer Backend is running"
}
```

## Error Handling

The application handles various error scenarios:

- Invalid file types
- File size limits (10MB)
- Missing or invalid data
- Server connection errors
- File parsing errors

## Development

### Running in Development Mode

**Backend (with auto-reload):**
```bash
cd backend
npm run dev  # Uses nodemon
```

**Frontend:**
```bash
cd frontend
npm start  # Auto-reloads on changes
```

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

