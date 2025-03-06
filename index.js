const express = require('express')
const { connectDB } = require('./src/config/db');
const app = express()
const port = 3000



connectDB().then(() => {
    app.listen(port, () => {
        console.log(`🚀 Server running on port ${port}`);
    });
});
