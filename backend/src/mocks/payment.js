async function processMockPayment({ amount, currency, orderId }) {
  // Simulate processing delay
  await new Promise(r => setTimeout(r, 300));

  // Always succeed (or randomize for testing)
  return {
    success: true,
    chargeId: `MOCK_${Date.now()}`,
    meta: { orderId, amount, currency }
  };
}

module.exports = { processMockPayment };
