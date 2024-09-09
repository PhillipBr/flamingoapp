const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: './sql.env' });

const app = express();
const PORT = process.env.PORT || 3002;

// Configuración de CORS para permitir solicitudes desde GitHub Pages
const corsOptions = {
    origin: 'https://phillipbr.github.io', // Cambia esto por tu dominio específico si es necesario
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Servir archivos estáticos
app.use('/css', express.static(path.join(__dirname, 'CSS')));
app.use('/images', express.static(path.join(__dirname, 'images')));

// Configuración de conexión a MySQL
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
        process.exit(1); // Salir en caso de error de conexión a la base de datos
    }
    console.log('Connected to the MySQL server.');
});

// Endpoint para servir el HTML principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Endpoint API para obtener canciones
app.get('/api/songs', (req, res) => {
    const sql = `SELECT AR.SongID, AR.Title, AR.Artist, TS.Album, TS.Population, TS.Duration, TS.CoverImage, TS.ReleaseDate, TS.Genre
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
