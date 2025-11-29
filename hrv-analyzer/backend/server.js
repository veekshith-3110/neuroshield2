/**
 * HRV Analyzer Backend Server
 * 
 * This server handles file uploads, parses HRV/heart rate data files,
 * calculates HRV metrics, and returns analytics.
 * 
 * Endpoints:
 * - POST /upload: Upload and process HRV/heart rate files
 * - GET /health: Health check endpoint
 */

const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { calculateHRV } = require('./utils/hrvCalculator');
const { parseCSV } = require('./utils/fileParsers');
const { parseFIT } = require('./utils/fileParsers');
const { parseGPX } = require('./utils/fileParsers');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors()); // Enable CORS for frontend
app.use(express.json());

// Configure multer for file uploads
// Store files temporarily in 'uploads' directory
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Only allow .csv, .fit, .gpx files
    const allowedTypes = ['.csv', '.fit', '.gpx'];
    const fileExt = path.extname(file.originalname).toLowerCase();
    
    if (allowedTypes.includes(fileExt)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`));
    }
  }
});

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'HRV Analyzer Backend is running' });
});

/**
 * File upload endpoint
 * 
 * Accepts .csv, .fit, or .gpx files containing heart rate/HRV data
 * Processes the file and returns calculated HRV metrics
 */
app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ 
        error: 'No file uploaded',
        message: 'Please select a file to upload'
      });
    }

    const filePath = req.file.path;
    const fileExtension = path.extname(req.file.originalname).toLowerCase();
    const fileName = req.file.originalname;

    console.log(`Processing file: ${fileName} (${fileExtension})`);

    let parsedData = null;

    // Parse file based on extension
    try {
      switch (fileExtension) {
        case '.csv':
          parsedData = await parseCSV(filePath);
          break;
        case '.fit':
          parsedData = await parseFIT(filePath);
          break;
        case '.gpx':
          parsedData = await parseGPX(filePath);
          break;
        default:
          throw new Error(`Unsupported file type: ${fileExtension}`);
      }
    } catch (parseError) {
      // Clean up uploaded file
      fs.unlinkSync(filePath);
      return res.status(400).json({
        error: 'File parsing error',
        message: parseError.message || 'Failed to parse file. Please check file format.'
      });
    }

    // Validate parsed data
    if (!parsedData || !parsedData.rrIntervals || parsedData.rrIntervals.length < 2) {
      // Clean up uploaded file
      fs.unlinkSync(filePath);
      return res.status(400).json({
        error: 'Insufficient data',
        message: 'File does not contain enough RR intervals or heart rate data for HRV calculation. Need at least 2 data points.'
      });
    }

    // Calculate HRV using RMSSD formula
    const hrv = calculateHRV(parsedData.rrIntervals);

    // Determine status based on HRV value
    let status = 'Stress';
    if (hrv > 70) {
      status = 'Relaxed';
    } else if (hrv >= 40) {
      status = 'Normal';
    }

    // Prepare response
    const response = {
      fileName: fileName,
      heartRates: parsedData.heartRates || [],
      rrIntervals: parsedData.rrIntervals,
      hrv: Math.round(hrv * 100) / 100, // Round to 2 decimal places
      status: status,
      timestamp: new Date().toISOString(),
      dataPoints: parsedData.rrIntervals.length
    };

    // Clean up uploaded file
    fs.unlinkSync(filePath);

    console.log(`✅ Successfully processed ${fileName}. HRV: ${response.hrv}, Status: ${status}`);

    res.json(response);

  } catch (error) {
    console.error('Error processing file:', error);
    
    // Clean up uploaded file if it exists
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting file:', unlinkError);
      }
    }

    res.status(500).json({
      error: 'Server error',
      message: error.message || 'An unexpected error occurred while processing the file'
    });
  }
});

/**
 * Error handling middleware
 */
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'File too large',
        message: 'File size exceeds 10MB limit'
      });
    }
  }

  res.status(500).json({
    error: 'Server error',
    message: error.message || 'An unexpected error occurred'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 HRV Analyzer Backend running on http://localhost:${PORT}`);
  console.log(`📁 Upload directory: ${uploadsDir}`);
});

