/**
 * File Parsers Utility
 * 
 * Parses different file formats (.csv, .fit, .gpx) to extract
 * heart rate and RR interval data.
 * 
 * Supported formats:
 * - CSV: Comma-separated values with heart rate or RR interval columns
 * - FIT: Garmin FIT file format (requires fit-file-parser)
 * - GPX: GPS Exchange Format (may contain heart rate data)
 */

const fs = require('fs');
const csv = require('csv-parser');
const FitParser = require('fit-file-parser').default;
// Note: GPX parsing is done manually via XML parsing (no external library needed)

/**
 * Parse CSV file
 * 
 * Expected CSV formats:
 * 1. With RR intervals: timestamp,rr_interval (or RR, RRInterval, etc.)
 * 2. With heart rate: timestamp,heart_rate (or HR, HeartRate, etc.)
 * 3. With both: timestamp,heart_rate,rr_interval
 * 
 * @param {string} filePath - Path to CSV file
 * @returns {Promise<Object>} Parsed data with heartRates and rrIntervals arrays
 */
async function parseCSV(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];
    const heartRates = [];
    const rrIntervals = [];

    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        results.push(row);
        
        // Try to find heart rate column (case-insensitive)
        let hr = null;
        let rr = null;

        // Check for heart rate in various column name formats
        const hrKeys = ['heart_rate', 'heartrate', 'hr', 'bpm', 'HeartRate', 'Heart_Rate'];
        for (const key of hrKeys) {
          if (row[key] !== undefined && row[key] !== null && row[key] !== '') {
            hr = parseFloat(row[key]);
            if (!isNaN(hr) && hr > 0) {
              heartRates.push(hr);
              break;
            }
          }
        }

        // Check for RR interval in various column name formats
        const rrKeys = ['rr_interval', 'rrinterval', 'rr', 'RR', 'RR_Interval', 'rrInterval'];
        for (const key of rrKeys) {
          if (row[key] !== undefined && row[key] !== null && row[key] !== '') {
            rr = parseFloat(row[key]);
            if (!isNaN(rr) && rr > 0) {
              rrIntervals.push(rr);
              break;
            }
          }
        }

        // If we have heart rate but no RR interval, calculate RR from HR
        // RR interval (ms) = 60000 / heart rate (bpm)
        if (hr && !rr && hr > 0) {
          rr = 60000 / hr;
          rrIntervals.push(rr);
        }
      })
      .on('end', () => {
        if (rrIntervals.length === 0 && heartRates.length === 0) {
          reject(new Error('No valid heart rate or RR interval data found in CSV. Please check column names (heart_rate, hr, rr_interval, rr).'));
        }

        // If we only have heart rates, convert all to RR intervals
        if (rrIntervals.length === 0 && heartRates.length > 0) {
          heartRates.forEach(hr => {
            if (hr > 0) {
              rrIntervals.push(60000 / hr);
            }
          });
        }

        resolve({
          heartRates: heartRates.length > 0 ? heartRates : null,
          rrIntervals: rrIntervals
        });
      })
      .on('error', (error) => {
        reject(new Error(`CSV parsing error: ${error.message}`));
      });
  });
}

/**
 * Parse FIT file (Garmin format)
 * 
 * FIT files contain structured binary data with heart rate and RR interval records
 * 
 * @param {string} filePath - Path to FIT file
 * @returns {Promise<Object>} Parsed data with heartRates and rrIntervals arrays
 */
async function parseFIT(filePath) {
  return new Promise((resolve, reject) => {
    try {
      const fitParser = new FitParser({
        force: true,
        speedUnit: 'ms',
        lengthUnit: 'm',
        temperatureUnit: 'celsius',
        elapsedRecordField: true,
        mode: 'list'
      });

      const fileBuffer = fs.readFileSync(filePath);

      fitParser.parse(fileBuffer, (error, data) => {
        if (error) {
          reject(new Error(`FIT file parsing error: ${error.message}`));
          return;
        }

        const heartRates = [];
        const rrIntervals = [];

        // Extract heart rate data from FIT records
        if (data.records) {
          data.records.forEach(record => {
            // Heart rate in bpm
            if (record.heart_rate !== undefined && record.heart_rate !== null) {
              heartRates.push(record.heart_rate);
              // Calculate RR interval from heart rate
              if (record.heart_rate > 0) {
                rrIntervals.push(60000 / record.heart_rate);
              }
            }

            // RR intervals in milliseconds (if directly available)
            if (record.rr !== undefined && record.rr !== null) {
              // FIT files may store RR intervals as array
              if (Array.isArray(record.rr)) {
                record.rr.forEach(rr => {
                  if (rr > 0) {
                    rrIntervals.push(rr);
                  }
                });
              } else if (record.rr > 0) {
                rrIntervals.push(record.rr);
              }
            }
          });
        }

        // Also check for HRV data in session or lap data
        if (data.sessions) {
          data.sessions.forEach(session => {
            if (session.avg_heart_rate) {
              heartRates.push(session.avg_heart_rate);
            }
          });
        }

        if (rrIntervals.length === 0 && heartRates.length === 0) {
          reject(new Error('No heart rate or RR interval data found in FIT file.'));
        }

        resolve({
          heartRates: heartRates.length > 0 ? heartRates : null,
          rrIntervals: rrIntervals.length > 0 ? rrIntervals : (heartRates.map(hr => 60000 / hr))
        });
      });
    } catch (error) {
      reject(new Error(`FIT file reading error: ${error.message}`));
    }
  });
}

/**
 * Parse GPX file
 * 
 * GPX files may contain heart rate extensions (GPX extensions)
 * 
 * @param {string} filePath - Path to GPX file
 * @returns {Promise<Object>} Parsed data with heartRates and rrIntervals arrays
 */
async function parseGPX(filePath) {
  return new Promise((resolve, reject) => {
    try {
      const gpxContent = fs.readFileSync(filePath, 'utf8');
      const heartRates = [];
      const rrIntervals = [];

      // Parse GPX XML to extract heart rate data
      // Look for heart rate in extensions: <extensions><gpxtpx:TrackPointExtension><gpxtpx:hr>
      const hrRegex = /<gpxtpx:hr>(\d+(?:\.\d+)?)<\/gpxtpx:hr>/gi;
      const hrMatches = gpxContent.matchAll(hrRegex);

      for (const match of hrMatches) {
        const hr = parseFloat(match[1]);
        if (!isNaN(hr) && hr > 0) {
          heartRates.push(hr);
          rrIntervals.push(60000 / hr);
        }
      }

      // Alternative: Look for heart rate in other extension formats
      if (heartRates.length === 0) {
        const altHrRegex = /<heartrate>(\d+(?:\.\d+)?)<\/heartrate>/gi;
        const altMatches = gpxContent.matchAll(altHrRegex);
        for (const match of altMatches) {
          const hr = parseFloat(match[1]);
          if (!isNaN(hr) && hr > 0) {
            heartRates.push(hr);
            rrIntervals.push(60000 / hr);
          }
        }
      }

      if (rrIntervals.length === 0) {
        reject(new Error('No heart rate data found in GPX file. GPX file may not contain heart rate extensions.'));
      }

      resolve({
        heartRates: heartRates.length > 0 ? heartRates : null,
        rrIntervals: rrIntervals
      });
    } catch (error) {
      reject(new Error(`GPX file parsing error: ${error.message}`));
    }
  });
}

module.exports = {
  parseCSV,
  parseFIT,
  parseGPX
};

