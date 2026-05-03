const mongoose = require('mongoose');
const { encryptApiKey } = require('./utils/encryption');
require('dotenv').config();

async function updateKey() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const User = require('./models/User');
    
    const email = 'testuser@example.com';
    const rawKey = 'YOUR_GEMINI_API_KEY';
    const encryptedKey = encryptApiKey(rawKey);
    
    const user = await User.findOneAndUpdate(
      { email },
      { 
        apiKey: encryptedKey,
        apiKeyProvider: 'gemini',
        useOwnApiKey: true
      },
      { new: true }
    );
    
    if (user) {
      console.log(`SUCCESS: Updated user ${email} with Gemini key.`);
      console.log(`BYOK Mode: ${user.useOwnApiKey}`);
      console.log(`Provider: ${user.apiKeyProvider}`);
    } else {
      console.log(`FAILED: User ${email} not found.`);
    }
    
    process.exit(0);
  } catch (err) {
    console.error('ERROR:', err);
    process.exit(1);
  }
}

updateKey();
