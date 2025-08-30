const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    buyer: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    sellerId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required: true,
    },
    items: [{
        itemId: { type: mongoose.Schema.Types.ObjectId, ref: "Listing" },
        quantity: Number,
        price: Number
    }],
    totalAmount: { 
        type: Number, 
        required: true 
    },
    paymentStatus: { 
        type: String, 
        enum: ["pending", "completed", "failed"], 
        default: "pending" 
    },
    invoiceUrl: String,
    transactionTime: {
        type: Date,
        default: Date.now
    }
});

const Transaction = mongoose.model('Transaction', transactionSchema);
module.exports = Transaction;