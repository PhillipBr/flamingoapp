// Primero, carga las variables de entorno desde el archivo sql.env
require('dotenv').config({ path: './sql.env' });

const express = require('express');
const mysql = require('mysql');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3002; // Usa el puerto proporcionado por el entorno o 3002 si no está definido.

app.use(cors()); // Habilita CORS para todas las rutas y orígenes.

// Configuración de conexión MySQL utilizando variables de entorno
const db = mysql.createConnection({
    host: process.env.MYSQL_ADDON_HOST,
    user: process.env.MYSQL_ADDON_USER,
    password: process.env.MYSQL_ADDON_PASSWORD,
    database: process.env.MYSQL_ADDON_DB,
    port: process.env.MYSQL_ADDON_PORT
});


// Conectar a MySQL
db.connect(err => {
    if (err) {
        console.error('Error connecting: ' + err.message);
        return;
    }
    console.log('Connected to the MySQL server.');
});

// Archivos estáticos (ajusta según tu estructura de carpetas)
app.use(express.static('public'));

// Punto final de la API para obtener canciones
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
