const express = require('express');
const { listMenu, createMenuItem, updateMenuItem, deleteMenuItem } = require('../controllers/menu.controller');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/', listMenu);
router.post('/', requireAdmin, createMenuItem);
router.patch('/:id', requireAdmin, updateMenuItem);
router.delete('/:id', requireAdmin, deleteMenuItem);

module.exports = router;
