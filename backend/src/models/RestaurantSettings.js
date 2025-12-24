const mongoose = require('mongoose');

const RestaurantSettingsSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, default: 'QuickServe Bistro' },
    logo: { type: String, default: '' },
    currency: { type: String, default: 'USD' },
    contactNumber: { type: String, default: '' },
    address: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('RestaurantSettings', RestaurantSettingsSchema);
