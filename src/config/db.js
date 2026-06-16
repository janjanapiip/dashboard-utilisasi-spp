const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

async function seedUsers() {
  const User = require('../models/User');
  const defaults = [
    { username: 'admin', password: 'adminSTIP', role: 'admin', name: 'Administrator' },
    { username: 'guest', password: 'guest',     role: 'guest', name: 'Guest'         },
  ];
  for (const u of defaults) {
    const exists = await User.findOne({ username: u.username });
    if (!exists) {
      const passwordHash = await bcrypt.hash(u.password, 10);
      await User.create({ username: u.username, passwordHash, role: u.role, name: u.name });
      console.log(`Seeded user: ${u.username}`);
    }
  }
}

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected');
    await seedUsers();
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
}

module.exports = connectDB;
