const { Task } = require('../models/Task.model');

const createTask = async (req, res, next) => {
  try {
    const task = await Task.create({ ...req.body, user: req.user.id });
    res.status(201).json({ success: true, data: task });
  } catch (err) { next(err); }
};

const getAllTasks = async (req, res, next) => {
  try {
    let page = Math.max(1, parseInt(req.query.page) || 1);
    let limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const { status, priority, sort = '-createdAt' } = req.query;
    const filter = { user: req.user.id };
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    const skip = (page - 1) * limit;
    const total = await Task.countDocuments(filter);
    const tasks = await Task.find(filter).sort(sort).skip(skip).limit(limit);
    res.json({ success: true, data: tasks, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (err) { next(err); }
};

const getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user.id });
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    res.json({ success: true, data: task });
  } catch (err) { next(err); }
};

const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { returnDocument: 'after', runValidators: true }
    );
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    res.json({ success: true, data: task });
  } catch (err) { next(err); }
};

const updateTaskStatus = async (req, res, next) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { status: req.body.status },
      { returnDocument: 'after', runValidators: true }
    );
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    res.json({ success: true, data: task });
  } catch (err) { next(err); }
};

const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    res.json({ success: true, message: 'Task deleted successfully' });
  } catch (err) { next(err); }
};

module.exports = { createTask, getAllTasks, getTaskById, updateTask, updateTaskStatus, deleteTask };
