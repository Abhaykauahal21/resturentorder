const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');

async function createOrder(req, res, next) {
  try {
    const { tableNumber, totalAmount, paymentMethod, items, itemsList } = req.body || {};

    if (!tableNumber || typeof totalAmount !== 'number') {
      return res.status(400).json({ message: 'tableNumber and totalAmount are required' });
    }

    let normalizedItems = [];
    let computedItemsList = typeof itemsList === 'string' ? itemsList : '';

    if (Array.isArray(items) && items.length > 0) {
      const ids = items.map((i) => i.menuItem).filter(Boolean);
      const menuItems = await MenuItem.find({ _id: { $in: ids } });
      const byId = new Map(menuItems.map((m) => [m._id.toString(), m]));
      normalizedItems = items
        .map((i) => {
          const mi = i.menuItem ? byId.get(i.menuItem.toString()) : null;
          const quantity = Number(i.quantity || 0);
          if (!mi || !Number.isFinite(quantity) || quantity <= 0) return null;
          return { menuItem: mi._id, quantity, price: Number(mi.price) };
        })
        .filter(Boolean);

      computedItemsList = normalizedItems
        .map((i) => {
          const mi = byId.get(i.menuItem.toString());
          return mi ? `${i.quantity}x ${mi.name}` : null;
        })
        .filter(Boolean)
        .join(', ');
    }

    const order = await Order.create({
      tableNumber: String(tableNumber),
      totalAmount,
      paymentMethod: paymentMethod || 'CASH',
      status: 'RECEIVED',
      itemsList: computedItemsList,
      items: normalizedItems,
    });

    const io = req.app.get('socketio');
    if (io) io.emit('new_order', order);

    res.status(201).json(order);
  } catch (e) {
    next(e);
  }
}

async function listOrders(req, res, next) {
  try {
    const query = {};
    if (req.query.tableNumber) query.tableNumber = String(req.query.tableNumber);
    if (req.query.status) query.status = String(req.query.status);

    let limit = Number(req.query.limit);
    if (!Number.isFinite(limit) || limit <= 0) limit = 0;
    if (limit > 200) limit = 200;

    let q = Order.find(query).sort({ createdAt: -1 });
    if (limit) q = q.limit(limit);
    const orders = await q;
    res.json(orders);
  } catch (e) {
    next(e);
  }
}

async function getOrderById(req, res, next) {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (e) {
    next(e);
  }
}

async function updateOrderStatus(req, res, next) {
  try {
    const { status } = req.body || {};
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true, runValidators: true });
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const io = req.app.get('socketio');
    if (io) {
      io.to(req.params.id).emit('status_updated', order);
      io.emit('order_sync', order);
    }

    res.json(order);
  } catch (e) {
    next(e);
  }
}

module.exports = { createOrder, listOrders, getOrderById, updateOrderStatus };
