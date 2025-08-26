const express = require('express');
const cors = require('cors');
require('dotenv').config();
require('./db/db.js');

const app = express();
const PORT = process.env.PORT || 3000;

// Routers
const authRouter = require('./routers/authRouter');
const contentRouter = require('./routers/contentRouter');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use('/api/auth', authRouter);
app.use('/api/content', contentRouter);

// Routes
app.get('/', (req, res) => {
    res.send('Hello, World!');
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});