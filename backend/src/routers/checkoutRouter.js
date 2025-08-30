const express = require('express');
const crypto = require('crypto');
require('dotenv').config();
const mongoose = require('mongoose');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');

const userModel = require('../models/UserModel');
const productModel = require('../models/ProductModel');
const transactionModel = require('../models/TransactionModel');
const idempotencyModel = require('../models/IdempotencyModel');

const { processMockPayment } = require('../mocks/payment');

// rate limiter
const checkoutLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 7,
    message: { error: "Too many checkout requests, please try again later." }
});

function computeFee(subtotal) {

    const seedString = process.env.ASSIGNMENT_SEED.toString();
    const seed = Number(seedString.split('-')[1]);
    console.log(seed);

    return Math.floor(0.017 * subtotal + seed);
}

router.post('/checkout', checkoutLimiter, verifyToken, async (req, res) => {
    const buyerId = req.user.id;

    const idempotencyKey = req.header('Idempotency-Key');
    if (!idempotencyKey) {
        return res.status(400).send('Idempotency Key is required');
    }

    let existingKey = await idempotencyModel.findOne({ key: idempotencyKey });
    if (existingKey) {
        res.status(200).json(existingKey.response);
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const user = await userModel.findById(buyerId).populate('cart.productId');
        if (!user) throw new Error("User not found");
        if (!user.cart || user.cart.length === 0) throw new Error("Cart is empty");

        // Group items by seller
        const itemsBySeller = {};

        for (const ci of user.cart) {
            const product = await productModel.findById(ci.productId._id).session(session);
            if (!product) throw new Error(`Product ${ci.productId._id} not found`);
            if (product.quantity < ci.quantity) throw new Error(`Insufficient stock for ${product.name}`);

            const total = product.price * ci.quantity;

            if (!itemsBySeller[product.sellerId]) {
                itemsBySeller[product.sellerId] = { total: 0, items: [] };
            }

            itemsBySeller[product.sellerId].total += total;
            itemsBySeller[product.sellerId].items.push({
                itemId: product._id,
                quantity: ci.quantity,
                price: product.price
            });

            // decrement stock
            product.quantity -= ci.quantity;
            await product.save({ session });
        }

        const transactions = [];

        // Create transactions per seller
        for (const [sellerId, data] of Object.entries(itemsBySeller)) {

            const platformFee = computeFee(data.total);
            console.log(platformFee);

            const finalAmount = data.total + platformFee;

            const [transaction] = await transactionModel.create([{
                buyer: buyerId,
                sellerId,
                items: data.items,
                totalAmount: finalAmount,
                paymentStatus: "pending",
                transactionTime: new Date(),
            }], { session });

            // Process payment for this seller
            const result = await processMockPayment({
                amount: finalAmount,
                currency: "INR",
                orderId: transaction._id
            });

            if (result.success) {
                transaction.paymentStatus = "completed";
                transaction.invoiceUrl = `https://example.com/invoices/${transaction._id}.pdf`;
                await transaction.save({ session });

                user.transactionHistory.push({ transactionId: transaction._id });
                transactions.push(transaction);
            } else {
                transaction.paymentStatus = "failed";
                await transaction.save({ session });
                throw new Error(`Payment failed for seller ${sellerId}`);
            }
        }

        // Clear cart
        user.cart = [];
        await user.save({ session });

        // send result
        const result = {
            message: "Checkout successful",
            transactions
        };

        await idempotencyModel.create({ key: idempotencyKey, response: result });

        await session.commitTransaction();
        session.endSession();

        const signature = crypto
            .createHmac('sha256', process.env.ASSIGNMENT_SEED)
            .update(JSON.stringify(result))
            .digest('hex');

        return res.set('X-Signature', signature).status(200).send(result);

    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        console.error("Checkout failed:", err);
        res.status(500).send({ message: err.message });
    }
});

module.exports = router;
