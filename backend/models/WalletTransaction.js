const mongoose = require('mongoose');

const walletTransactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: ['Deposit', 'Withdrawal', 'LockDeposit', 'ReleaseDeposit', 'ForfeitDeposit', 'PartialDeduction', 'Compensation', 'Refund'],
    required: true,
  },
  amount: { type: Number, required: true },
  balanceBefore: { type: Number },
  balanceAfter: { type: Number },
  description: { type: String },
  relatedBorrowRequest: { type: mongoose.Schema.Types.ObjectId, ref: 'BorrowRequest' },
  relatedDispute: { type: mongoose.Schema.Types.ObjectId, ref: 'Dispute' },
  stripePaymentIntentId: { type: String },
  status: { type: String, enum: ['Pending', 'Completed', 'Failed'], default: 'Completed' },
}, { timestamps: true });

module.exports = mongoose.model('WalletTransaction', walletTransactionSchema);
