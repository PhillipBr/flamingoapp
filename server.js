require('dotenv').config({ path: './sql.env' });

const express = require('express');
const mysql = require('mysql');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());

var connection;

function handleDisconnect() {
    connection = mysql.createConnection({ 
        host: process.env.MYSQL_ADDON_HOST,
        user: process.env.MYSQL_ADDON_USER,
        password: process.env.MYSQL_ADDON_PASSWORD,
        database: process.env.MYSQL_ADDON_DB,
        port: process.env.MYSQL_ADDON_PORT
    });

    connection.connect(err => {
        if (err) {
            console.error('Error connecting to MySQL:', err);
            setTimeout(handleDisconnect, 2000); 
        }
        console.log('Connected to MySQL server.');
    });

    connection.on('error', err => {
        console.error('MySQL error:', err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            handleDisconnect(); 
        } else {
            throw err;
        }
    });
}

handleDisconnect(); 

app.use(express.static('public'));

app.get('/api/songs', (req, res) => {
    const sql = `SELECT AR.SongID, AR.Title, AR.Artist, TS.Album, AR.Views, TS.Duration, TS.CoverImage, TS.ReleaseDate, TS.Genre
                 FROM AR
                 JOIN TS ON AR.SongID = TS.SongID
                 ORDER BY AR.Views DESC`;
    connection.query(sql, (error, results, fields) => {
        if (error) {
            console.error('Error fetching data:', error.message);
            res.status(500).send('Error fetching data');
            return;
        }
        res.json(results);
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
