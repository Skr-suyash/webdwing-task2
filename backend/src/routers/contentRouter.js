const express = require('express');
const productModel = require('../models/ProductModel');
const userModel = require('../models/UserModel');

const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const { verify } = require('jsonwebtoken');

/** Get all products */
router.get('/products', async (req, res) => {
    const { page = 1, limit = 5 } = req.query;
    const skip = (page - 1) * limit;
    try {
        const products = await productModel.find().skip(skip).limit(parseInt(limit));
        res.status(200).json(products);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: err });
    }
});

router.get('/users/:userId/products', verifyToken, async (req, res) => {
    const { userId } = req.params;
    if (userId != req.user.id) {
        return res.status(403).json({ message: 'Forbidden' });
    }
    try {
        const products = await productModel.find({ sellerId: userId });
        res.status(200).json(products);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: err });
    }
});

/* Add edit and delete products  */

router.post('/products', verifyToken, async (req, res) => {
    const { name, description, price, category, quantity } = req.body;
    const sellerId = req.user.id;
    try {
        const product = new productModel({
            sellerId,
            name,
            description,
            price,
            category,
            quantity,
        });
        await product.save();
        res.status(200).send(product);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: err });
    }
});

router.patch('/products/:productId', verifyToken, async (req, res) => {
    const { productId } = req.params;
    try {
        const product = await productModel.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        if (product.sellerId.toString() != req.user.id) {
            return res.status(403).json({ message: 'Forbidden' });
        }
        const updates = ['name', 'description', 'price', 'category', 'quantity'];
        updates.map((key) => {
            if (req.body[key] != undefined) {
                product[key] = req.body[key];
            }
        });
        await product.save();
        return res.status(200).json(product);
    } catch (err) {
        console.log(err);
        return res.status(500).send({ message: err });
    }
});

router.delete('/products/:productId', verifyToken, async (req, res) => {
    const { productId } = req.params;
    try {
        const product = await productModel.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        if (product.sellerId.toString() != req.user.id) {
            return res.status(403).json({ message: 'Forbidden' });
        }
        await product.deleteOne();
        res.status(200).json({ message: 'Product deleted successfully' });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: err });
    }
});

/* Like Product Route */

router.post('/products/like/:productId', verifyToken, async (req, res) => {
    const { productId } = req.params;
    try {
        let product = await productModel.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        const userId = req.user.id;
        if (product.likes.includes(userId)) {
            product.likes.pull(userId);
        }
        else {
            product.likes.push(userId);
        }
        await product.save();
        return res.status(200).json({ likes: product.likes });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: err });
    }
});

/* FAvorite product Route */
router.post('/products/favourites/:productId', verifyToken, async (req, res) => {
    const userId = req.user.id;
    const { productId } = req.params;
    try {
        const product = await productModel.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        const user = await userModel.findById(userId);
        const updatedUser = await userModel.findByIdAndUpdate(
            userId,
            { $set: { favourites: productId } },
            { new: true },
        );
        res.status(200).send(updatedUser);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

module.exports = router;