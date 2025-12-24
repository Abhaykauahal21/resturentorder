const MenuItem = require('../models/MenuItem');

async function listMenu(req, res, next) {
  try {
    const includeUnavailable = req.query.includeUnavailable === 'true';
    const query = includeUnavailable ? {} : { isAvailable: true };
    const items = await MenuItem.find(query).sort({ category: 1, name: 1 });
    res.json(items);
  } catch (e) {
    next(e);
  }
}

async function createMenuItem(req, res, next) {
  try {
    const { name, description, price, category, image, isVeg, isAvailable } = req.body || {};
    if (!name || typeof price !== 'number' || !category) {
      return res.status(400).json({ message: 'name, price, and category are required' });
    }

    const created = await MenuItem.create({
      name: name.trim(),
      description: (description || '').trim(),
      price,
      category: category.trim(),
      image: (image || '').trim(),
      isVeg: !!isVeg,
      isAvailable: isAvailable !== false,
    });
    res.status(201).json(created);
  } catch (e) {
    next(e);
  }
}

async function updateMenuItem(req, res, next) {
  try {
    const updated = await MenuItem.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!updated) return res.status(404).json({ message: 'Menu item not found' });
    res.json(updated);
  } catch (e) {
    next(e);
  }
}

async function deleteMenuItem(req, res, next) {
  try {
    const deleted = await MenuItem.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Menu item not found' });
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
}

module.exports = { listMenu, createMenuItem, updateMenuItem, deleteMenuItem };
