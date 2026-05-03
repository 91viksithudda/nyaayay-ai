const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Invalid email format'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },

  // API Key Management
  apiKey: {
    type: String,         // Stored encrypted
    default: null,
  },
  useOwnApiKey: {
    type: Boolean,
    default: false,
  },
  apiKeyProvider: {
    type: String,
    enum: ['openai', 'gemini', 'groq', 'xai'],
    default: 'openai',
  },

  // Subscription & Credits
  plan: {
    type: String,
    enum: ['free', 'basic', 'pro', 'unlimited'],
    default: 'free',
  },
  credits: {
    type: Number,
    default: 20,
  },
  usageCount: {
    type: Number,
    default: 0,
  },
  totalTokensUsed: {
    type: Number,
    default: 0,
  },

  // Razorpay
  razorpayCustomerId: String,
  razorpaySubscriptionId: String,
  subscriptionStatus: {
    type: String,
    enum: ['active', 'inactive', 'cancelled', 'expired'],
    default: 'inactive',
  },
  planExpiresAt: Date,

  // Preferences
  language: {
    type: String,
    enum: ['en', 'hi'],
    default: 'en',
  },
  theme: {
    type: String,
    enum: ['dark', 'light'],
    default: 'dark',
  },
  isBlocked: {
    type: Boolean,
    default: false,
  },
  lastActive: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

// Hash password before save
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Safe user object (strip sensitive fields)
userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.apiKey;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
