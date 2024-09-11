const express = require('express');
const app = express();
const port = process.env.PORT || 3000;  // Use the PORT environment variable provided by hosting environments like Clever Cloud, Heroku, etc.

// Serve files from Vite's build directory, "dist" where your React app is built to.
app.use(express.static('dist'));

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
