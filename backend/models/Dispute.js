const mongoose = require('mongoose');

const disputeSchema = new mongoose.Schema({
  borrowRequest: { type: mongoose.Schema.Types.ObjectId, ref: 'BorrowRequest', required: true },
  filer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  respondent: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  listing: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },

  status: {
    type: String,
    enum: ['Open', 'ResponsePending', 'UnderAIReview', 'AdminReview', 'Resolved', 'Appealed', 'Closed'],
    default: 'Open',
  },

  reason: { type: String, required: true },
  description: { type: String, required: true },

  // Evidence
  filerEvidence: [{ url: String, type: { type: String, enum: ['image', 'video', 'document'] }, uploadedAt: Date }],
  respondentEvidence: [{ url: String, type: { type: String, enum: ['image', 'video', 'document'] }, uploadedAt: Date }],
  respondentResponse: { type: String },
  respondentResponseDeadline: { type: Date },

  // AI Assessment
  aiDamageScore: { type: Number }, // 0-100
  aiDamageLevel: { type: String, enum: ['None', 'Minor', 'Moderate', 'Major', 'Destroyed'] },
  aiChatSummary: { type: String },
  aiRecommendedOutcome: { type: String },
  aiConfidenceScore: { type: Number },
  aiAssessmentAt: { type: Date },

  // Admin resolution
  assignedAdmin: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  adminNotes: { type: String },
  resolution: { type: String },
  faultAssigned: { type: String, enum: ['Borrower', 'Owner', 'Both', 'None'] },
  depositOutcome: { type: String, enum: ['FullRelease', 'FullForfeit', 'PartialDeduction', 'NoChange'] },
  depositDeductionPercent: { type: Number, default: 0 },
  resolvedAt: { type: Date },

  // Penalties applied
  penaltiesApplied: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    type: { type: String },
    trustScoreChange: Number,
    description: String,
  }],

  // Appeal
  appealFiled: { type: Boolean, default: false },
  appealFiledAt: { type: Date },
  appealEvidence: [{ url: String, uploadedAt: Date }],
  appealOutcome: { type: String, enum: ['Upheld', 'Rejected'] },
  appealReviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  appealDeadline: { type: Date },

  // Auto-trigger
  autoTriggered: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Dispute', disputeSchema);
