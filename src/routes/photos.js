const router       = require('express').Router();
const Photo        = require('../models/Photo');
const { requireAdmin } = require('../middleware/auth');

// GET /api/photos?month=Januari  → { key: photos[] }  (public)
// GET /api/photos?key=...        → photos[]           (public)
router.get('/', async (req, res) => {
  try {
    const { key, month } = req.query;
    if (key) {
      const doc = await Photo.findOne({ key }).lean();
      return res.json(doc ? doc.photos : []);
    }
    if (month) {
      // Keys start with "month||"
      const docs = await Photo.find({ key: new RegExp(`^${escapeReg(month)}\\|\\|`) }).lean();
      const map  = {};
      docs.forEach(d => { map[d.key] = d.photos; });
      return res.json(map);
    }
    res.status(400).json({ error: 'Provide key or month query param' });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/photos  { key, dataUrl, filename }  → returns updated photos[]  (admin)
router.post('/', requireAdmin, async (req, res) => {
  try {
    const { key, dataUrl, filename } = req.body;
    if (!key || !dataUrl || !filename)
      return res.status(400).json({ error: 'key, dataUrl, filename required' });

    const doc = await Photo.findOneAndUpdate(
      { key },
      { $push: { photos: { dataUrl, filename } } },
      { upsert: true, new: true }
    );
    res.json(doc.photos);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/photos  { key, idx }  → returns updated photos[]  (admin)
router.delete('/', requireAdmin, async (req, res) => {
  try {
    const { key, idx } = req.body;
    if (!key || idx === undefined)
      return res.status(400).json({ error: 'key and idx required' });

    const doc = await Photo.findOne({ key });
    if (!doc) return res.status(404).json({ error: 'Photo document not found' });

    doc.photos.splice(parseInt(idx), 1);
    await doc.save();
    res.json(doc.photos);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

function escapeReg(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

module.exports = router;
