const router = require('express').Router();
const User = require('../models/User');
const Chat = require('../models/Chat');
const Draft = require('../models/Draft');
const { protect } = require('../middleware/auth');

// ─── GET /api/user/profile ────────────────────────────────────────────────────
router.get('/profile', protect, async (req, res) => {
  try {
    const [chatCount, draftCount] = await Promise.all([
      Chat.countDocuments({ userId: req.user._id }),
      Draft.countDocuments({ userId: req.user._id, isDeleted: false }),
    ]);

    res.json({
      user: req.user.toSafeObject(),
      stats: {
        chatCount,
        draftCount,
        usageCount: req.user.usageCount,
        credits: req.user.credits,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── PATCH /api/user/profile ──────────────────────────────────────────────────
router.patch('/profile', protect, async (req, res) => {
  try {
    const allowed = ['name', 'language', 'theme'];
    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true });
    res.json({ user: user.toSafeObject(), message: 'Profile updated.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── PATCH /api/user/change-password ──────────────────────────────────────────
router.patch('/change-password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(400).json({ error: 'Current password is incorrect.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters.' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
