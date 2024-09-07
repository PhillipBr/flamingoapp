const express = require('express');
const mysql = require('mysql');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3002; // Utiliza el puerto proporcionado por Clever Cloud o 3002 si se ejecuta localmente

app.use(cors()); // Habilita CORS para todos los rutas y orígenes

// MySQL connection setup
const db = mysql.createConnection({
    host: process.env.MYSQL_ADDON_HOST,
    user: process.env.MYSQL_ADDON_USER,
    password: process.env.MYSQL_ADDON_PASSWORD,
    database: process.env.MYSQL_ADDON_DB,
    port: process.env.MYSQL_ADDON_PORT
});


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

require('dotenv').config();

