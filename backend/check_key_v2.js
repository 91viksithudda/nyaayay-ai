const { GoogleGenerativeAI } = require('@google/generative-ai');

async function listModels() {
  const apiKey = process.env.GEMINI_API_KEY || 'YOUR_GEMINI_API_KEY';
  const genAI = new GoogleGenerativeAI(apiKey);
  
  try {
    // There isn't a direct listModels in the simple SDK, 
    // but we can try a different approach.
    console.log('Testing with gemini-1.0-pro...');
    const model = genAI.getGenerativeModel({ model: 'gemini-1.0-pro' });
    const result = await model.generateContent('Hello');
    console.log('SUCCESS:', (await result.response).text());
  } catch (err) {
    console.log('FAILED:', err.message);
  }
}

listModels();
