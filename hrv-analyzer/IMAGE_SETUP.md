# Image Setup Guide for HRV Analyzer

## Overview

The HRV Analyzer features animated 3D cards that showcase key features. Each card requires 3 images for the full effect.

## Required Images

Place all images in `frontend/public/images/` directory.

### 1. Upload Feature
- **upload-cover.jpg** (400x600px recommended)
  - Suggested: File upload interface, data files, document icons
  - Color theme: Indigo (#4f46e5)
  
- **upload-title.png** (300x100px recommended)
  - Text: "File Upload"
  - Transparent background preferred
  
- **upload-character.png** (200x300px recommended)
  - Suggested: Upload icon, cloud upload, person uploading files
  - Transparent background preferred

### 2. Analysis Feature
- **analysis-cover.jpg** (400x600px recommended)
  - Suggested: Heart rate monitor, ECG graph, HRV visualization, medical data
  - Color theme: Green (#10b981)
  
- **analysis-title.png** (300x100px recommended)
  - Text: "HRV Analysis"
  - Transparent background preferred
  
- **analysis-character.png** (200x300px recommended)
  - Suggested: Heart icon, graph icon, medical device, analytics symbol
  - Transparent background preferred

### 3. Charts Feature
- **charts-cover.jpg** (400x600px recommended)
  - Suggested: Data visualization, charts, graphs, analytics dashboard
  - Color theme: Amber (#f59e0b)
  
- **charts-title.png** (300x100px recommended)
  - Text: "Real-time Charts"
  - Transparent background preferred
  
- **charts-character.png** (200x300px recommended)
  - Suggested: Chart icon, graph icon, data visualization symbol
  - Transparent background preferred

### 4. Health Feature
- **health-cover.jpg** (400x600px recommended)
  - Suggested: Health status indicators, wellness, stress management, medical checkup
  - Color theme: Red (#ef4444)
  
- **health-title.png** (300x100px recommended)
  - Text: "Health Status"
  - Transparent background preferred
  
- **health-character.png** (200x300px recommended)
  - Suggested: Heart icon, health icon, status indicator, wellness symbol
  - Transparent background preferred

## Quick Setup Options

### Option 1: Use Placeholder Generator
1. Open `frontend/public/images/generate-placeholders.html` in a browser
2. Click "Generate" buttons for each feature
3. Click "Download All Images"
4. Save the downloaded images to `frontend/public/images/`

### Option 2: Use Free Stock Images

**Recommended Sources:**
- **Unsplash** (https://unsplash.com)
  - Search: "heart rate monitor", "data visualization", "file upload", "health status"
- **Pexels** (https://pexels.com)
  - Search: "medical data", "charts", "wellness", "upload"
- **Pixabay** (https://pixabay.com)
  - Search: "ECG", "analytics", "health", "files"

**Tips:**
- Use images with dark backgrounds for better contrast
- Ensure images are high quality (at least 400x600px for covers)
- Edit images to match the color themes if needed

### Option 3: Create Custom Images

Use design tools like:
- **Canva** (https://canva.com) - Free templates
- **Figma** (https://figma.com) - Professional design
- **Photoshop/GIMP** - Advanced editing

## Image Specifications

### Cover Images
- **Size**: 400x600px (2:3 ratio)
- **Format**: JPG or PNG
- **Style**: Should represent the feature visually
- **Background**: Dark or gradient backgrounds work best

### Title Images
- **Size**: 300x100px (3:1 ratio)
- **Format**: PNG with transparent background
- **Style**: Bold text with feature name
- **Font**: Modern, sans-serif font

### Character Images
- **Size**: 200x300px (2:3 ratio)
- **Format**: PNG with transparent background
- **Style**: Icon, illustration, or character representing the feature
- **Position**: Centered, will appear on hover

## Fallback Behavior

If images are missing, the component will:
1. **Cover images**: Use gradient background based on feature color
2. **Title images**: Display text fallback with feature name
3. **Character images**: Hide gracefully (not critical)

## Testing

After adding images:
1. Start the frontend: `cd frontend && npm start`
2. Navigate to "Features" section
3. Hover over cards to see 3D effect
4. Verify all images load correctly

## Troubleshooting

### Images not showing
- Check file names are exact (case-sensitive)
- Verify images are in `frontend/public/images/` directory
- Clear browser cache and reload
- Check browser console for 404 errors

### Images look stretched
- Ensure images match recommended dimensions
- Use `object-fit: cover` CSS property
- Maintain aspect ratios

### 3D effect not working
- Check browser supports CSS transforms
- Verify all CSS files are loaded
- Test in modern browsers (Chrome, Firefox, Safari, Edge)

## Color Themes Reference

- **Upload**: Indigo (#4f46e5)
- **Analysis**: Green (#10b981)
- **Charts**: Amber (#f59e0b)
- **Health**: Red (#ef4444)

Use these colors when creating or editing images for consistency.

