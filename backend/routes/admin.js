const router = require('express').Router();
const User = require('../models/User');
const Chat = require('../models/Chat');
const Draft = require('../models/Draft');
const { protect, adminOnly } = require('../middleware/auth');

// All admin routes require auth + admin role
router.use(protect, adminOnly);

// ─── GET /api/admin/stats ─────────────────────────────────────────────────────
router.get('/stats', async (req, res) => {
  try {
    const [totalUsers, blockedUsers, totalChats, totalDrafts] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isBlocked: true }),
      Chat.countDocuments(),
      Draft.countDocuments({ isDeleted: false }),
    ]);

    const planBreakdown = await User.aggregate([
      { $group: { _id: '$plan', count: { $sum: 1 } } },
    ]);

    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('name email plan credits usageCount createdAt isBlocked');

    const usageStats = await User.aggregate([
      {
        $group: {
          _id: null,
          totalQueries: { $sum: '$usageCount' },
          totalTokens: { $sum: '$totalTokensUsed' },
          avgCredits: { $avg: '$credits' },
        },
      },
    ]);

    res.json({
      totalUsers,
      blockedUsers,
      totalChats,
      totalDrafts,
      planBreakdown,
      recentUsers,
      usageStats: usageStats[0] || {},
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/admin/users ─────────────────────────────────────────────────────
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 20, search, plan } = req.query;
    const filter = {};
    if (search) filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
    if (plan) filter.plan = plan;

    const users = await User.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .select('-password -apiKey');

    const total = await User.countDocuments(filter);

    res.json({ users, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── PATCH /api/admin/users/:id/block ────────────────────────────────────────
router.patch('/users/:id/block', async (req, res) => {
  try {
    const { isBlocked } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isBlocked },
      { new: true }
    ).select('-password -apiKey');

    res.json({ user, message: isBlocked ? 'User blocked.' : 'User unblocked.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── PATCH /api/admin/users/:id/add-credits ──────────────────────────────────
router.patch('/users/:id/add-credits', async (req, res) => {
  try {
    const { credits } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $inc: { credits: parseInt(credits) } },
      { new: true }
    ).select('-password -apiKey');
    res.json({ user, message: `Added ${credits} credits.` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── DELETE /api/admin/users/:id ─────────────────────────────────────────────
router.delete('/users/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    await Chat.deleteMany({ userId: req.params.id });
    await Draft.updateMany({ userId: req.params.id }, { isDeleted: true });
    res.json({ message: 'User deleted.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
