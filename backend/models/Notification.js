const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: [
      'BorrowRequest', 'RequestAccepted', 'RequestRejected',
      'ItemDueSoon', 'ItemOverdue', 'ReturnProofUploaded',
      'DisputeFiled', 'DisputeResolved', 'AppealFiled',
      'DepositLocked', 'DepositReleased',
      'TrustScoreChanged', 'BadgeEarned',
      'NewMessage', 'SystemAlert'
    ],
    required: true,
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  link: { type: String }, // frontend route to redirect
  relatedBorrowRequest: { type: mongoose.Schema.Types.ObjectId, ref: 'BorrowRequest' },
  relatedDispute: { type: mongoose.Schema.Types.ObjectId, ref: 'Dispute' },
  relatedListing: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing' },
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
