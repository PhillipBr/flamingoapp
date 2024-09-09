const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: './sql.env' });

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use('/css', express.static(path.join(__dirname, 'CSS')));
app.use('/images', express.static(path.join(__dirname, 'images')));

const db = mysql.createConnection({
    host: process.env.MYSQL_ADDON_HOST,
    user: process.env.MYSQL_ADDON_USER,
    password: process.env.MYSQL_ADDON_PASSWORD,
    database: process.env.MYSQL_ADDON_DB,
    port: process.env.MYSQL_ADDON_PORT
});

db.connect(err => {
    if (err) {
        console.error('Error connecting to MySQL: ' + err.message);
        process.exit(1); // Exit in case of DB connection error
    }
    console.log('Connected to the MySQL server.');
});

app.get('/', (req, res) => {
    res.redirect('/api/songs');
});

app.get('/api/songs', (req, res) => {
    const sql = `SELECT AR.SongID, AR.Title, AR.Artist, TS.Album, TS.Popularity, TS.Duration, TS.CoverImage, TS.ReleaseDate, TS.Genre
                 FROM AR
                 JOIN TS ON AR.SongID = TS.SongID
                 ORDER BY AR.Views DESC`;
    db.query(sql, (error, results, fields) => {
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
