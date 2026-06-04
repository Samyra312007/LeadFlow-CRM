const Contact = require('../models/Contact.model');

const createContact = async (req, res, next) => {
  try {
    const contact = await Contact.create({ ...req.body, user: req.user.id });
    res.status(201).json({ success: true, data: contact });
  } catch (err) { next(err); }
};

const getAllContacts = async (req, res, next) => {
  try {
    let page = Math.max(1, parseInt(req.query.page) || 1);
    let limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const { search, sort = '-createdAt' } = req.query;
    const filter = { user: req.user.id };
    if (search) {
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [
        { name: { $regex: escaped, $options: 'i' } },
        { email: { $regex: escaped, $options: 'i' } },
        { company: { $regex: escaped, $options: 'i' } },
      ];
    }
    const skip = (page - 1) * limit;
    const total = await Contact.countDocuments(filter);
    const contacts = await Contact.find(filter).sort(sort).skip(skip).limit(limit);
    res.json({ success: true, data: contacts, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (err) { next(err); }
};

const getContactById = async (req, res, next) => {
  try {
    const contact = await Contact.findOne({ _id: req.params.id, user: req.user.id });
    if (!contact) return res.status(404).json({ success: false, message: 'Contact not found' });
    res.json({ success: true, data: contact });
  } catch (err) { next(err); }
};

const updateContact = async (req, res, next) => {
  try {
    const contact = await Contact.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { returnDocument: 'after', runValidators: true }
    );
    if (!contact) return res.status(404).json({ success: false, message: 'Contact not found' });
    res.json({ success: true, data: contact });
  } catch (err) { next(err); }
};

const deleteContact = async (req, res, next) => {
  try {
    const contact = await Contact.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!contact) return res.status(404).json({ success: false, message: 'Contact not found' });
    res.json({ success: true, message: 'Contact deleted successfully' });
  } catch (err) { next(err); }
};

module.exports = { createContact, getAllContacts, getContactById, updateContact, deleteContact };
