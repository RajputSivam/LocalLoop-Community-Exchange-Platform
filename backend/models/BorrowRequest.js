const mongoose = require('mongoose');

const borrowRequestSchema = new mongoose.Schema({
  listing: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },
  borrower: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  status: {
    type: String,
    enum: ['Pending', 'Accepted', 'Rejected', 'Active', 'ReturnProofUploaded', 'Completed', 'Overdue', 'Disputed', 'Cancelled'],
    default: 'Pending',
  },

  // Terms
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  totalDays: { type: Number },
  totalPrice: { type: Number, default: 0 },
  depositAmount: { type: Number, required: true },
  depositStatus: { type: String, enum: ['Pending', 'Locked', 'Released', 'Forfeited', 'Partial'], default: 'Pending' },

  // Agreement
  borrowerAgreed: { type: Boolean, default: false },
  borrowerAgreedAt: { type: Date },
  ownerAgreed: { type: Boolean, default: false },
  ownerAgreedAt: { type: Date },
  borrowerSignature: { type: String }, // base64
  ownerSignature: { type: String },

  // Exchange proof
  handoverPhotos: [{ url: String, uploadedAt: Date, uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } }],
  returnPhotos: [{ url: String, uploadedAt: Date, uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } }],

  // Return tracking
  returnProofUploadedAt: { type: Date },
  returnNotes: { type: String },
  conditionOnReturn: { type: String, enum: ['Same', 'Minor Damage', 'Major Damage', 'Destroyed'] },

  // Late tracking
  isOverdue: { type: Boolean, default: false },
  overdueDays: { type: Number, default: 0 },
  overdueNotificationsSent: { type: Number, default: 0 },

  // Completion
  completedAt: { type: Date },
  ownerRated: { type: Boolean, default: false },
  borrowerRated: { type: Boolean, default: false },

  // Messages
  requestMessage: { type: String },
  rejectionReason: { type: String },
}, { timestamps: true });

// Auto-calculate total days and price
borrowRequestSchema.pre('save', function (next) {
  if (this.startDate && this.endDate) {
    const diff = (this.endDate - this.startDate) / (1000 * 60 * 60 * 24);
    this.totalDays = Math.ceil(diff);
  }
  next();
});

module.exports = mongoose.model('BorrowRequest', borrowRequestSchema);
