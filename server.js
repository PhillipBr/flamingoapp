// Load environment variables from sql.env
require('dotenv').config({ path: './sql.env' });

const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3002; // Use the provided port or default to 3002.

// Configure CORS to allow requests from your GitHub Pages domain
app.use(cors({
    origin: 'https://phillipbr.github.io', // Replace with your actual GitHub Pages URL if different
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));

// Serve static files from the root directory
app.use(express.static(__dirname));

// Serve 'index.html' at the root path
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Database connection
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
        console.error('Error connecting: ' + err.message);
        return;
    }
    console.log('Connected to the MySQL server.');
});

// API endpoint
app.get('/api/songs', (req, res) => {
    let { title, artist, album, genre } = req.query;
    let conditions = [];
    let sql = `SELECT AR.SongID, AR.Title, AR.Artist, TS.Album, AR.Views, TS.Duration, TS.CoverImage, TS.ReleaseDate, TS.Genre
               FROM AR
               JOIN TS ON AR.SongID = TS.SongID`;

    // Prepare conditions and parameterized query values
    let values = [];
    if (artist) {
        conditions.push(`AR.Artist LIKE ?`);
        values.push(`%${artist}%`);
    }
    if (title) {
        conditions.push(`AR.Title LIKE ?`);
        values.push(`%${title}%`);
    }
    if (album) {
        conditions.push(`TS.Album LIKE ?`);
        values.push(`%${album}%`);
    }
    if (genre) {
        conditions.push(`TS.Genre LIKE ?`);
        values.push(`%${genre}%`);
    }

    if (conditions.length > 0) {
        sql += ' WHERE ' + conditions.join(' AND ');
    }

    sql += ' ORDER BY AR.Views DESC';

    db.query(sql, values, (error, results, fields) => {
        if (error) {
            console.error('Error fetching data: ' + error.message);
            res.status(500).send('Error fetching data');
            return;
        }
        res.json(results);
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
