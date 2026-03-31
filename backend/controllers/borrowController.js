const BorrowRequest = require('../models/BorrowRequest');
const Listing = require('../models/Listing');
const User = require('../models/User');
const WalletTransaction = require('../models/WalletTransaction');
const Notification = require('../models/Notification');

// Helper: create notification
const notify = async (userId, type, title, message, extras = {}) => {
  await Notification.create({ user: userId, type, title, message, ...extras });
};

// @POST /api/borrow/request
const createBorrowRequest = async (req, res) => {
  try {
    const { listingId, startDate, endDate, requestMessage } = req.body;
    const listing = await Listing.findById(listingId).populate('owner');
    if (!listing) return res.status(404).json({ message: 'Listing not found' });
    if (!listing.isAvailable) return res.status(400).json({ message: 'Item is not available' });
    if (listing.owner._id.toString() === req.user._id.toString())
      return res.status(400).json({ message: 'You cannot borrow your own item' });

    const borrower = await User.findById(req.user._id);
    // Check wallet balance for deposit
    if (borrower.walletBalance < listing.depositAmount)
      return res.status(400).json({ message: `Insufficient wallet balance. Need ₹${listing.depositAmount} for deposit.` });

    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    const totalPrice = listing.isFree ? 0 : days * listing.pricePerDay;

    const borrowRequest = await BorrowRequest.create({
      listing: listingId,
      borrower: req.user._id,
      owner: listing.owner._id,
      startDate: start, endDate: end, totalDays: days,
      totalPrice, depositAmount: listing.depositAmount,
      requestMessage,
    });

    await notify(listing.owner._id, 'BorrowRequest',
      'New Borrow Request', `${borrower.name} wants to borrow "${listing.title}"`,
      { relatedBorrowRequest: borrowRequest._id, relatedListing: listing._id });

    res.status(201).json(borrowRequest);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @PUT /api/borrow/:id/respond — owner accepts/rejects
const respondToBorrowRequest = async (req, res) => {
  try {
    const { action, rejectionReason } = req.body; // action: 'accept' | 'reject'
    const request = await BorrowRequest.findById(req.params.id).populate('listing borrower owner');
    if (!request) return res.status(404).json({ message: 'Request not found' });
    if (request.owner._id.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });
    if (request.status !== 'Pending') return res.status(400).json({ message: 'Request already processed' });

    if (action === 'reject') {
      request.status = 'Rejected';
      request.rejectionReason = rejectionReason || '';
      await request.save();
      await notify(request.borrower._id, 'RequestRejected', 'Borrow Request Rejected',
        `Your request for "${request.listing.title}" was declined.`, { relatedBorrowRequest: request._id });
      return res.json(request);
    }

    // Accept: lock deposit from borrower's wallet
    const borrower = await User.findById(request.borrower._id);
    if (borrower.walletBalance < request.depositAmount)
      return res.status(400).json({ message: 'Borrower has insufficient wallet balance' });

    borrower.walletBalance -= request.depositAmount;
    borrower.lockedDeposits += request.depositAmount;
    await borrower.save();

    await WalletTransaction.create({
      user: borrower._id, type: 'LockDeposit', amount: request.depositAmount,
      balanceBefore: borrower.walletBalance + request.depositAmount,
      balanceAfter: borrower.walletBalance,
      description: `Deposit locked for "${request.listing.title}"`,
      relatedBorrowRequest: request._id,
    });

    request.status = 'Accepted';
    request.ownerAgreed = true;
    request.ownerAgreedAt = new Date();
    request.depositStatus = 'Locked';
    await request.save();

    // Mark listing as unavailable
    await Listing.findByIdAndUpdate(request.listing._id, {
      isAvailable: false, currentBorrower: request.borrower._id, currentBorrowRequest: request._id
    });

    await notify(request.borrower._id, 'RequestAccepted', 'Borrow Request Accepted! 🎉',
      `Your request for "${request.listing.title}" was accepted. Deposit of ₹${request.depositAmount} locked.`,
      { relatedBorrowRequest: request._id });

    res.json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @PUT /api/borrow/:id/activate — both parties agree, exchange happens
const activateBorrow = async (req, res) => {
  try {
    const request = await BorrowRequest.findById(req.params.id);
    if (!request || request.status !== 'Accepted') return res.status(400).json({ message: 'Invalid request' });
    request.status = 'Active';
    request.borrowerAgreed = true;
    request.borrowerAgreedAt = new Date();
    if (req.body.signature) request.borrowerSignature = req.body.signature;
    await request.save();
    res.json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @PUT /api/borrow/:id/return-proof — borrower uploads return photos
const uploadReturnProof = async (req, res) => {
  try {
    const request = await BorrowRequest.findById(req.params.id).populate('listing owner');
    if (!request) return res.status(404).json({ message: 'Not found' });
    if (request.borrower.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Only borrower can upload return proof' });

    const photos = req.files ? req.files.map(f => ({
      url: `/uploads/${f.filename}`, uploadedAt: new Date(), uploadedBy: req.user._id
    })) : [];

    request.returnPhotos = photos;
    request.returnNotes = req.body.returnNotes || '';
    request.conditionOnReturn = req.body.conditionOnReturn || 'Same';
    request.returnProofUploadedAt = new Date();
    request.status = 'ReturnProofUploaded';
    await request.save();

    await notify(request.owner._id, 'ReturnProofUploaded', 'Return Proof Submitted',
      `Borrower has submitted return proof for "${request.listing.title}". Please confirm.`,
      { relatedBorrowRequest: request._id });

    res.json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @PUT /api/borrow/:id/complete — owner confirms return, releases deposit
const completeReturn = async (req, res) => {
  try {
    const request = await BorrowRequest.findById(req.params.id).populate('listing');
    if (!request) return res.status(404).json({ message: 'Not found' });
    if (request.owner.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Only owner can confirm return' });

    const borrower = await User.findById(request.borrower);
    borrower.lockedDeposits -= request.depositAmount;
    borrower.walletBalance += request.depositAmount;
    // Give XP
    borrower.xpPoints += 50;
    await borrower.save();

    await WalletTransaction.create({
      user: borrower._id, type: 'ReleaseDeposit', amount: request.depositAmount,
      balanceBefore: borrower.walletBalance - request.depositAmount,
      balanceAfter: borrower.walletBalance,
      description: `Deposit released for "${request.listing.title}"`,
      relatedBorrowRequest: request._id,
    });

    // Owner gets XP
    await User.findByIdAndUpdate(request.owner, { $inc: { xpPoints: 30 } });

    request.status = 'Completed';
    request.completedAt = new Date();
    request.depositStatus = 'Released';
    await request.save();

    await Listing.findByIdAndUpdate(request.listing._id, {
      isAvailable: true, currentBorrower: null, currentBorrowRequest: null,
      $inc: { totalBorrows: 1 }
    });

    await notify(request.borrower, 'DepositReleased', 'Deposit Released ✅',
      `Your ₹${request.depositAmount} deposit has been released back to your wallet.`,
      { relatedBorrowRequest: request._id });

    res.json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @GET /api/borrow/my — get all borrow requests for current user
const getMyBorrowRequests = async (req, res) => {
  try {
    const asBorrower = await BorrowRequest.find({ borrower: req.user._id })
      .populate('listing', 'title images pricePerDay')
      .populate('owner', 'name avatar trustScore')
      .sort('-createdAt');
    const asOwner = await BorrowRequest.find({ owner: req.user._id })
      .populate('listing', 'title images')
      .populate('borrower', 'name avatar trustScore')
      .sort('-createdAt');
    res.json({ asBorrower, asOwner });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @GET /api/borrow/:id
const getBorrowRequest = async (req, res) => {
  try {
    const request = await BorrowRequest.findById(req.params.id)
      .populate('listing')
      .populate('borrower', 'name avatar trustScore trustLevel')
      .populate('owner', 'name avatar trustScore trustLevel');
    if (!request) return res.status(404).json({ message: 'Not found' });
    res.json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  createBorrowRequest, respondToBorrowRequest, activateBorrow,
  uploadReturnProof, completeReturn, getMyBorrowRequests, getBorrowRequest
};
