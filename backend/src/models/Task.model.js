const mongoose = require('mongoose');

const TASK_PRIORITY = ['low', 'medium', 'high'];
const TASK_STATUS = ['pending', 'in-progress', 'completed'];

const taskSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true, trim: true, maxlength: 200 },
  description: { type: String, trim: true, maxlength: 2000, default: '' },
  priority: { type: String, enum: TASK_PRIORITY, default: 'medium' },
  status: { type: String, enum: TASK_STATUS, default: 'pending' },
  dueDate: { type: Date },
  relatedTo: {
    type: { type: String, enum: ['lead', 'contact', 'deal', null] },
    id: { type: mongoose.Schema.Types.ObjectId },
  },
}, { timestamps: true });

taskSchema.methods.toJSON = function () {
  const obj = this.toObject();
  obj.id = obj._id.toString();
  delete obj._id;
  delete obj.__v;
  return obj;
};

const Task = mongoose.model('Task', taskSchema);
module.exports = { Task, TASK_PRIORITY, TASK_STATUS };
