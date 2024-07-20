const express = require('express');
const app = express();
const PORT = 3002;

app.use(express.static('PROJECT'));

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
