const express = require('express');
const userModel = require('../models/UserModel');
const productModel = require('../models/ProductModel');
const verifyToken = require('../middleware/verifyToken');

const router = express.Router();

router.get('/', verifyToken, async (req, res) => {
    const userId = req.user.id;
    try {
        const user = await userModel.findById(id);
        const cartItems = user.cart;

        return res.status(200).json(cartItems);
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

router.post('/product/:productId', verifyToken, async (req, res) => {
    const { productId } = req.params;
    const product = await productModel.findById(productId);
    if (!product) {
        return res.status(404).send({ message: 'Product not found' });
    }

    try {
        const userId = req.user.id;
        const user = await userModel.findById(userId);

        const cartItem = user.cart.find((item) => (productId.toString() == item.productId));

        // if already exists increase quantity
        if (cartItem) {
            cartItem.quantity += 1;
        }
        else {
            user.cart.push({
                productId: productId,
                quantity: 1,
            });
        }

        await user.save();
        res.status(200).send(user.cart);
    } catch (err) {
        console.log(err);
        res.status(200).send({ message: 'Internal Server Error' });
    }
});

module.exports = router;