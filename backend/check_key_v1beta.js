const axios = require('axios');

async function check() {
  const apiKey = process.env.GEMINI_API_KEY || 'YOUR_GEMINI_API_KEY';
  // Use v1beta
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  
  try {
    const res = await axios.post(url, {
      contents: [{ parts: [{ text: 'Hello' }] }]
    });
    console.log('SUCCESS (v1beta):', res.data.candidates[0].content.parts[0].text);
  } catch (err) {
    console.log('STATUS:', err.response?.status);
    console.log('ERROR:', err.response?.data?.error || err.message);
  }
}

check();
