const { Router } = require('express');
const { auth } = require('../middleware/auth');
const ctrl = require('../controllers/contact.controller');

const router = Router();
router.use(auth);

router.post('/', ctrl.createContact);
router.get('/', ctrl.getAllContacts);
router.get('/:id', ctrl.getContactById);
router.put('/:id', ctrl.updateContact);
router.delete('/:id', ctrl.deleteContact);

module.exports = router;
