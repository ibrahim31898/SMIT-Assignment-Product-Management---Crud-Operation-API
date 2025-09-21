// middleware/user.js
const jwt = require('jsonwebtoken');
const { User } = require('../model/user');

const JWT_SECRET = process.env.JWT_SECRET || 'Ali@4321'; // use env var in production

async function userAuth(req, res, next) {
  try {
    const { token } = req.cookies || {};
    if (!token) return res.status(401).json({ message: 'Unauthorized: token missing' });

    let payload;
    try {
      payload = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: 'Unauthorized: invalid token' });
    }

    const user = await User.findById(payload.id).select('-password');
    if (!user) return res.status(401).json({ message: 'Unauthorized: user not found' });

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error', error);
    res.status(500).json({ message: 'Server error' });
  }
}

module.exports = { userAuth };
