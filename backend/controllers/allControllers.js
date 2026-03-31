// serviceController.js
const Service = require('../models/Service');
const User = require('../models/User');

const getServices = async (req, res) => {
  try {
    const { category, search, lat, lng, radius = 10 } = req.query;
    let filter = { isActive: true };
    if (category) filter.category = category;
    if (search) filter.$text = { $search: search };
    let query = Service.find(filter).populate('provider', 'name avatar trustScore rating');
    if (lat && lng) {
      query = Service.find({ ...filter, location: { $near: { $geometry: { type: 'Point', coordinates: [Number(lng), Number(lat)] }, $maxDistance: radius * 1000 } } }).populate('provider', 'name avatar trustScore rating');
    }
    res.json(await query.sort('-createdAt').limit(50));
  } catch (err) { res.status(500).json({ message: err.message }); }
};
const getMyServices = async (req, res) => {
  try { res.json(await Service.find({ provider: req.user._id }).sort('-createdAt')); }
  catch (err) { res.status(500).json({ message: err.message }); }
};
const getService = async (req, res) => {
  try {
    const s = await Service.findById(req.params.id).populate('provider', 'name avatar trustScore rating reviewCount bio');
    if (!s) return res.status(404).json({ message: 'Not found' });
    res.json(s);
  } catch (err) { res.status(500).json({ message: err.message }); }
};
const createService = async (req, res) => {
  try {
    const { title, description, category, pricePerHour, isFree, availability, address, lat, lng } = req.body;
    const images = req.files ? req.files.map(f => `/uploads/${f.filename}`) : [];
    const service = await Service.create({
      provider: req.user._id, title, description, category,
      pricePerHour: Number(pricePerHour) || 0, isFree: isFree === 'true', availability, images,
      location: { type: 'Point', coordinates: [Number(lng) || 0, Number(lat) || 0], address: address || '' },
    });
    await User.findByIdAndUpdate(req.user._id, { $inc: { xpPoints: 15 } });
    res.status(201).json(service);
  } catch (err) { res.status(500).json({ message: err.message }); }
};
const updateService = async (req, res) => {
  try {
    const s = await Service.findById(req.params.id);
    if (!s) return res.status(404).json({ message: 'Not found' });
    if (s.provider.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not authorized' });
    res.json(await Service.findByIdAndUpdate(req.params.id, req.body, { new: true }));
  } catch (err) { res.status(500).json({ message: err.message }); }
};
const deleteService = async (req, res) => {
  try {
    const s = await Service.findById(req.params.id);
    if (!s) return res.status(404).json({ message: 'Not found' });
    if (s.provider.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not authorized' });
    await s.deleteOne();
    res.json({ message: 'Service deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
module.exports.serviceController = { getServices, getMyServices, getService, createService, updateService, deleteService };

// ─────────────────────────────────────────────

// messageController.js
const Message = require('../models/Message');
const getConversations = async (req, res) => {
  try {
    const msgs = await Message.find({ $or: [{ sender: req.user._id }, { receiver: req.user._id }] })
      .sort('-createdAt').populate('sender', 'name avatar').populate('receiver', 'name avatar');
    const seen = new Set(); const convos = [];
    for (const m of msgs) {
      const other = m.sender._id.toString() === req.user._id.toString() ? m.receiver : m.sender;
      if (!seen.has(m.chatId)) { seen.add(m.chatId); convos.push({ chatId: m.chatId, lastMessage: m, otherUser: other }); }
    }
    res.json(convos);
  } catch (err) { res.status(500).json({ message: err.message }); }
};
const getChatMessages = async (req, res) => {
  try {
    const msgs = await Message.find({ chatId: req.params.chatId }).sort('createdAt').populate('sender', 'name avatar');
    await Message.updateMany({ chatId: req.params.chatId, receiver: req.user._id }, { isRead: true });
    res.json(msgs);
  } catch (err) { res.status(500).json({ message: err.message }); }
};
const sendMessage = async (req, res) => {
  try {
    const { receiverId, content, relatedListing, relatedService } = req.body;
    const ids = [req.user._id.toString(), receiverId].sort();
    const chatId = ids.join('_');
    const msg = await Message.create({ chatId, sender: req.user._id, receiver: receiverId, content, relatedListing, relatedService });
    res.status(201).json(await msg.populate('sender', 'name avatar'));
  } catch (err) { res.status(500).json({ message: err.message }); }
};
module.exports.messageController = { getConversations, getChatMessages, sendMessage };

// ─────────────────────────────────────────────

// reviewController.js
const Review = require('../models/Review');
const createReview = async (req, res) => {
  try {
    const { revieweeId, rating, comment, relatedBorrowRequest, relatedListing } = req.body;
    const review = await Review.create({ reviewer: req.user._id, reviewee: revieweeId, rating, comment, relatedBorrowRequest, relatedListing });
    const reviews = await Review.find({ reviewee: revieweeId });
    const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
    await User.findByIdAndUpdate(revieweeId, { rating: avg.toFixed(1), reviewCount: reviews.length });
    res.status(201).json(review);
  } catch (err) { res.status(500).json({ message: err.message }); }
};
const getUserReviews = async (req, res) => {
  try {
    res.json(await Review.find({ reviewee: req.params.userId }).populate('reviewer', 'name avatar').sort('-createdAt'));
  } catch (err) { res.status(500).json({ message: err.message }); }
};
module.exports.reviewController = { createReview, getUserReviews };

// ─────────────────────────────────────────────

// notificationController.js
const Notification = require('../models/Notification');
const getNotifications = async (req, res) => {
  try {
    const notifs = await Notification.find({ user: req.user._id }).sort('-createdAt').limit(50);
    res.json(notifs);
  } catch (err) { res.status(500).json({ message: err.message }); }
};
const markRead = async (req, res) => {
  try {
    await Notification.updateMany({ user: req.user._id }, { isRead: true });
    res.json({ message: 'All marked as read' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
module.exports.notificationController = { getNotifications, markRead };

// ─────────────────────────────────────────────

// userController.js
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password -walletBalance -lockedDeposits');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) { res.status(500).json({ message: err.message }); }
};
const updateProfile = async (req, res) => {
  try {
    const { name, bio, address, lat, lng, language } = req.body;
    const updates = { name, bio, language };
    if (address) updates.location = { type: 'Point', coordinates: [Number(lng) || 0, Number(lat) || 0], address };
    if (req.file) updates.avatar = `/uploads/${req.file.filename}`;
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select('-password');
    res.json(user);
  } catch (err) { res.status(500).json({ message: err.message }); }
};
module.exports.userController = { getUserProfile, updateProfile };

// ─────────────────────────────────────────────

// paymentController.js
const stripeLib = require('stripe')(process.env.STRIPE_SECRET_KEY);
const getConfig = (req, res) => res.json({ publishableKey: process.env.STRIPE_PUBLIC_KEY });
const createPaymentIntent = async (req, res) => {
  try {
    const { amount } = req.body;
    const intent = await stripeLib.paymentIntents.create({ amount: amount * 100, currency: 'inr' });
    res.json({ clientSecret: intent.client_secret });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
module.exports.paymentController = { getConfig, createPaymentIntent };
