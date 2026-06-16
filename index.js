require('dotenv').config();
const express     = require('express');
const cookieParser = require('cookie-parser');
const path        = require('path');
const connectDB   = require('./src/config/db');

const app = express();

connectDB();

app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/auth',       require('./src/routes/auth'));
app.use('/api/activities', require('./src/routes/activities'));
app.use('/api/photos',     require('./src/routes/photos'));

// Serve SPA for all non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
