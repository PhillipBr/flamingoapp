const express = require('express');
const mysql = require('mysql');
const cors = require('cors');  // Import CORS module

const app = express();
const PORT = 3002;

app.use(cors()); // Enable CORS for all routes and origins

// MySQL connection setup
const db = mysql.createConnection({
    host: 'bxpbrop8lgso8srbtkbf-mysql.services.clever-cloud.com',
    user: 'urrofxaztnxfy371',
    password: 'XTILiwnWgS9aIcCqKk5o',
    database: 'bxpbrop8lgso8srbtkbf'
});

// Connect to MySQL
db.connect(err => {
    if (err) {
        return console.error('error connecting: ' + err.message);
    }
    console.log('connected to the MySQL server.');
});

// Static files
app.use(express.static('PROJECT'));

// API endpoint to get songs
app.get('/api/songs', (req, res) => {
    const sql = `
        SELECT AR.SongID, AR.Title, AR.Artist, TS.Album, TS.Popularity, TS.Duration, TS.CoverImage, TS.ReleaseDate, TS.Genre
        FROM AR
        JOIN TS ON AR.SongID = TS.SongID
        ORDER BY AR.Views DESC
    `;
    db.query(sql, (error, results, fields) => {
        if (error) throw error;
        res.json(results);
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
