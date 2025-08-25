require('dotenv').config();
const mongoose = require('mongoose');

const URL = process.env.MONGO_URI;

mongoose.connect(URL)
.then(() => {
    console.log('Connected to MongoDB Atlas');
})
.catch((err) => {
    console.error('Error connecting to MongoDB Atlas:', err);
});

module.exports = mongoose;