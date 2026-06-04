const mongoose = require('mongoose');

const LEAD_STATUS = {
  NEW: 'New',
  CONTACTED: 'Contacted',
  QUALIFIED: 'Qualified',
  CONVERTED: 'Converted',
  LOST: 'Lost',
};

const leadSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/, 'Invalid email format'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      minlength: [7, 'Phone number too short'],
      maxlength: [20, 'Phone number too long'],
    },
    company: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      maxlength: [150, 'Company name cannot exceed 150 characters'],
    },
    status: {
      type: String,
      enum: {
        values: Object.values(LEAD_STATUS),
        message: 'Status must be: New, Contacted, Qualified, Converted, Lost',
      },
      default: LEAD_STATUS.NEW,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [1000, 'Notes cannot exceed 1000 characters'],
      default: '',
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        return ret;
      },
    },
  }
);

leadSchema.index({ name: 'text', email: 'text', company: 'text' });
leadSchema.index({ status: 1 });
leadSchema.index({ createdAt: -1 });

leadSchema.statics.getStats = async function (userId) {
  const match = userId ? { $match: { user: new mongoose.Types.ObjectId(userId) } } : null;
  const pipeline = match ? [match, { $group: { _id: '$status', count: { $sum: 1 } } }] : [{ $group: { _id: '$status', count: { $sum: 1 } } }];
  const stats = await this.aggregate(pipeline);

  const total = userId ? await this.countDocuments({ user: userId }) : await this.countDocuments();
  const byStatus = stats.reduce((acc, s) => {
    acc[s._id] = s.count;
    return acc;
  }, {});

  Object.values(LEAD_STATUS).forEach((status) => {
    if (!byStatus[status]) byStatus[status] = 0;
  });

  const converted = byStatus[LEAD_STATUS.CONVERTED] || 0;
  const conversionRate = total > 0
    ? ((converted / total) * 100).toFixed(2) + '%'
    : '0.00%';

  return { total, byStatus, conversionRate };
};

const Lead = mongoose.model('Lead', leadSchema);

module.exports = { Lead, LEAD_STATUS };
