const sqlite3 = require('sqlite3').verbose();

// Open the database
const db = new sqlite3.Database('./eyetracking.db', sqlite3.OPEN_READONLY, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
        process.exit(1);
    }
    console.log('Connected to the eyetracking database');
});

// Query for all unique session IDs
db.all(`SELECT DISTINCT session_id, 
        COUNT(*) as data_points, 
        MIN(created_at) as first_record,
        MAX(created_at) as last_record 
        FROM eyetracking_data 
        GROUP BY session_id`, [], (err, rows) => {
    if (err) {
        console.error('Error querying database:', err.message);
    } else {
        console.log('Available eye tracking sessions:');
        console.log('-------------------------------');
        
        if (rows.length === 0) {
            console.log('No sessions found in the database.');
        } else {
            rows.forEach(row => {
                console.log(`Session ID: ${row.session_id}`);
                console.log(`Data points: ${row.data_points}`);
                console.log(`First record: ${row.first_record}`);
                console.log(`Last record: ${row.last_record}`);
                console.log('-------------------------------');
            });
        }
    }
    
    // Close the database connection
    db.close((err) => {
        if (err) {
            console.error('Error closing database:', err.message);
        } else {
            console.log('Database connection closed');
        }
    });
}); 