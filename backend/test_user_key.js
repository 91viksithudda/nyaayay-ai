const axios = require('axios');

async function check() {
  const apiKey = process.env.GEMINI_API_KEY || 'YOUR_GEMINI_API_KEY';
  const models = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-pro'];
  
  for (const m of models) {
    console.log(`Checking ${m}...`);
    const url = `https://generativelanguage.googleapis.com/v1/models/${m}:generateContent?key=${apiKey}`;
    try {
      const res = await axios.post(url, { contents: [{ parts: [{ text: 'Hi' }] }] });
      console.log(`SUCCESS with ${m}:`, res.data.candidates?.[0]?.content?.parts?.[0]?.text);
      return;
    } catch (err) {
      console.log(`FAILED ${m}:`, err.response?.data?.error?.message || err.message);
    }
  }
}

check();
