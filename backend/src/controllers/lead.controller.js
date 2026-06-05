const { Lead } = require('../models/Lead.model');

const getAllLeads = async (req, res, next) => {
  try {
    let page = Math.max(1, parseInt(req.query.page) || 1);
    let limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const { status, sort = '-createdAt', search } = req.query;

    const filter = { user: req.user.id };
    if (status) filter.status = status;
    if (search) {
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [
        { name: { $regex: escaped, $options: 'i' } },
        { email: { $regex: escaped, $options: 'i' } },
        { company: { $regex: escaped, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;
    const total = await Lead.countDocuments(filter);
    const leads = await Lead.find(filter).sort(sort).skip(skip).limit(limit);

    res.json({
      success: true,
      data: leads,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) { next(err); }
};

const getLeadById = async (req, res, next) => {
  try {
    const lead = await Lead.findOne({ _id: req.params.id, user: req.user.id });
    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }
    res.json({ success: true, data: lead });
  } catch (err) { next(err); }
};

const createLead = async (req, res, next) => {
  try {
    const lead = await Lead.create({ ...req.body, user: req.user.id });
    res.status(201).json({ success: true, data: lead });
  } catch (err) { next(err); }
};

const updateLead = async (req, res, next) => {
  try {
    const lead = await Lead.findOneAndUpdate({ _id: req.params.id, user: req.user.id }, req.body, {
      returnDocument: 'after',
      runValidators: true,
    });
    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }
    res.json({ success: true, data: lead });
  } catch (err) { next(err); }
};

const updateLeadStatus = async (req, res, next) => {
  try {
    const lead = await Lead.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { status: req.body.status },
      { returnDocument: 'after', runValidators: true }
    );
    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }
    res.json({ success: true, data: lead });
  } catch (err) { next(err); }
};

const deleteLead = async (req, res, next) => {
  try {
    const lead = await Lead.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }
    res.json({ success: true, message: 'Lead deleted successfully' });
  } catch (err) { next(err); }
};

const searchLeads = async (req, res, next) => {
  try {
    const { q } = req.query;
    let page = Math.max(1, parseInt(req.query.page) || 1);
    let limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));

    if (!q || !q.trim()) {
      return res.status(400).json({ success: false, message: 'Search query is required' });
    }

    const filter = { $text: { $search: q }, user: req.user.id };
    const skip = (page - 1) * limit;
    const total = await Lead.countDocuments(filter);
    const leads = await Lead.find(filter, { score: { $meta: 'textScore' } })
      .sort({ score: { $meta: 'textScore' } })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: leads,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) { next(err); }
};

const getStats = async (req, res, next) => {
  try {
    const stats = await Lead.getStats(req.user.id);
    res.json({ success: true, data: stats });
  } catch (err) { next(err); }
};

module.exports = {
  getAllLeads, getLeadById, createLead,
  updateLead, updateLeadStatus, deleteLead,
  searchLeads, getStats,
};
