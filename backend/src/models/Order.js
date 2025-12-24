const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema(
  {
    tableNumber: { type: String, required: true },
    itemsList: { type: String, default: '' },
    items: [
      {
        menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' },
        quantity: { type: Number, min: 1 },
        price: { type: Number, min: 0 },
      },
    ],
    totalAmount: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ['RECEIVED', 'ACCEPTED', 'PREPARING', 'READY', 'SERVED', 'CANCELLED'],
      default: 'RECEIVED',
    },
    paymentStatus: {
      type: String,
      enum: ['PENDING', 'PAID', 'FAILED'],
      default: 'PENDING',
    },
    paymentMethod: {
      type: String,
      enum: ['CASH', 'ONLINE'],
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', OrderSchema);
