const express = require('express');
const { createOrder, listOrders, getOrderById, updateOrderStatus } = require('../controllers/orders.controller');

const router = express.Router();

router.post('/', createOrder);
router.get('/', listOrders);
router.get('/:id', getOrderById);
router.patch('/:id/status', updateOrderStatus);

module.exports = router;
