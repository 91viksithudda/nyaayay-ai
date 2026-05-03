const axios = require('axios');

async function check() {
  const apiKey = process.env.GEMINI_API_KEY || 'YOUR_GEMINI_API_KEY';
  const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  
  try {
    const res = await axios.post(url, {
      contents: [{ parts: [{ text: 'Hello' }] }]
    });
    console.log('SUCCESS:', res.data);
  } catch (err) {
    console.log('STATUS:', err.response?.status);
    console.log('ERROR:', err.response?.data?.error || err.message);
  }
}

check();
