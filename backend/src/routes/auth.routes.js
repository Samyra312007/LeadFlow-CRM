const { Router } = require('express');
const { register, login, getMe, updatePassword } = require('../controllers/auth.controller');
const { auth } = require('../middleware/auth');

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', auth, getMe);
router.put('/password', auth, updatePassword);

module.exports = router;
