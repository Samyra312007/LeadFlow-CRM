const router = require('express').Router();

const {
  getAllLeads, getLeadById, createLead,
  updateLead, updateLeadStatus, deleteLead,
  searchLeads, getStats,
} = require('../controllers/lead.controller');

const validate = require('../middleware/validate');
const { createLeadSchema, updateLeadSchema, statusSchema } = require('../validators/lead.validator');

router.get('/stats', getStats);
router.get('/search', searchLeads);
router.get('/', getAllLeads);
router.get('/:id', getLeadById);
router.post('/', validate(createLeadSchema), createLead);
router.put('/:id', validate(updateLeadSchema), updateLead);
router.patch('/:id/status', validate(statusSchema), updateLeadStatus);
router.delete('/:id', deleteLead);

module.exports = router;
