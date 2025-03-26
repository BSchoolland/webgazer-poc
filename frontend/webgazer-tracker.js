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

// Function to get element at coordinates
function getElementAtPoint(x, y) {
    const element = document.elementFromPoint(x, y);
    if (!element) return 'unknown';
    
    // Get element identifier (id, class, or tag name)
    if (element.id) return element.id;
    if (element.className) return element.className;
    return element.tagName.toLowerCase();
}

// Initialize WebGazer
function initWebGazer() {
    console.log('Initializing WebGazer...');
    
    // Configure WebGazer for better tracking
    webgazer.setRegression('ridge')
        .setTracker('TFFacemesh')
        .setGazeListener(function(data, elapsedTime) {
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
        })
        .begin();
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
    script.onload = initWebGazer;
}); 