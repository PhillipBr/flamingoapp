const express = require('express');
const mysql = require('mysql');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3002; // Use the PORT environment variable provided by Clever Cloud or default to 3002

// Enable CORS for all routes and origins
app.use(cors());

// Set up database connection using environment variables
const db = mysql.createConnection({
    host: process.env.MYSQL_ADDON_HOST,
    user: process.env.MYSQL_ADDON_USER,
    password: process.env.MYSQL_ADDON_PASSWORD,
    database: process.env.MYSQL_ADDON_DB,
    port: process.env.MYSQL_ADDON_PORT
});

// Connect to MySQL
db.connect(err => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to the database.');
});

// Define a route to fetch songs
app.get('/api/songs', (req, res) => {
    const query = 'SELECT * FROM songs ORDER BY popularity DESC LIMIT 5'; // Adjust the table name and fields according to your schema
    db.query(query, (error, results) => {
        if (error) {
            console.error('Failed to retrieve songs from database:', error);
            res.status(500).send('Error fetching songs');
        } else {
            res.json(results);
        }
    });
});

// Serve static files - Optional: If you have a frontend or static files to serve
app.use(express.static('public'));

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
