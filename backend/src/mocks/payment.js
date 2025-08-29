async function processMockPayment({ amount, currency, orderId }) {
  // Simulate network delay
  await new Promise(r => setTimeout(r, 500));

  // Always succeed (you can randomize for testing failures)
  return {
    success: true,
    chargeId: `MOCK_${Date.now()}`,
    meta: {
      note: 'Mock payment processed successfully',
      orderId,
      amount,
      currency
    }
  };
}

module.exports = { processMockPayment };
