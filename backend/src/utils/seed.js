const bcrypt = require('bcryptjs');
const AdminUser = require('../models/AdminUser');
const MenuItem = require('../models/MenuItem');

async function ensureSeedData() {
  const seed = process.env.SEED_DATA !== 'false';
  if (!seed) return;

  const adminEmail = (process.env.SEED_ADMIN_EMAIL || 'admin@admin.com').toLowerCase().trim();
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'admin';

  const adminCount = await AdminUser.countDocuments();
  if (adminCount === 0) {
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    await AdminUser.create({ email: adminEmail, passwordHash, role: 'ADMIN' });
  }

  const menuCount = await MenuItem.countDocuments();
  if (menuCount === 0) {
    await MenuItem.insertMany([
      {
        name: 'Crispy Paneer Wings',
        price: 12.99,
        description: 'Spicy and crispy paneer bites served with mint chutney.',
        category: 'Starters',
        image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?q=80&w=400&h=300&auto=format&fit=crop',
        isVeg: true,
        isAvailable: true,
      },
      {
        name: 'Chicken Tikka Platter',
        price: 15.5,
        description: 'Classic grilled chicken marinated in aromatic spices.',
        category: 'Starters',
        image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?q=80&w=400&h=300&auto=format&fit=crop',
        isVeg: false,
        isAvailable: true,
      },
      {
        name: 'Classic Butter Chicken',
        price: 18,
        description: 'Tender chicken cooked in rich tomato and butter gravy.',
        category: 'Main Course',
        image: 'https://images.unsplash.com/photo-1603894527134-99e44e3914a9?q=80&w=400&h=300&auto=format&fit=crop',
        isVeg: false,
        isAvailable: true,
      },
      {
        name: 'Dal Makhani',
        price: 14.5,
        description: 'Overnight slow-cooked black lentils with cream.',
        category: 'Main Course',
        image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?q=80&w=400&h=300&auto=format&fit=crop',
        isVeg: true,
        isAvailable: true,
      },
      {
        name: 'Mango Lassi',
        price: 4.99,
        description: 'Refreshing yogurt drink with real mango pulp.',
        category: 'Beverages',
        image: 'https://images.unsplash.com/photo-1517093157656-b99917c6471f?q=80&w=400&h=300&auto=format&fit=crop',
        isVeg: true,
        isAvailable: true,
      },
      {
        name: 'Hot Chocolate Brownie',
        price: 7.5,
        description: 'Sizzling brownie with vanilla ice cream.',
        category: 'Desserts',
        image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?q=80&w=400&h=300&auto=format&fit=crop',
        isVeg: true,
        isAvailable: true,
      },
    ]);
  }
}

module.exports = { ensureSeedData };
