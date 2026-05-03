const mongoose = require('mongoose');

const draftSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  type: {
    type: String,
    enum: ['fir', 'complaint', 'agreement', 'notice', 'affidavit', 'bail_application', 'power_of_attorney'],
    required: true,
  },
  title: {
    type: String,
    required: true,
    maxlength: 200,
  },
  formData: {
    type: mongoose.Schema.Types.Mixed, // Dynamic form inputs stored
    default: {},
  },
  content: {
    type: String,
    required: true,
  },
  editedContent: String, // After user edits
  language: {
    type: String,
    enum: ['en', 'hi'],
    default: 'en',
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  tokensUsed: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

module.exports = mongoose.model('Draft', draftSchema);
