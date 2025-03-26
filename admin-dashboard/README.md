# Eye Tracking API Test Frontend

This is a simple frontend application for testing the Eye Tracking API.

## Features

- Submit test eye tracking data to the API
- View and visualize eye tracking data by session ID
- Interactive visualization of eye gaze points
- Heatmap visualization to identify focus areas
- Combined visualization of multiple sessions in a single heatmap

## Setup

1. Make sure the backend server is running at `http://localhost:3000`
2. Open `index.html` in a web browser

## Usage

### Submitting Test Data

1. Fill in the form with eye tracking coordinates and metadata
2. Click "Submit Data" 
3. The response will be displayed below the form

### Viewing Data for a Single Session

1. Enter a session ID in the "View Session Data" tab
2. Click "Fetch Data"
3. Data will be displayed in a table and visualized in the area below
4. Choose between "Points" or "Heatmap" visualization options

### Viewing Combined Data for All Sessions

1. Go to the "View All Sessions" tab
2. Click "Fetch All Sessions Data" to load all eye tracking data
3. Use the checkboxes to select which sessions to include in the combined visualization
4. Click "Update Visualization" to refresh the heatmap with only the selected sessions
5. The combined heatmap will show eye tracking data from all selected sessions

## Visualization

### Points View
Shows eye tracking points as blue dots, with the position scaled to fit the visualization area. Hover over a point to see details about that data point.

### Heatmap View
Displays eye tracking data as a heatmap, highlighting areas with more concentrated gaze points. This helps identify focal areas and patterns in the eye tracking data.

### Combined Sessions Heatmap
Merges eye tracking data from multiple sessions into a single heatmap visualization, allowing you to identify common patterns across different sessions.

## CORS Note

If you encounter CORS issues, you may need to add CORS middleware to the backend API. 

In the backend directory, run:
```
npm install cors
```

Then add to your backend `app.js`:
```javascript
const cors = require('cors');
app.use(cors());
``` 