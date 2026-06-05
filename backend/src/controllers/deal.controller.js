const { Deal, DEAL_STAGES } = require('../models/Deal.model');

const createDeal = async (req, res, next) => {
  try {
    const deal = await Deal.create({ ...req.body, user: req.user.id });
    res.status(201).json({ success: true, data: deal });
  } catch (err) { next(err); }
};

const getAllDeals = async (req, res, next) => {
  try {
    let page = Math.max(1, parseInt(req.query.page) || 1);
    let limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const { stage, search, sort = '-createdAt' } = req.query;
    const filter = { user: req.user.id };
    if (stage) filter.stage = stage;
    if (search) {
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.title = { $regex: escaped, $options: 'i' };
    }
    const skip = (page - 1) * limit;
    const total = await Deal.countDocuments(filter);
    const deals = await Deal.find(filter)
      .populate('contact', 'name email company')
      .populate('lead', 'name email')
      .sort(sort).skip(skip).limit(limit);
    res.json({ success: true, data: deals, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (err) { next(err); }
};

const getDealById = async (req, res, next) => {
  try {
    const deal = await Deal.findOne({ _id: req.params.id, user: req.user.id })
      .populate('contact', 'name email company')
      .populate('lead', 'name email');
    if (!deal) return res.status(404).json({ success: false, message: 'Deal not found' });
    res.json({ success: true, data: deal });
  } catch (err) { next(err); }
};

const updateDeal = async (req, res, next) => {
  try {
    const deal = await Deal.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { returnDocument: 'after', runValidators: true }
    );
    if (!deal) return res.status(404).json({ success: false, message: 'Deal not found' });
    res.json({ success: true, data: deal });
  } catch (err) { next(err); }
};

const updateDealStage = async (req, res, next) => {
  try {
    if (!DEAL_STAGES.includes(req.body.stage)) {
      return res.status(400).json({ success: false, message: 'Invalid stage' });
    }
    const deal = await Deal.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { stage: req.body.stage },
      { returnDocument: 'after', runValidators: true }
    );
    if (!deal) return res.status(404).json({ success: false, message: 'Deal not found' });
    res.json({ success: true, data: deal });
  } catch (err) { next(err); }
};

const deleteDeal = async (req, res, next) => {
  try {
    const deal = await Deal.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!deal) return res.status(404).json({ success: false, message: 'Deal not found' });
    res.json({ success: true, message: 'Deal deleted successfully' });
  } catch (err) { next(err); }
};

const getDealStats = async (req, res, next) => {
  try {
    const stages = await Deal.aggregate([
      { $match: { user: req.user._id } },
      { $group: { _id: '$stage', count: { $sum: 1 }, totalValue: { $sum: '$value' } } },
    ]);
    const byStage = {};
    let totalValue = 0;
    let total = 0;
    DEAL_STAGES.forEach((s) => { byStage[s] = 0; });
    stages.forEach((s) => {
      byStage[s._id] = s.count;
      totalValue += s.totalValue;
      total += s.count;
    });
    res.json({ success: true, data: { byStage, total, totalValue } });
  } catch (err) { next(err); }
};

module.exports = { createDeal, getAllDeals, getDealById, updateDeal, updateDealStage, deleteDeal, getDealStats };
