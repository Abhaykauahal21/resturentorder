const jwt = require('jsonwebtoken');
const AdminUser = require('../models/AdminUser');

async function requireAdmin(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    const secret = process.env.JWT_SECRET;
    if (!secret) return res.status(500).json({ message: 'JWT_SECRET is not set' });

    const payload = jwt.verify(token, secret);
    const user = await AdminUser.findById(payload.sub);
    if (!user) return res.status(401).json({ message: 'Unauthorized' });
    if (user.role !== 'ADMIN') return res.status(403).json({ message: 'Forbidden' });

    req.admin = { id: user._id.toString(), email: user.email };
    next();
  } catch (e) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
}

module.exports = { requireAdmin };
