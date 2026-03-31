const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  category: {
    type: String,
    enum: ['Tools', 'Electronics', 'Books', 'Sports', 'Clothing', 'Kitchen', 'Garden', 'Toys', 'Furniture', 'Other'],
    required: true,
  },
  images: [{ type: String }], // min 2, max 5
  pricePerDay: { type: Number, default: 0 },
  isFree: { type: Boolean, default: false },
  condition: {
    type: String,
    enum: ['New', 'Like New', 'Good', 'Fair', 'Poor'],
    required: true,
  },
  estimatedValue: { type: Number, required: true }, // for deposit calculation
  depositAmount: { type: Number, default: 0 }, // auto-calculated
  maxBorrowDays: { type: Number, default: 7 },
  damageRules: { type: String, default: '' },
  rentalTerms: { type: String, default: '' },
  location: {
    type: { type: String, default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] },
    address: { type: String, default: '' },
  },
  isAvailable: { type: Boolean, default: true },
  currentBorrower: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  currentBorrowRequest: { type: mongoose.Schema.Types.ObjectId, ref: 'BorrowRequest', default: null },
  totalBorrows: { type: Number, default: 0 },
  tags: [{ type: String }],
}, { timestamps: true });

listingSchema.index({ location: '2dsphere' });
listingSchema.index({ title: 'text', description: 'text' });

// Auto-calculate deposit before save
listingSchema.pre('save', function (next) {
  // Run on new documents OR when estimatedValue/condition changes
  if (this.isNew || this.isModified('estimatedValue') || this.isModified('condition')) {
    const conditionMultiplier = { 'New': 0.5, 'Like New': 0.4, 'Good': 0.3, 'Fair': 0.2, 'Poor': 0.1 };
    this.depositAmount = Math.round(this.estimatedValue * (conditionMultiplier[this.condition] || 0.3));
  }
  next();
});

module.exports = mongoose.model('Listing', listingSchema);
