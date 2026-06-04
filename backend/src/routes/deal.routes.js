const { Router } = require('express');
const { auth } = require('../middleware/auth');
const ctrl = require('../controllers/deal.controller');

const router = Router();
router.use(auth);

router.post('/', ctrl.createDeal);
router.get('/', ctrl.getAllDeals);
router.get('/stats', ctrl.getDealStats);
router.get('/:id', ctrl.getDealById);
router.put('/:id', ctrl.updateDeal);
router.patch('/:id/stage', ctrl.updateDealStage);
router.delete('/:id', ctrl.deleteDeal);

module.exports = router;
