const express = require('express');
const userModel = require('../models/UserModel');
const productModel = require('../models/ProductModel');
const verifyToken = require('../middleware/verifyToken');

const router = express.Router();

// view cart
router.get('/', verifyToken, async (req, res) => {
    const userId = req.user.id;
    try {
        const user = await userModel.findById(userId);
        const cartItems = user.cart;

        return res.status(200).json(cartItems);
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

// add to cart
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

/** To remove product from cart  */

router.delete('/product/:productId', verifyToken, async (req, res) => {
    const userId = req.user.id;
    const { productId } = req.params;
    try {
        const user = await userModel.findById(userId);
        user.cart = user.cart.filter((item) => {
            item.productId != productId;
        });
        await user.save();
        res.status(200).send('Product deleted successfully');
    } catch (err) {
        console.log(err);
        res.status(200).send({ message: 'Internal Server Error' });
    }
});

/** To increase product quantity in cart */

router.patch('/product/:productId', verifyToken, async (req, res) => {
    const userId = req.user.id;
    const { productId } = req.params;
    const user = await userModel.findById(userId);
    try {
        const product = await productModel.findById(productId);
        if (!product) {
            res.status(404).send('Product not found');
        }
        const cartItem = user.cart.find(
            item => item.productId == productId
        );
        if (!cartItem) {
            return res.status(404).send('Product not in cart');
        }

        cartItem.quantity += 1;
        await user.save();
        res.status(200).send(`Incremented successfully. New value ${cartItem.quantity}`);
    } catch(err) {
        res.status(500).send({ message: 'Internal Server Error' });
    }
});

module.exports = router;