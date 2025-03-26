document.addEventListener('DOMContentLoaded', () => {
    // API endpoint base URL
    const API_BASE_URL = 'http://localhost:3000/api';
    
    // Tab switching functionality
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabName = button.getAttribute('data-tab');
            
            // Update active tab button
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Update active tab content
            tabContents.forEach(content => content.classList.remove('active'));
            document.getElementById(`${tabName}-tab`).classList.add('active');
            
            // Load sessions list when switching to the "all" tab
            if (tabName === 'all') {
                loadSessionsList();
            }
        });
    });
    
    // Form submission for eye tracking data
    const eyeTrackingForm = document.getElementById('eyetracking-form');
    const submitResult = document.getElementById('submit-result');
    
    // Generate a random session ID if not provided
    const sessionIdInput = document.getElementById('session_id');
    if (!sessionIdInput.value) {
        sessionIdInput.value = 'test-' + Math.random().toString(36).substring(2, 10);
    }
    
    eyeTrackingForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = {
            x: parseFloat(document.getElementById('x').value),
            y: parseFloat(document.getElementById('y').value),
            screen_w: parseFloat(document.getElementById('screen_w').value),
            screen_h: parseFloat(document.getElementById('screen_h').value),
            scroll: parseFloat(document.getElementById('scroll').value || 0),
            timestamp: new Date().toISOString(),
            session_id: document.getElementById('session_id').value,
            element: document.getElementById('element').value
        };
        
        try {
            const response = await fetch(`${API_BASE_URL}/eye-tracking`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            
            const data = await response.json();
            
            if (response.ok) {
                submitResult.textContent = `Success! Data saved with ID: ${data.dataId}`;
                submitResult.classList.add('success');
                submitResult.classList.remove('error');
            } else {
                throw new Error(data.error || 'Failed to submit data');
            }
        } catch (error) {
            submitResult.textContent = `Error: ${error.message}`;
            submitResult.classList.add('error');
            submitResult.classList.remove('success');
        }
        
        submitResult.style.display = 'block';
        setTimeout(() => {
            submitResult.style.display = 'none';
            submitResult.classList.remove('success', 'error');
        }, 5000);
    });
    
    // Fetch data functionality
    const fetchDataBtn = document.getElementById('fetch-data-btn');
    const fetchSessionIdInput = document.getElementById('fetch-session-id');
    const dataTableBody = document.getElementById('data-table-body');
    const visualizationArea = document.getElementById('visualization-area');
    const visTypeRadios = document.querySelectorAll('input[name="vis-type"]');
    
    // Track the current data and visualization type
    let currentData = [];
    let currentVisType = 'points';
    
    // Listen for visualization type changes
    visTypeRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            if (radio.checked) {
                currentVisType = radio.value;
                if (currentData.length > 0) {
                    visualizeData(currentData, currentVisType);
                }
            }
        });
    });
    
    fetchDataBtn.addEventListener('click', async () => {
        const sessionId = fetchSessionIdInput.value.trim();
        if (!sessionId) {
            alert('Please enter a session ID');
            return;
        }
        
        try {
            const response = await fetch(`${API_BASE_URL}/eye-tracking/${sessionId}`);
            const data = await response.json();
            
            if (response.ok && Array.isArray(data)) {
                // Clear previous data
                dataTableBody.innerHTML = '';
                visualizationArea.innerHTML = '';
                
                if (data.length === 0) {
                    dataTableBody.innerHTML = '<tr><td colspan="8">No data found for this session ID</td></tr>';
                    return;
                }
                
                // Store current data
                currentData = data;
                
                // Populate table with data
                data.forEach(item => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${item.id}</td>
                        <td>${item.x}</td>
                        <td>${item.y}</td>
                        <td>${item.screen_w}</td>
                        <td>${item.screen_h}</td>
                        <td>${item.scroll || 0}</td>
                        <td>${new Date(item.timestamp).toLocaleString()}</td>
                        <td>${item.element}</td>
                    `;
                    dataTableBody.appendChild(row);
                });
                
                // Get the selected visualization type
                currentVisType = document.querySelector('input[name="vis-type"]:checked').value;
                
                // Visualize eye tracking data
                visualizeData(data, currentVisType);
            } else {
                throw new Error(data.error || 'Failed to fetch data');
            }
        } catch (error) {
            dataTableBody.innerHTML = `<tr><td colspan="8">Error: ${error.message}</td></tr>`;
            visualizationArea.innerHTML = '';
        }
    });
    
    // Function to choose visualization method based on type
    function visualizeData(data, visualizationType) {
        // Clear previous visualization
        visualizationArea.innerHTML = '';
        
        if (visualizationType === 'points') {
            visualizeEyeTrackingPoints(data);
        } else if (visualizationType === 'heatmap') {
            visualizeEyeTrackingHeatmap(data);
        }
    }
    
    // Function to visualize eye tracking data as points
    function visualizeEyeTrackingPoints(data) {
        // Calculate scale factor for visualization
        const maxScreenWidth = Math.max(...data.map(item => item.screen_w));
        const maxScreenHeight = Math.max(...data.map(item => item.screen_h));
        
        const visualizationWidth = visualizationArea.clientWidth;
        const visualizationHeight = visualizationArea.clientHeight;
        
        const scaleX = visualizationWidth / maxScreenWidth;
        const scaleY = visualizationHeight / maxScreenHeight;
        
        // Create visualization elements
        data.forEach((item, index) => {
            const point = document.createElement('div');
            point.className = 'eye-point';
            
            // Calculate scaled position
            const x = item.x * scaleX;
            const y = item.y * scaleY;
            
            // Position the point
            point.style.left = `${x}px`;
            point.style.top = `${y}px`;
            
            // Add tooltip with info
            const tooltip = document.createElement('div');
            tooltip.className = 'tooltip';
            tooltip.textContent = `ID: ${item.id}, Element: ${item.element}, Time: ${new Date(item.timestamp).toLocaleTimeString()}`;
            point.appendChild(tooltip);
            
            // Add sequence number
            point.setAttribute('data-index', index + 1);
            
            // Add to visualization
            visualizationArea.appendChild(point);
            
            // Animate points appearing in sequence
            setTimeout(() => {
                point.style.opacity = '1';
            }, index * 100);
        });
        
        // Add legend
        const legend = document.createElement('div');
        legend.style.position = 'absolute';
        legend.style.bottom = '10px';
        legend.style.right = '10px';
        legend.style.background = 'rgba(255, 255, 255, 0.8)';
        legend.style.padding = '5px';
        legend.style.borderRadius = '4px';
        legend.style.fontSize = '12px';
        legend.textContent = `Showing ${data.length} eye tracking points (scaled to fit)`;
        visualizationArea.appendChild(legend);
    }
    
    // Function to visualize eye tracking data as a heatmap
    function visualizeEyeTrackingHeatmap(data) {
        // Calculate scale factor for visualization
        const maxScreenWidth = Math.max(...data.map(item => item.screen_w));
        const maxScreenHeight = Math.max(...data.map(item => item.screen_h));
        
        const visualizationWidth = visualizationArea.clientWidth;
        const visualizationHeight = visualizationArea.clientHeight;
        
        const scaleX = visualizationWidth / maxScreenWidth;
        const scaleY = visualizationHeight / maxScreenHeight;
        
        // Create heatmap container
        const heatmapContainer = document.createElement('div');
        heatmapContainer.style.width = '100%';
        heatmapContainer.style.height = '100%';
        heatmapContainer.style.position = 'relative';
        visualizationArea.appendChild(heatmapContainer);
        
        // Initialize heatmap.js
        const heatmapInstance = h337.create({
            container: heatmapContainer,
            radius: 30,
            maxOpacity: 0.6,
            minOpacity: 0,
            blur: 0.75
        });
        
        // Prepare data points for heatmap
        const heatmapData = {
            max: data.length,
            min: 0,
            data: data.map(item => ({
                x: Math.round(item.x * scaleX),
                y: Math.round(item.y * scaleY),
                value: 1  // Each point has equal weight
            }))
        };
        
        // Add data to heatmap
        heatmapInstance.setData(heatmapData);
        
        // Add legend
        const legend = document.createElement('div');
        legend.style.position = 'absolute';
        legend.style.bottom = '10px';
        legend.style.right = '10px';
        legend.style.background = 'rgba(255, 255, 255, 0.8)';
        legend.style.padding = '5px';
        legend.style.borderRadius = '4px';
        legend.style.fontSize = '12px';
        legend.style.zIndex = '100';
        legend.textContent = `Heatmap of ${data.length} eye tracking points`;
        visualizationArea.appendChild(legend);
    }
    
    // All Sessions Tab Functionality
    const fetchAllBtn = document.getElementById('fetch-all-btn');
    const updateVizBtn = document.getElementById('update-viz-btn');
    const sessionsList = document.getElementById('sessions-list');
    const allVisualizationArea = document.getElementById('all-visualization-area');
    const totalPointsElement = document.getElementById('total-points');
    const totalSessionsElement = document.getElementById('total-sessions');
    
    // Store all session data
    let allSessionsData = [];
    let availableSessions = [];
    
    // Fetch list of all available sessions
    async function loadSessionsList() {
        try {
            sessionsList.innerHTML = '<div class="loading-sessions">Loading sessions...</div>';
            
            const response = await fetch(`${API_BASE_URL}/sessions`);
            const sessions = await response.json();
            
            if (response.ok && Array.isArray(sessions)) {
                availableSessions = sessions;
                
                if (sessions.length === 0) {
                    sessionsList.innerHTML = '<div>No sessions available</div>';
                    return;
                }
                
                // Populate sessions with checkboxes
                sessionsList.innerHTML = '';
                sessions.forEach(sessionId => {
                    const sessionCheckbox = document.createElement('div');
                    sessionCheckbox.className = 'session-checkbox';
                    sessionCheckbox.innerHTML = `
                        <input type="checkbox" id="session-${sessionId}" value="${sessionId}" checked>
                        <label for="session-${sessionId}">${sessionId}</label>
                    `;
                    sessionsList.appendChild(sessionCheckbox);
                });
                
                totalSessionsElement.textContent = sessions.length;
            } else {
                throw new Error('Failed to fetch sessions');
            }
        } catch (error) {
            sessionsList.innerHTML = `<div>Error: ${error.message}</div>`;
        }
    }
    
    // Fetch all eye tracking data
    fetchAllBtn.addEventListener('click', async () => {
        try {
            allVisualizationArea.innerHTML = '<div class="loading-sessions">Loading all data...</div>';
            
            const response = await fetch(`${API_BASE_URL}/eye-tracking`);
            const data = await response.json();
            
            if (response.ok && Array.isArray(data)) {
                allSessionsData = data;
                
                if (data.length === 0) {
                    allVisualizationArea.innerHTML = '<div class="no-data">No eye tracking data available</div>';
                    totalPointsElement.textContent = '0';
                    return;
                }
                
                totalPointsElement.textContent = data.length;
                
                // Get all selected sessions
                const selectedSessions = Array.from(document.querySelectorAll('.session-checkbox input:checked'))
                    .map(checkbox => checkbox.value);
                
                // Filter data by selected sessions
                const filteredData = data.filter(item => selectedSessions.includes(item.session_id));
                
                // Visualize the combined data
                visualizeCombinedData(filteredData);
            } else {
                throw new Error('Failed to fetch eye tracking data');
            }
        } catch (error) {
            allVisualizationArea.innerHTML = `<div class="error">Error: ${error.message}</div>`;
        }
    });
    
    // Update visualization based on selected sessions
    updateVizBtn.addEventListener('click', () => {
        if (allSessionsData.length === 0) {
            alert('Please fetch all sessions data first');
            return;
        }
        
        // Get all selected sessions
        const selectedSessions = Array.from(document.querySelectorAll('.session-checkbox input:checked'))
            .map(checkbox => checkbox.value);
        
        if (selectedSessions.length === 0) {
            alert('Please select at least one session');
            return;
        }
        
        // Filter data by selected sessions
        const filteredData = allSessionsData.filter(item => selectedSessions.includes(item.session_id));
        
        totalPointsElement.textContent = filteredData.length;
        totalSessionsElement.textContent = selectedSessions.length;
        
        // Visualize the filtered data
        visualizeCombinedData(filteredData);
    });
    
    // Function to visualize combined data from multiple sessions
    function visualizeCombinedData(data) {
        // Clear previous visualization
        allVisualizationArea.innerHTML = '';
        
        if (data.length === 0) {
            allVisualizationArea.innerHTML = '<div class="no-data">No data for selected sessions</div>';
            return;
        }
        
        // Calculate scale factor for visualization
        const maxScreenWidth = Math.max(...data.map(item => item.screen_w));
        const maxScreenHeight = Math.max(...data.map(item => item.screen_h));
        
        const visualizationWidth = allVisualizationArea.clientWidth;
        const visualizationHeight = allVisualizationArea.clientHeight;
        
        const scaleX = visualizationWidth / maxScreenWidth;
        const scaleY = visualizationHeight / maxScreenHeight;
        
        // Create heatmap container
        const heatmapContainer = document.createElement('div');
        heatmapContainer.style.width = '100%';
        heatmapContainer.style.height = '100%';
        heatmapContainer.style.position = 'relative';
        allVisualizationArea.appendChild(heatmapContainer);
        
        // Initialize heatmap.js
        const heatmapInstance = h337.create({
            container: heatmapContainer,
            radius: 30,
            maxOpacity: 0.6,
            minOpacity: 0,
            blur: 0.85
        });
        
        // Prepare data points for heatmap
        const heatmapData = {
            max: data.length,
            min: 0,
            data: data.map(item => ({
                x: Math.round(item.x * scaleX),
                y: Math.round(item.y * scaleY),
                value: 1  // Each point has equal weight
            }))
        };
        
        // Add data to heatmap
        heatmapInstance.setData(heatmapData);
        
        // Group sessions by color for legend
        const sessions = [...new Set(data.map(item => item.session_id))];
        
        // Add legend
        const legend = document.createElement('div');
        legend.style.position = 'absolute';
        legend.style.bottom = '10px';
        legend.style.right = '10px';
        legend.style.background = 'rgba(255, 255, 255, 0.8)';
        legend.style.padding = '10px';
        legend.style.borderRadius = '4px';
        legend.style.fontSize = '12px';
        legend.style.zIndex = '100';
        legend.style.maxWidth = '300px';
        legend.innerHTML = `
            <div><strong>Combined Heatmap</strong></div>
            <div>Total points: ${data.length}</div>
            <div>Sessions: ${sessions.length}</div>
            <div style="margin-top: 5px; font-size: 11px; max-height: 100px; overflow-y: auto;">
                ${sessions.map(session => `<div>${session}</div>`).join('')}
            </div>
        `;
        allVisualizationArea.appendChild(legend);
    }
}); 