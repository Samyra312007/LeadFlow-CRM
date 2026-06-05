const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, lowercase: true, trim: true },
  phone: { type: String, trim: true },
  company: { type: String, trim: true, maxlength: 150 },
  position: { type: String, trim: true, maxlength: 100 },
  notes: { type: String, trim: true, maxlength: 2000, default: '' },
  source: { type: String, enum: ['Referral', 'Website', 'LinkedIn', 'Cold Call', 'Email', 'Event', 'Other'], default: 'Referral' },
}, { timestamps: true });

contactSchema.index({ name: 'text', email: 'text', company: 'text' });

contactSchema.methods.toJSON = function () {
  const obj = this.toObject();
  obj.id = obj._id;
  return obj;
};

const Contact = mongoose.model('Contact', contactSchema);
module.exports = Contact;
