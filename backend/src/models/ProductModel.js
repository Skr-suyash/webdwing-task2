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
    status: { 
        type: String,
        enum: ["stock", "sold"],
        default: "stock" 
    },
    likes: [
        { type: mongoose.Schema.Types.ObjectId, ref: "User" }
    ],
});

const Product = mongoose.model('Product', productSchema);
mondule.exports = Product;