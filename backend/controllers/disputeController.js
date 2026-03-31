const Dispute = require('../models/Dispute');
const BorrowRequest = require('../models/BorrowRequest');
const User = require('../models/User');
const WalletTransaction = require('../models/WalletTransaction');
const Notification = require('../models/Notification');

const notify = async (userId, type, title, message, extras = {}) => {
  await Notification.create({ user: userId, type, title, message, ...extras });
};

// @POST /api/disputes — file a dispute
const fileDispute = async (req, res) => {
  try {
    const { borrowRequestId, reason, description } = req.body;
    const borrowRequest = await BorrowRequest.findById(borrowRequestId).populate('listing');
    if (!borrowRequest) return res.status(404).json({ message: 'Borrow request not found' });

    const isOwner = borrowRequest.owner.toString() === req.user._id.toString();
    const isBorrower = borrowRequest.borrower.toString() === req.user._id.toString();
    if (!isOwner && !isBorrower) return res.status(403).json({ message: 'Not authorized' });

    const respondent = isOwner ? borrowRequest.borrower : borrowRequest.owner;
    const evidence = req.files ? req.files.map(f => ({ url: `/uploads/${f.filename}`, type: 'image', uploadedAt: new Date() })) : [];

    const dispute = await Dispute.create({
      borrowRequest: borrowRequestId,
      filer: req.user._id,
      respondent,
      listing: borrowRequest.listing._id,
      reason, description,
      filerEvidence: evidence,
      respondentResponseDeadline: new Date(Date.now() + 48 * 60 * 60 * 1000),
    });

    borrowRequest.status = 'Disputed';
    await borrowRequest.save();

    await notify(respondent, 'DisputeFiled', 'Dispute Filed Against You',
      `A dispute has been filed for "${borrowRequest.listing.title}". Respond within 48 hours.`,
      { relatedDispute: dispute._id, relatedBorrowRequest: borrowRequestId });

    res.status(201).json(dispute);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @PUT /api/disputes/:id/respond — respondent submits their evidence
const respondToDispute = async (req, res) => {
  try {
    const dispute = await Dispute.findById(req.params.id);
    if (!dispute) return res.status(404).json({ message: 'Dispute not found' });
    if (dispute.respondent.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });

    const evidence = req.files ? req.files.map(f => ({ url: `/uploads/${f.filename}`, type: 'image', uploadedAt: new Date() })) : [];
    dispute.respondentEvidence = evidence;
    dispute.respondentResponse = req.body.response || '';
    dispute.status = 'UnderAIReview';
    await dispute.save();
    res.json(dispute);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @PUT /api/disputes/:id/resolve — admin resolves dispute
const resolveDispute = async (req, res) => {
  try {
    const { resolution, faultAssigned, depositOutcome, depositDeductionPercent, adminNotes } = req.body;
    const dispute = await Dispute.findById(req.params.id).populate('borrowRequest');
    if (!dispute) return res.status(404).json({ message: 'Dispute not found' });
    if (req.user.role !== 'admin' && req.user.role !== 'moderator')
      return res.status(403).json({ message: 'Admin only' });

    dispute.resolution = resolution;
    dispute.faultAssigned = faultAssigned;
    dispute.depositOutcome = depositOutcome;
    dispute.depositDeductionPercent = depositDeductionPercent || 0;
    dispute.adminNotes = adminNotes;
    dispute.assignedAdmin = req.user._id;
    dispute.status = 'Resolved';
    dispute.resolvedAt = new Date();
    dispute.appealDeadline = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const borrowRequest = dispute.borrowRequest;
    const deduction = (depositDeductionPercent / 100) * borrowRequest.depositAmount;
    const release = borrowRequest.depositAmount - deduction;

    const borrower = await User.findById(borrowRequest.borrower);
    borrower.lockedDeposits -= borrowRequest.depositAmount;

    if (depositOutcome === 'FullRelease') {
      borrower.walletBalance += borrowRequest.depositAmount;
      await WalletTransaction.create({ user: borrower._id, type: 'ReleaseDeposit', amount: borrowRequest.depositAmount, description: 'Full deposit released after dispute resolution', relatedDispute: dispute._id });
    } else if (depositOutcome === 'FullForfeit') {
      await WalletTransaction.create({ user: borrower._id, type: 'ForfeitDeposit', amount: borrowRequest.depositAmount, description: 'Full deposit forfeited after dispute resolution', relatedDispute: dispute._id });
    } else if (depositOutcome === 'PartialDeduction') {
      borrower.walletBalance += release;
      await WalletTransaction.create({ user: borrower._id, type: 'PartialDeduction', amount: deduction, description: `Partial deposit deduction (${depositDeductionPercent}%)`, relatedDispute: dispute._id });
    }

    // Trust score penalties
    const penaltyMap = { 'Minor Damage': -10, 'Major Damage': -30, 'Destroyed': -100 };
    if (faultAssigned === 'Borrower') {
      borrower.trustScore = Math.max(0, (borrower.trustScore || 100) + (penaltyMap[dispute.aiDamageLevel] || -10));
    }
    await borrower.save();

    borrowRequest.status = 'Completed';
    borrowRequest.depositStatus = depositOutcome === 'FullRelease' ? 'Released' : depositOutcome === 'FullForfeit' ? 'Forfeited' : 'Partial';
    await borrowRequest.save();

    await dispute.save();

    await notify(borrowRequest.borrower, 'DisputeResolved', 'Dispute Resolved',
      `The dispute has been resolved. Check your dashboard for details.`, { relatedDispute: dispute._id });
    await notify(borrowRequest.owner, 'DisputeResolved', 'Dispute Resolved',
      `The dispute has been resolved by admin.`, { relatedDispute: dispute._id });

    res.json(dispute);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @GET /api/disputes/my
const getMyDisputes = async (req, res) => {
  try {
    const disputes = await Dispute.find({
      $or: [{ filer: req.user._id }, { respondent: req.user._id }]
    }).populate('listing', 'title images').populate('borrowRequest').sort('-createdAt');
    res.json(disputes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @GET /api/disputes — admin: all disputes
const getAllDisputes = async (req, res) => {
  try {
    const disputes = await Dispute.find()
      .populate('filer', 'name avatar').populate('respondent', 'name avatar')
      .populate('listing', 'title').sort('-createdAt');
    res.json(disputes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @GET /api/disputes/:id
const getDispute = async (req, res) => {
  try {
    const dispute = await Dispute.findById(req.params.id)
      .populate('filer', 'name avatar trustScore').populate('respondent', 'name avatar trustScore')
      .populate('listing').populate('borrowRequest').populate('assignedAdmin', 'name');
    if (!dispute) return res.status(404).json({ message: 'Not found' });
    res.json(dispute);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { fileDispute, respondToDispute, resolveDispute, getMyDisputes, getAllDisputes, getDispute };
