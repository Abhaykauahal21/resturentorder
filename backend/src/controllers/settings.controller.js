const RestaurantSettings = require('../models/RestaurantSettings');

async function getRestaurantSettings(req, res, next) {
  try {
    const settings = await RestaurantSettings.findOne({});
    res.json(
      settings || {
        name: 'QuickServe Bistro',
        logo: '',
        currency: 'USD',
        contactNumber: '',
        address: '',
      }
    );
  } catch (e) {
    next(e);
  }
}

async function updateRestaurantSettings(req, res, next) {
  try {
    const payload = req.body || {};
    const updated = await RestaurantSettings.findOneAndUpdate({}, payload, { new: true, upsert: true, runValidators: true });
    res.json(updated);
  } catch (e) {
    next(e);
  }
}

module.exports = { getRestaurantSettings, updateRestaurantSettings };
