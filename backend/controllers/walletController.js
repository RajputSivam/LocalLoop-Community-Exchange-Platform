const User = require('../models/User');
const WalletTransaction = require('../models/WalletTransaction');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// @GET /api/wallet — get wallet info + transaction history
const getWallet = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('walletBalance lockedDeposits name');
    const transactions = await WalletTransaction.find({ user: req.user._id })
      .sort('-createdAt').limit(50)
      .populate('relatedBorrowRequest', 'listing')
      .populate('relatedDispute', 'reason');
    res.json({ wallet: { balance: user.walletBalance, locked: user.lockedDeposits, available: user.walletBalance }, transactions });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @POST /api/wallet/add-funds — create Stripe payment intent to add money
const addFunds = async (req, res) => {
  try {
    const { amount } = req.body; // amount in rupees
    if (!amount || amount < 100) return res.status(400).json({ message: 'Minimum ₹100 required' });

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // paise
      currency: 'inr',
      metadata: { userId: req.user._id.toString(), type: 'wallet_topup' },
    });

    res.json({ clientSecret: paymentIntent.client_secret, amount });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @POST /api/wallet/confirm-deposit — called after successful Stripe payment
const confirmDeposit = async (req, res) => {
  try {
    const { amount, paymentIntentId } = req.body;
    const user = await User.findById(req.user._id);
    const before = user.walletBalance;
    user.walletBalance += Number(amount);
    await user.save();

    await WalletTransaction.create({
      user: user._id, type: 'Deposit', amount: Number(amount),
      balanceBefore: before, balanceAfter: user.walletBalance,
      description: 'Wallet top-up via Stripe',
      stripePaymentIntentId: paymentIntentId, status: 'Completed',
    });

    res.json({ message: 'Funds added successfully', balance: user.walletBalance });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getWallet, addFunds, confirmDeposit };
