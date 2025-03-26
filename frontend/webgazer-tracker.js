// WebGazer tracker implementation
let lastDataSent = 0;
let scrollData = {
    scrollY: 0
};

// Generate a unique session ID
const sessionId = 'session_' + Math.random().toString(36).substr(2, 9);
console.log('Session ID:', sessionId);

// Get screen dimensions
const screenData = {
    width: window.innerWidth,
    height: window.innerHeight,
    devicePixelRatio: window.devicePixelRatio
};

// Calibration points
const calibrationPoints = [
    { x: 100, y: 100 },
    { x: window.innerWidth - 100, y: 100 },
    { x: window.innerWidth - 100, y: window.innerHeight - 100 },
    { x: 100, y: window.innerHeight - 100 },
    { x: window.innerWidth / 2, y: window.innerHeight / 2 }
];

let currentCalibrationPoint = 0;
let isCalibrating = false;

// Function to get element at coordinates
function getElementAtPoint(x, y) {
    const element = document.elementFromPoint(x, y);
    if (!element) return 'unknown';
    
    // Get element identifier (id, class, or tag name)
    if (element.id) return element.id;
    if (element.className) return element.className;
    return element.tagName.toLowerCase();
}

// Create calibration UI
function createCalibrationUI() {
    const calibrationDiv = document.createElement('div');
    calibrationDiv.id = 'calibration-ui';
    calibrationDiv.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        z-index: 9999;
        color: white;
    `;
    
    const instructions = document.createElement('p');
    instructions.textContent = 'Please look at the dot and click when you are looking directly at it.';
    instructions.style.marginBottom = '20px';
    
    const dot = document.createElement('div');
    dot.id = 'calibration-dot';
    dot.style.cssText = `
        width: 20px;
        height: 20px;
        background: #ff6ec4;
        border-radius: 50%;
        position: absolute;
        transition: all 0.3s ease;
    `;
    
    const progress = document.createElement('div');
    progress.id = 'calibration-progress';
    progress.style.cssText = `
        margin-top: 20px;
        font-size: 18px;
    `;
    
    calibrationDiv.appendChild(instructions);
    calibrationDiv.appendChild(dot);
    calibrationDiv.appendChild(progress);
    document.body.appendChild(calibrationDiv);
    
    return { dot, progress };
}

// Start calibration process
function startCalibration() {
    isCalibrating = true;
    const { dot, progress } = createCalibrationUI();
    
    function moveToNextPoint() {
        if (currentCalibrationPoint < calibrationPoints.length) {
            const point = calibrationPoints[currentCalibrationPoint];
            dot.style.left = `${point.x}px`;
            dot.style.top = `${point.y}px`;
            progress.textContent = `Calibration point ${currentCalibrationPoint + 1} of ${calibrationPoints.length}`;
        } else {
            finishCalibration();
        }
    }
    
    dot.addEventListener('click', () => {
        currentCalibrationPoint++;
        moveToNextPoint();
    });
    
    moveToNextPoint();
}

// Finish calibration
function finishCalibration() {
    const calibrationUI = document.getElementById('calibration-ui');
    if (calibrationUI) {
        calibrationUI.remove();
    }
    isCalibrating = false;
    console.log('Calibration completed!');
}

// Initialize WebGazer
function initWebGazer() {
    console.log('Initializing WebGazer...');
    // Start WebGazer
    webgazer.begin();
    
    // Set up gaze listener
    webgazer.setGazeListener(function(data, elapsedTime) {
        if (data == null) {
            console.log('No gaze data available yet...');
            return;
        }
        
        // Get current scroll position (only Y)
        scrollData.scrollY = window.scrollY;
        
        // Get current timestamp
        const currentTime = Date.now();
        
        // Send data every second
        if (currentTime - lastDataSent >= 1000) {
            // Get element at gaze point
            const element = getElementAtPoint(data.x, data.y);
            
            const gazeData = {
                x: data.x,
                y: data.y,
                screen_w: screenData.width,
                screen_h: screenData.height,
                scroll: scrollData.scrollY,
                timestamp: new Date(currentTime).toISOString(),
                session_id: sessionId,
                element: element
            };
            
            // Log data to console for testing
            console.log('=== Gaze Data Update ===');
            console.log('Coordinates:', `x: ${gazeData.x.toFixed(2)}, y: ${gazeData.y.toFixed(2)}`);
            console.log('Scroll Position:', gazeData.scroll);
            console.log('Screen Size:', `${gazeData.screen_w}x${gazeData.screen_h}`);
            console.log('Element:', gazeData.element);
            console.log('Session ID:', gazeData.session_id);
            console.log('Timestamp:', gazeData.timestamp);
            console.log('=====================');
            
            // Send data to backend
            sendGazeData(gazeData);
            lastDataSent = currentTime;
        }
    });
}

// Function to send gaze data to backend
async function sendGazeData(data) {
    try {
        console.log('Attempting to send data to backend...');
        const response = await fetch('http://localhost:3000/api/eye-tracking', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            console.error('Failed to send gaze data:', response.status, response.statusText);
        } else {
            console.log('Data sent successfully!');
        }
    } catch (error) {
        console.error('Error sending gaze data:', error.message);
    }
}

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('Page loaded, adding WebGazer script...');
    // Add WebGazer script dynamically
    const script = document.createElement('script');
    script.src = 'https://webgazer.cs.brown.edu/webgazer.js';
    script.type = 'text/javascript';
    document.head.appendChild(script);
    
    // Initialize WebGazer after script loads
    script.onload = function() {
        initWebGazer();
        // Start calibration after a short delay to ensure WebGazer is ready
        setTimeout(startCalibration, 2000);
    };
}); 