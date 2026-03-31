const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  avatar: { type: String, default: '' },
  bio: { type: String, default: '' },
  location: {
    type: { type: String, default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] },
    address: { type: String, default: '' },
  },
  // Trust & Rating
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  trustScore: { type: Number, default: 100 }, // 0-100
  trustLevel: {
    type: String,
    enum: ['New', 'Bronze', 'Silver', 'Gold', 'Platinum'],
    default: 'New',
  },
  // Wallet
  walletBalance: { type: Number, default: 0 },
  lockedDeposits: { type: Number, default: 0 },
  // Gamification
  xpPoints: { type: Number, default: 0 },
  badges: [{ name: String, earnedAt: Date, icon: String }],
  // Status
  role: { type: String, enum: ['user', 'moderator', 'admin'], default: 'user' },
  isActive: { type: Boolean, default: true },
  isSuspended: { type: Boolean, default: false },
  suspendedUntil: { type: Date },
  suspensionReason: { type: String },
  // Penalty tracking
  lateReturnCount: { type: Number, default: 0 },
  disputeCount: { type: Number, default: 0 },
  // Preferences
  language: { type: String, default: 'en' },
  notificationPreferences: {
    email: { type: Boolean, default: true },
    push: { type: Boolean, default: true },
    sms: { type: Boolean, default: false },
  },
}, { timestamps: true });

userSchema.index({ location: '2dsphere' });

// Always update trustLevel based on trustScore
userSchema.pre('save', function (next) {
  if (this.trustScore >= 90) this.trustLevel = 'Platinum';
  else if (this.trustScore >= 75) this.trustLevel = 'Gold';
  else if (this.trustScore >= 55) this.trustLevel = 'Silver';
  else if (this.trustScore >= 35) this.trustLevel = 'Bronze';
  else this.trustLevel = 'New';
  next();
});

// Hash password before save (only when modified)
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
