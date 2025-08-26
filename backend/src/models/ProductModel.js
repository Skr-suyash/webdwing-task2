const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    sellerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    price: {
        type: Number,
        required: true,
    },
    category: {
        type: String,
    },
    quantity: {
        type: Number,
    },
    likes: [
        { type: mongoose.Schema.Types.ObjectId, ref: "User" }
    ],
});

const Product = mongoose.model('Product', productSchema);
module.exports = Product;