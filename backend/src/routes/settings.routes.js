const express = require('express');
const { getRestaurantSettings, updateRestaurantSettings } = require('../controllers/settings.controller');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/restaurant', getRestaurantSettings);
router.put('/restaurant', requireAdmin, updateRestaurantSettings);

module.exports = router;
