const { Router } = require('express');
const { auth } = require('../middleware/auth');
const ctrl = require('../controllers/task.controller');

const router = Router();
router.use(auth);

router.post('/', ctrl.createTask);
router.get('/', ctrl.getAllTasks);
router.get('/:id', ctrl.getTaskById);
router.put('/:id', ctrl.updateTask);
router.patch('/:id/status', ctrl.updateTaskStatus);
router.delete('/:id', ctrl.deleteTask);

module.exports = router;
