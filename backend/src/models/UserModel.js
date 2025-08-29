const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    email: {
        type: String,
        unique: true,
    },
    password: {
        type: String,
    },
    role: {
        type: String,
        enum: ['buyer', 'seller'],
        default: 'buyer',
    },
    favourites: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
    }],
    profile: {
        location: { type: String, default: "" },
        contact: { type: String, default: "" },
        storeName: { type: String, default: "" },
        rating: { type: Number, default: 0 }
    },
    listings: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
    }],
    cart: [{
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
        },
        quantity: {
            type: Number,
            default: 1,
        }
    }],
    transactionHistory: [{
        transactionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Transaction',
        }
    }],
})

const User = mongoose.model('User', userSchema);
module.exports = User;