const router = require('express').Router();
const crypto = require('crypto');
const Razorpay = require('razorpay');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const PLAN_CREDITS = {
  basic: 200,
  pro: 1000,
  unlimited: 999999,
};

const PLAN_PRICES = {
  basic: 49900,    // ₹499/month in paise
  pro: 99900,      // ₹999/month in paise
  unlimited: 199900, // ₹1999/month in paise
};

// ─── POST /api/payments/create-order ─────────────────────────────────────────
router.post('/create-order', protect, async (req, res) => {
  try {
    const { plan } = req.body;

    if (!PLAN_PRICES[plan]) {
      return res.status(400).json({ error: 'Invalid plan.' });
    }

    const order = await razorpay.orders.create({
      amount: PLAN_PRICES[plan],
      currency: 'INR',
      receipt: `receipt_${req.user._id}_${Date.now()}`,
      notes: {
        userId: req.user._id.toString(),
        plan,
        userEmail: req.user.email,
      },
    });

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID,
      plan,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── POST /api/payments/verify ───────────────────────────────────────────────
router.post('/verify', protect, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan } = req.body;

    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ error: 'Payment verification failed.' });
    }

    // Update user plan
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 1);

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        plan,
        credits: PLAN_CREDITS[plan],
        subscriptionStatus: 'active',
        planExpiresAt: expiresAt,
        razorpayCustomerId: razorpay_payment_id,
      },
      { new: true }
    );

    res.json({
      success: true,
      message: `🎉 Successfully upgraded to ${plan.charAt(0).toUpperCase() + plan.slice(1)} plan!`,
      user: updatedUser.toSafeObject(),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── POST /api/payments/webhook ───────────────────────────────────────────────
router.post('/webhook', async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const body = req.body;

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(body)
      .digest('hex');

    if (signature !== expectedSignature) {
      return res.status(400).json({ error: 'Invalid webhook signature.' });
    }

    const event = JSON.parse(body.toString());
    console.log('Razorpay Webhook Event:', event.event);

    if (event.event === 'subscription.activated') {
      const sub = event.payload.subscription.entity;
      const notes = sub.notes;
      if (notes?.userId && notes?.plan) {
        await User.findByIdAndUpdate(notes.userId, {
          plan: notes.plan,
          credits: PLAN_CREDITS[notes.plan],
          subscriptionStatus: 'active',
          razorpaySubscriptionId: sub.id,
        });
      }
    }

    if (event.event === 'subscription.cancelled') {
      const sub = event.payload.subscription.entity;
      const notes = sub.notes;
      if (notes?.userId) {
        await User.findByIdAndUpdate(notes.userId, {
          subscriptionStatus: 'cancelled',
          plan: 'free',
          credits: 20,
        });
      }
    }

    res.json({ received: true });
  } catch (err) {
    console.error('Webhook error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/payments/plans ──────────────────────────────────────────────────
router.get('/plans', (req, res) => {
  res.json({
    plans: [
      { id: 'free', name: 'Free Trial', price: 0, credits: 20, features: ['20 AI queries', 'Basic chat', '2 drafts'] },
      { id: 'basic', name: 'Basic', price: 499, credits: 200, features: ['200 AI queries', 'All draft types', 'Chat history', 'Priority support'] },
      { id: 'pro', name: 'Pro', price: 999, credits: 1000, features: ['1000 AI queries', 'All features', 'Case strategy', 'PDF export', 'Multi-language'] },
      { id: 'unlimited', name: 'Unlimited', price: 1999, credits: 999999, features: ['Unlimited queries', 'Admin panel', 'API access', 'White-label', '24/7 support'] },
    ],
  });
});

module.exports = router;
