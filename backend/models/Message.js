const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  chatId: { type: String, required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  relatedListing: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing' },
  relatedService: { type: mongoose.Schema.Types.ObjectId, ref: 'Service' },
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);
