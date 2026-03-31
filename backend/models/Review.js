const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reviewee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  relatedBorrowRequest: { type: mongoose.Schema.Types.ObjectId, ref: 'BorrowRequest' },
  relatedListing: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing' },
  relatedService: { type: mongoose.Schema.Types.ObjectId, ref: 'Service' },
  role: { type: String, enum: ['borrower', 'owner', 'service_user', 'service_provider'] },
}, { timestamps: true });

module.exports = mongoose.model('Review', reviewSchema);
