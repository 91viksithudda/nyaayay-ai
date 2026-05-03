const router = require('express').Router();
const { body, validationResult } = require('express-validator');
const Draft = require('../models/Draft');
const User = require('../models/User');
const { protect, checkCredits } = require('../middleware/auth');
const { generateDraft } = require('../utils/openai');

// ─── GET /api/drafts — list user drafts ──────────────────────────────────────
router.get('/', protect, async (req, res) => {
  try {
    const { type, page = 1, limit = 20 } = req.query;
    const filter = { userId: req.user._id, isDeleted: false };
    if (type) filter.type = type;

    const drafts = await Draft.find(filter)
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .select('-content -editedContent')
      .lean();

    const total = await Draft.countDocuments(filter);

    res.json({ drafts, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/drafts/:id — get single draft ───────────────────────────────────
router.get('/:id', protect, async (req, res) => {
  try {
    const draft = await Draft.findOne({ _id: req.params.id, userId: req.user._id, isDeleted: false });
    if (!draft) return res.status(404).json({ error: 'Draft not found.' });
    res.json({ draft });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── POST /api/drafts/generate — generate a draft ────────────────────────────
router.post(
  '/generate',
  protect,
  checkCredits,
  [
    body('type').isIn(['fir', 'complaint', 'agreement', 'notice', 'affidavit', 'bail_application', 'power_of_attorney'])
      .withMessage('Invalid draft type'),
    body('formData').isObject().withMessage('Form data must be an object'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { type, formData, language = 'en' } = req.body;
      const user = req.user;

      // Generate with AI
      const response = await generateDraft(user, type, formData, language);
      const content = response.choices[0].message.content;
      const tokensUsed = response.usage?.total_tokens || 0;

      // Humanized title
      const titleMap = {
        fir: 'FIR', complaint: 'Complaint', agreement: 'Agreement',
        notice: 'Legal Notice', affidavit: 'Affidavit',
        bail_application: 'Bail Application', power_of_attorney: 'Power of Attorney',
      };

      const draft = await Draft.create({
        userId: user._id,
        type,
        title: `${titleMap[type]} — ${new Date().toLocaleDateString('en-IN')}`,
        formData,
        content,
        language,
        tokensUsed,
      });

      // Deduct credits/track usage
      if (!user.useOwnApiKey || !user.apiKey) {
        await User.findByIdAndUpdate(user._id, {
          $inc: { credits: -2, usageCount: 1, totalTokensUsed: tokensUsed },
        });
      } else {
        await User.findByIdAndUpdate(user._id, {
          $inc: { usageCount: 1, totalTokensUsed: tokensUsed },
        });
      }

      res.status(201).json({ draft, credits: user.credits });
    } catch (err) {
      console.error('Draft generation error:', err);
      if (err?.status === 401) {
        return res.status(400).json({ error: 'Invalid API key.' });
      }
      res.status(500).json({ error: err.message || 'Failed to generate draft.' });
    }
  }
);

// ─── PATCH /api/drafts/:id — update/edit draft ────────────────────────────────
router.patch('/:id', protect, async (req, res) => {
  try {
    const { editedContent, title } = req.body;
    const update = {};
    if (editedContent !== undefined) update.editedContent = editedContent;
    if (title) update.title = title;

    const draft = await Draft.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      update,
      { new: true }
    );
    if (!draft) return res.status(404).json({ error: 'Draft not found.' });
    res.json({ draft });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── DELETE /api/drafts/:id ───────────────────────────────────────────────────
router.delete('/:id', protect, async (req, res) => {
  try {
    await Draft.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { isDeleted: true }
    );
    res.json({ message: 'Draft deleted.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
