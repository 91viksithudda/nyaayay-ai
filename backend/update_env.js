const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
const newKey = 'YOUR_GEMINI_API_KEY';

try {
  let envContent = fs.readFileSync(envPath, 'utf8');
  
  if (envContent.includes('PLATFORM_GEMINI_KEY=')) {
    // Update existing key
    envContent = envContent.replace(/PLATFORM_GEMINI_KEY=.*/, `PLATFORM_GEMINI_KEY=${newKey}`);
  } else {
    // Append new key
    envContent += `\nPLATFORM_GEMINI_KEY=${newKey}`;
  }
  
  fs.writeFileSync(envPath, envContent);
  console.log('SUCCESS: .env file updated with new PLATFORM_GEMINI_KEY.');
} catch (err) {
  console.error('ERROR:', err.message);
  // If file doesn't exist or other error, try to create it with basic content
  try {
     fs.writeFileSync(envPath, `PLATFORM_GEMINI_KEY=${newKey}\nMONGO_URI=mongodb://localhost:27017/nyayaai\nPORT=5000\nJWT_SECRET=supersecret\nENCRYPTION_KEY=default_key_change_in_prod_32chr`);
     console.log('SUCCESS: Created new .env file.');
  } catch (err2) {
     console.error('CRITICAL ERROR:', err2.message);
  }
}
