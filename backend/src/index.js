const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();
require('./db/db.js');

const app = express();
const PORT = process.env.PORT || 3000;

// Routers
const authRouter = require('./routers/authRouter');
const contentRouter = require('./routers/contentRouter');
const cartRouter = require('./routers/cartRouter.js');
const checkoutRouter = require('./routers/checkoutRouter.js')

// set up upload directory
const uploadDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

app.use('/api/auth', authRouter);
app.use('/api/content', contentRouter);
app.use('/api/cart', cartRouter);
app.use('/api/cart', checkoutRouter);

// Routes
app.get('/', (req, res) => {
    res.send('Hello, World!');
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});