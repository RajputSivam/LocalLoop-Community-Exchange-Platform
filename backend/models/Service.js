const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  provider: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  category: {
    type: String,
    enum: ['Tutoring', 'Repairs', 'Pet Care', 'Cleaning', 'Gardening', 'Cooking', 'Tech Help', 'Childcare', 'Moving Help', 'Other'],
    required: true,
  },
  pricePerHour: { type: Number, default: 0 },
  isFree: { type: Boolean, default: false },
  availability: { type: String, default: 'Flexible' },
  images: [{ type: String }],
  location: {
    type: { type: String, default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] },
    address: { type: String, default: '' },
  },
  isActive: { type: Boolean, default: true },
  tags: [{ type: String }],
}, { timestamps: true });

serviceSchema.index({ location: '2dsphere' });
serviceSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Service', serviceSchema);
