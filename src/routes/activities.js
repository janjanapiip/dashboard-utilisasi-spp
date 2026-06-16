const router       = require('express').Router();
const Activity     = require('../models/Activity');
const { requireAdmin } = require('../middleware/auth');

// GET /api/activities?month=Januari  (no auth — read is public)
router.get('/', async (req, res) => {
  try {
    const filter = req.query.month ? { month: req.query.month } : {};
    const activities = await Activity.find(filter).lean();
    res.json(activities);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/activities  (admin only)
router.post('/', requireAdmin, async (req, res) => {
  try {
    const act = await Activity.create(req.body);
    res.status(201).json(act);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/activities/:id  (admin only)
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const act = await Activity.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!act) return res.status(404).json({ error: 'Activity not found' });
    res.json(act);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/activities/:id  (admin only)
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    await Activity.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
