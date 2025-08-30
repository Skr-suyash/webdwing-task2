const mongoose = require('mongoose');
const crypto = require('crypto');
require('dotenv').config();

const ALPH = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

// convert number to base36 (fixed length)
function toBase36(v, width) {
    let s = '';
    if (v === 0) s = '0';
    while (v > 0) {
        s = ALPH[v % 36] + s;
        v = Math.floor(v / 36);
    }
    while (s.length < width) s = '0' + s;
    if (s.length > width) s = s.slice(-width);
    return s;
}

// checksum generator
function checksum(body) {
    let total = 0;
    for (let i = 0; i < body.length; i++) {
        total = (total + (i + 1) * ALPH.indexOf(body[i])) % 36;
    }
    const checkVal = (36 - total) % 36;
    return ALPH[checkVal];
}

function generateSKU(seed, index) {
  const payload = `${seed}:${index}`;
  const digest = crypto.createHash('sha256').update(payload).digest();

  // take first 5 bytes = 40 bits
  const bodyVal = (digest.readUInt32BE(0) * 256 + digest[4]) >>> 0;

  const body = toBase36(bodyVal, 8);
  const check = checksum(body);
  return `PRD-${body}${check}`;
}

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
    sku: {
        type: String,
        unique: true,
    },
    likes: [
        { type: mongoose.Schema.Types.ObjectId, ref: "User" }
    ],
});

// generate SKU using product id
productSchema.pre("save", function (next) {
  if (!this.sku) {
    this.sku = generateSKU(process.env.ASSIGNMENT_SEED.toString(), this._id.toString());
  }
  next();
});

const Product = mongoose.model('Product', productSchema);
module.exports = Product;