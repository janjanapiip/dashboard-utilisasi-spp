const router  = require('express').Router();
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const User    = require('../models/User');

const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: 'lax',
  maxAge:   24 * 60 * 60 * 1000, // 24 h
};

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ error: 'Username dan password wajib diisi.' });

    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ error: 'Username atau password salah.' });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ error: 'Username atau password salah.' });

    const payload = { id: user._id, username: user.username, role: user.role, name: user.name };
    const token   = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });

    const opts = { ...COOKIE_OPTS, secure: process.env.NODE_ENV === 'production' };
    res.cookie('sppToken', token, opts);
    res.json({ username: user.username, role: user.role, name: user.name });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.clearCookie('sppToken');
  res.json({ message: 'Logged out' });
});

// GET /api/auth/me  — always 200, returns role:'guest' when not logged in
router.get('/me', (req, res) => {
  const token = req.cookies.sppToken;
  if (!token) return res.json({ role: 'guest' });
  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ username: user.username, role: user.role, name: user.name });
  } catch {
    res.clearCookie('sppToken');
    res.json({ role: 'guest' });
  }
});

module.exports = router;
