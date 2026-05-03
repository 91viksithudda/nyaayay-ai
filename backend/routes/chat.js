const router = require('express').Router();
const { body, validationResult } = require('express-validator');
const Chat = require('../models/Chat');
const User = require('../models/User');
const { protect, checkCredits } = require('../middleware/auth');
const { chatCompletion } = require('../utils/openai');

// ─── GET /api/chat — list conversations ──────────────────────────────────────
router.get('/', protect, async (req, res) => {
  try {
    const chats = await Chat.find({ userId: req.user._id, isArchived: false })
      .select('title createdAt updatedAt messages')
      .sort({ updatedAt: -1 })
      .limit(50)
      .lean();

    const chatList = chats.map(c => ({
      _id: c._id,
      title: c.title,
      messageCount: c.messages.length,
      lastMessage: c.messages[c.messages.length - 1]?.content?.slice(0, 80) || '',
      updatedAt: c.updatedAt,
      createdAt: c.createdAt,
    }));

    res.json({ chats: chatList });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/chat/:id — get single conversation ──────────────────────────────
router.get('/:id', protect, async (req, res) => {
  try {
    const chat = await Chat.findOne({ _id: req.params.id, userId: req.user._id });
    if (!chat) return res.status(404).json({ error: 'Conversation not found.' });
    res.json({ chat });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── POST /api/chat — send message ────────────────────────────────────────────
router.post(
  '/',
  protect,
  checkCredits,
  [body('message').notEmpty().withMessage('Message cannot be empty')],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { message, chatId, language = 'en' } = req.body;
      const user = req.user;

      // Find or create conversation
      let chat;
      if (chatId) {
        chat = await Chat.findOne({ _id: chatId, userId: user._id });
        if (!chat) return res.status(404).json({ error: 'Conversation not found.' });
      } else {
        chat = new Chat({ userId: user._id, messages: [], language });
      }

      // Add user message
      chat.messages.push({ role: 'user', content: message });

      // Build message history for API (last 10 messages for context)
      const recentMessages = chat.messages.slice(-10).map(m => ({
        role: m.role,
        content: m.content,
      }));

      // Call AI
      const response = await chatCompletion(user, recentMessages, { language });
      const assistantContent = response.choices[0].message.content;
      const tokensUsed = response.usage?.total_tokens || 0;

      // Add assistant response
      chat.messages.push({
        role: 'assistant',
        content: assistantContent,
        tokensUsed,
      });
      chat.totalTokens += tokensUsed;

      // Auto-generate title on first message
      if (chat.messages.length === 2) {
        chat.title = message.slice(0, 60) + (message.length > 60 ? '...' : '');
      }

      await chat.save();

      // Deduct credit if using platform API
      if (!user.useOwnApiKey || !user.apiKey) {
        await User.findByIdAndUpdate(user._id, {
          $inc: { credits: -1, usageCount: 1, totalTokensUsed: tokensUsed },
        });
      } else {
        await User.findByIdAndUpdate(user._id, {
          $inc: { usageCount: 1, totalTokensUsed: tokensUsed },
        });
      }

      res.json({
        chatId: chat._id,
        message: {
          role: 'assistant',
          content: assistantContent,
          timestamp: new Date(),
        },
        credits: user.credits - (user.useOwnApiKey ? 0 : 1),
      });
    } catch (err) {
      console.error('Chat error:', err);
      if (err?.status === 401) {
        return res.status(400).json({ error: 'Invalid API key. Please check your key in settings.' });
      }
      res.status(500).json({ error: err.message || 'AI service error. Please try again.' });
    }
  }
);

// ─── DELETE /api/chat/:id — delete conversation ───────────────────────────────
router.delete('/:id', protect, async (req, res) => {
  try {
    await Chat.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    res.json({ message: 'Conversation deleted.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── PATCH /api/chat/:id/archive ─────────────────────────────────────────────
router.patch('/:id/archive', protect, async (req, res) => {
  try {
    const chat = await Chat.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { isArchived: true },
      { new: true }
    );
    res.json({ chat });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
