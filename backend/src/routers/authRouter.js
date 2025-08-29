const express = require('express');
const userModel = require('../models/UserModel');
const transactionHistory = require('../models/TransactionModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const router = express.Router();
const verifyToken = require('../middleware/verifyToken.js');

router.post('/register', async (req, res) => {
    const { name, email, password, role = ['buyer'] } = req.body;
    console.log(email, password, name)
    try {
        const exists = await userModel.findOne({ email: email });
        if (exists) {
            return res.status(400).json({ error: 'user already exists!' });
        }
        const hash = await bcrypt.hash(password, 10);
        const user = {
            name: name,
            email: email,
            password: hash,
            role: role,
        };
        await userModel.insertOne(user);
        res.status(200).json(user);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body; 
    const user = await userModel.findOne({ email: email });
    if (!user) {
        return res.status(400).json({ message: 'User not found!' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(400).json({ message: 'Wrong password!' });
    }

    const token = jwt.sign({ id: user._id}, process.env.ASSIGNMENT_SEED, { expiresIn: '1h'});
    res.json({
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        },
        token: token,
    });
});

/** Get profile */

router.get('/profile', verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;

        const user = await userModel.findById(userId)
            .populate('favourites', 'name price');

        if (!user) {
            return res.status(404).send({ message: "User not found" });
        }

        // fetch full transaction history separately
        const transactions = await transactionHistory.find({ buyer: userId })
            .populate('sellerId', 'name email profile.storeName')
            .populate({
                path: 'items.itemId',
                model: 'Product',
                select: 'name price'
            })
            .sort({ createdAt: -1 });

        res.status(200).send({
            message: "Profile fetched successfully",
            profile: user.profile,
            email: user.email,
            role: user.role,
            favourites: user.favourites,
            transactionHistory: transactions
        });
    } catch (err) {
        console.error("View profile failed:", err);
        res.status(500).send({ message: "Internal server error" });
    }
});

/* Update profile */
router.patch('/profile', verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { location, contact, storeName, rating } = req.body;

        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).send({ message: "User not found" });
        }

        if (location !== undefined) user.profile.location = location;
        if (contact !== undefined) user.profile.contact = contact;
        if (storeName !== undefined) user.profile.storeName = storeName;
        if (rating !== undefined) user.profile.rating = rating;

        await user.save();

        res.status(200).send({
            message: "Profile updated successfully",
            profile: user.profile
        });
    } catch (err) {
        console.error("Update profile failed:", err);
        res.status(500).send({ message: "Internal server error" });
    }
});


/**
 * TODO
 * To get username and email for profile anytime
 */

router.post('/logout', verifyToken, (req, res) => {
    res.json({ message: 'Logged out successfully' });
});

module.exports = router;