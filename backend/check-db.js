const sqlite3 = require('sqlite3').verbose();

// Open the database
const db = new sqlite3.Database('./eyetracking.db', (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
        process.exit(1);
    }
    console.log('Connected to the eyetracking database');
});

// Check if the table exists and show its schema
db.get(`SELECT name FROM sqlite_master WHERE type='table' AND name='eyetracking_data'`, [], (err, row) => {
    if (err) {
        console.error('Error checking table existence:', err.message);
    } else if (!row) {
        console.log('The eyetracking_data table does not exist');
    } else {
        console.log('The eyetracking_data table exists');
        
        // Get table info
        db.all(`PRAGMA table_info(eyetracking_data)`, [], (err, rows) => {
            if (err) {
                console.error('Error getting table schema:', err.message);
            } else {
                console.log('\nTable schema:');
                console.log('-------------');
                rows.forEach(column => {
                    console.log(`${column.name} (${column.type})${column.pk ? ' PRIMARY KEY' : ''}${column.notnull ? ' NOT NULL' : ''}`);
                });
            }
            
            // Check if there's any data
            db.get(`SELECT COUNT(*) as count FROM eyetracking_data`, [], (err, row) => {
                if (err) {
                    console.error('Error counting rows:', err.message);
                } else {
                    console.log(`\nTotal records: ${row.count}`);
                }
                
                // Close the database connection
                db.close((err) => {
                    if (err) {
                        console.error('Error closing database:', err.message);
                    } else {
                        console.log('\nDatabase connection closed');
                    }
                });
            });
        });
    }
}); 