const axios = require('axios');

async function listModels() {
  const apiKey = process.env.GEMINI_API_KEY || 'YOUR_GEMINI_API_KEY';
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
  
  try {
    const res = await axios.get(url);
    console.log('MODELS:', res.data.models.map(m => m.name));
  } catch (err) {
    console.log('STATUS:', err.response?.status);
    console.log('ERROR:', err.response?.data?.error || err.message);
  }
}

listModels();
