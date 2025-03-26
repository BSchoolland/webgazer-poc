const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all routes
app.use(cors());

// Database setup
const db = new sqlite3.Database('./eyetracking.db', (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database');
        
        // Create table if not exists
        db.run(`CREATE TABLE IF NOT EXISTS eyetracking_data (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            x REAL NOT NULL,
            y REAL NOT NULL,
            screen_w REAL NOT NULL,
            screen_h REAL NOT NULL,
            scroll, REAL,
            timestamp TEXT NOT NULL,
            session_id TEXT NOT NULL,
            element TEXT NOT NULL, 
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`, (err) => {
            if (err) {
                console.error('Error creating table', err.message);
            } else {
                console.log('Eyetracking data table ready');
            }
        });
    }
});

// Middleware to parse JSON bodies
app.use(express.json());

// Sample route
app.get('/', (req, res) => {
    res.send('Hello, World!');
});

app.post('/api/eye-tracking', (req, res) => {
    const { 
        x,
        y,
        screen_w,
        screen_h,
        scroll,
        timestamp,
        session_id,
        element
    } = req.body;

    console.log(`Eye tracking data received: x=${x}, y=${y} timestamp=${timestamp} session_id=${session_id}`);
    
    // Insert data into database
    db.run(
        `INSERT INTO eyetracking_data (x, y, screen_w, screen_h, scroll, timestamp, session_id, element) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [x, y, screen_w, screen_h, scroll, timestamp, session_id, element],
        function(err) {
            if (err) {
                console.error('Error saving eye tracking data', err.message);
                return res.status(500).json({ error: 'Failed to save eye tracking data' });
            }
            
            res.json({ 
                message: 'Eye tracking data received and stored',
                dataId: this.lastID
            });
        }
    );
});

// Add route to get all eye tracking data for a session
app.get('/api/eye-tracking/:sessionId', (req, res) => {
    const sessionId = req.params.sessionId;
    
    db.all(
        `SELECT * FROM eyetracking_data WHERE session_id = ? ORDER BY timestamp`,
        [sessionId],
        (err, rows) => {
            if (err) {
                console.error('Error fetching eye tracking data', err.message);
                return res.status(500).json({ error: 'Failed to fetch eye tracking data' });
            }
            
            res.json(rows);
        }
    );
});

// Add route to get a list of all sessions
app.get('/api/sessions', (req, res) => {
    db.all(
        `SELECT DISTINCT session_id FROM eyetracking_data ORDER BY session_id`,
        (err, rows) => {
            if (err) {
                console.error('Error fetching sessions', err.message);
                return res.status(500).json({ error: 'Failed to fetch sessions' });
            }
            
            res.json(rows.map(row => row.session_id));
        }
    );
});

// Add route to get all eye tracking data across all sessions
app.get('/api/eye-tracking', (req, res) => {
    db.all(
        `SELECT * FROM eyetracking_data ORDER BY timestamp`,
        (err, rows) => {
            if (err) {
                console.error('Error fetching all eye tracking data', err.message);
                return res.status(500).json({ error: 'Failed to fetch eye tracking data' });
            }
            
            res.json(rows);
        }
    );
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

// Close database connection when app terminates
process.on('SIGINT', () => {
    db.close((err) => {
        if (err) {
            console.error('Error closing database', err.message);
        } else {
            console.log('Database connection closed');
        }
        process.exit(0);
    });
});
