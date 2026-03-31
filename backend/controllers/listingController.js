const Listing = require('../models/Listing');
const User = require('../models/User');

// @GET /api/listings
const getListings = async (req, res) => {
  try {
    const { category, search, minPrice, maxPrice, isFree, lat, lng, radius = 10 } = req.query;
    let filter = { isAvailable: true };
    if (category) filter.category = category;
    if (isFree === 'true') filter.isFree = true;
    if (minPrice || maxPrice) filter.pricePerDay = {};
    if (minPrice) filter.pricePerDay.$gte = Number(minPrice);
    if (maxPrice) filter.pricePerDay.$lte = Number(maxPrice);
    if (search) filter.$text = { $search: search };

    let query = Listing.find(filter).populate('owner', 'name avatar trustScore trustLevel rating');

    if (lat && lng) {
      query = Listing.find({
        ...filter,
        location: { $near: { $geometry: { type: 'Point', coordinates: [Number(lng), Number(lat)] }, $maxDistance: radius * 1000 } }
      }).populate('owner', 'name avatar trustScore trustLevel rating');
    }

    const listings = await query.sort('-createdAt').limit(50);
    res.json(listings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @GET /api/listings/my
const getMyListings = async (req, res) => {
  try {
    const listings = await Listing.find({ owner: req.user._id }).sort('-createdAt');
    res.json(listings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @GET /api/listings/:id
const getListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id)
      .populate('owner', 'name avatar trustScore trustLevel rating reviewCount bio location');
    if (!listing) return res.status(404).json({ message: 'Listing not found' });
    res.json(listing);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @POST /api/listings
const createListing = async (req, res) => {
  try {
    const { title, description, category, pricePerDay, isFree, condition, estimatedValue, maxBorrowDays, damageRules, rentalTerms, address, lat, lng } = req.body;
    const images = req.files ? req.files.map(f => `/uploads/${f.filename}`) : [];
    if (images.length < 1) return res.status(400).json({ message: 'Upload at least 1 image' });

    const listing = await Listing.create({
      owner: req.user._id, title, description, category,
      pricePerDay: Number(pricePerDay) || 0,
      isFree: isFree === 'true',
      condition, estimatedValue: Number(estimatedValue) || 0,
      maxBorrowDays: Number(maxBorrowDays) || 7,
      damageRules, rentalTerms, images,
      location: { type: 'Point', coordinates: [Number(lng) || 0, Number(lat) || 0], address: address || '' },
    });

    // Give XP for listing
    await User.findByIdAndUpdate(req.user._id, { $inc: { xpPoints: 20 } });

    res.status(201).json(listing);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @PUT /api/listings/:id
const updateListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: 'Not found' });
    if (listing.owner.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not authorized' });
    const updates = { ...req.body };
    if (req.files && req.files.length) updates.images = req.files.map(f => `/uploads/${f.filename}`);
    const updated = await Listing.findByIdAndUpdate(req.params.id, updates, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @DELETE /api/listings/:id
const deleteListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: 'Not found' });
    if (listing.owner.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not authorized' });
    await listing.deleteOne();
    res.json({ message: 'Listing deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getListings, getMyListings, getListing, createListing, updateListing, deleteListing };
