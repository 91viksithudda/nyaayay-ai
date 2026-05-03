const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'assistant', 'system'],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  tokensUsed: {
    type: Number,
    default: 0,
  },
});

const chatSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  title: {
    type: String,
    default: 'New Conversation',
    maxlength: 200,
  },
  messages: [messageSchema],
  totalTokens: {
    type: Number,
    default: 0,
  },
  isArchived: {
    type: Boolean,
    default: false,
  },
  language: {
    type: String,
    enum: ['en', 'hi'],
    default: 'en',
  },
}, { timestamps: true });

// Auto-generate title from first user message
chatSchema.pre('save', function (next) {
  if (this.isNew && this.messages && this.messages.length > 0) {
    const firstUserMsg = this.messages.find(m => m.role === 'user');
    if (firstUserMsg) {
      this.title = firstUserMsg.content.slice(0, 60) + (firstUserMsg.content.length > 60 ? '...' : '');
    }
  }
  next();
});

module.exports = mongoose.model('Chat', chatSchema);
