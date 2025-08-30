const mongoose = require("mongoose");

const idempotencySchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  response: { type: Object, required: true }, 
  createdAt: { type: Date, default: Date.now, expires: 300 } // delete after 5 min
});

const Idempotency = mongoose.model("Idempotency", idempotencySchema);
module.exports = Idempotency;
