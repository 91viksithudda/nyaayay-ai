const router = require('express').Router();
const { body, validationResult } = require('express-validator');
const OpenAI = require('openai');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { encryptApiKey, decryptApiKey, maskApiKey } = require('../utils/encryption');

// ─── GET /api/apikeys — get API key status ────────────────────────────────────
router.get('/', protect, async (req, res) => {
  try {
    const user = req.user;
    res.json({
      hasApiKey: !!user.apiKey,
      maskedKey: user.apiKey ? maskApiKey(decryptApiKey(user.apiKey)) : null,
      useOwnApiKey: user.useOwnApiKey,
      apiKeyProvider: user.apiKeyProvider,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── POST /api/apikeys — save API key ─────────────────────────────────────────
router.post(
  '/',
  protect,
  [
    body('apiKey').notEmpty().withMessage('API key is required'),
    body('provider').optional().isIn(['openai', 'gemini', 'groq', 'xai']).withMessage('Invalid provider'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('[APIKeys] Validation Error:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { provider = 'openai' } = req.body;
      const apiKey = req.body.apiKey?.trim();

      if (!apiKey) {
        return res.status(400).json({ error: 'API key is required' });
      }

      // Validate key format
      if (provider === 'openai' && !apiKey.startsWith('sk-')) {
        return res.status(400).json({ error: 'Invalid OpenAI API key format. Must start with "sk-".' });
      }

      const encrypted = encryptApiKey(apiKey);

      await User.findByIdAndUpdate(req.user._id, {
        apiKey: encrypted,
        apiKeyProvider: provider,
      });

      res.json({ message: 'API key saved and encrypted successfully.', provider });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// ─── POST /api/apikeys/test — test API key ────────────────────────────────────
router.post('/test', protect, async (req, res) => {
  try {
    const { apiKey, provider = 'openai' } = req.body;

    if (!apiKey) {
      return res.status(400).json({ error: 'API key is required.' });
    }

    if (provider === 'gemini') {
      const genAI = new GoogleGenerativeAI(apiKey);
      // Try a comprehensive list of models found in your project
      const modelsToTry = [
        'gemini-2.0-flash', 
        'gemini-2.0-flash-latest',
        'gemini-flash-latest',
        'gemini-1.5-flash', 
        'gemini-pro',
        'gemini-pro-latest'
      ];
      let lastErr = null;

      for (const modelName of modelsToTry) {
        try {
          const model = genAI.getGenerativeModel({ model: modelName });
          const result = await model.generateContent('Say OK');
          const response = await result.response;
          if (response.text()) {
            return res.json({ valid: true, message: `Gemini API key is valid! (Using ${modelName})` });
          }
        } catch (e) {
          console.error(`[Gemini Test] Model ${modelName} failed:`, e);
          lastErr = e;
          continue;
        }
      }
      // If we reach here, all models failed.
      // Log the final error detail
      console.error('[Gemini Test] All models failed. Final error:', lastErr);
      throw lastErr;
    }

    if (provider === 'xai') {
      const client = new OpenAI({ apiKey, baseURL: 'https://api.x.ai/v1' });
      const response = await client.chat.completions.create({
        model: 'grok-beta',
        messages: [{ role: 'user', content: 'Say OK' }],
        max_tokens: 5,
      });
      if (response.choices[0].message.content) {
        return res.json({ valid: true, message: 'Grok (xAI) API key is valid and working!' });
      }
    }

    // Test with a minimal prompt (OpenAI)
    const client = new OpenAI({ apiKey });
    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: 'Say OK' }],
      max_tokens: 5,
    });

    if (response.choices[0].message.content) {
      res.json({ valid: true, message: 'OpenAI API key is valid and working!' });
    }
  } catch (err) {
    console.error('[API Test Error]:', err);
    
    const isAuthError = 
      err?.status === 401 || 
      err?.status === 'UNAUTHENTICATED' || 
      err?.message?.includes('API_KEY_INVALID') ||
      err?.message?.includes('Invalid API key') ||
      err?.response?.status === 401;

    if (isAuthError) {
      return res.status(400).json({ valid: false, error: 'Invalid API key. Please check and try again.' });
    }
    
    if (err?.status === 429 || err?.message?.includes('quota')) {
      return res.status(400).json({ valid: false, error: 'API Quota exceeded. Please check your billing/tier.' });
    }

    res.status(400).json({ valid: false, error: 'Could not verify key: ' + (err.message || 'Unknown error') });
  }
});

// ─── PATCH /api/apikeys/toggle — toggle BYOK mode ────────────────────────────
router.patch('/toggle', protect, async (req, res) => {
  try {
    const { useOwnApiKey } = req.body;
    const user = req.user;

    if (useOwnApiKey && !user.apiKey) {
      return res.status(400).json({ error: 'Please add your API key first.' });
    }

    const updated = await User.findByIdAndUpdate(
      user._id,
      { useOwnApiKey: !!useOwnApiKey },
      { new: true }
    );

    res.json({
      useOwnApiKey: updated.useOwnApiKey,
      message: useOwnApiKey
        ? 'Now using your own API key.'
        : 'Now using platform API (credits will be deducted).',
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── DELETE /api/apikeys — remove API key ────────────────────────────────────
router.delete('/', protect, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, {
      apiKey: null,
      useOwnApiKey: false,
    });
    res.json({ message: 'API key removed.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
