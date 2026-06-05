const mongoose = require('mongoose');

const DEAL_STAGES = ['Qualification', 'Demo', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'];

const dealSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true, trim: true, maxlength: 200 },
  value: { type: Number, default: 0, min: 0 },
  stage: { type: String, enum: DEAL_STAGES, default: 'Qualification' },
  contact: { type: mongoose.Schema.Types.ObjectId, ref: 'Contact' },
  lead: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead' },
  notes: { type: String, trim: true, maxlength: 2000, default: '' },
  expectedCloseDate: { type: Date },
}, { timestamps: true });

dealSchema.index({ title: 'text' });

dealSchema.methods.toJSON = function () {
  const obj = this.toObject();
  obj.id = obj._id;
  return obj;
};

const Deal = mongoose.model('Deal', dealSchema);
module.exports = { Deal, DEAL_STAGES };
