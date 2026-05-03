const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testKey() {
  const apiKey = process.env.GEMINI_API_KEY || 'YOUR_GEMINI_API_KEY'; // User provided key
  const genAI = new GoogleGenerativeAI(apiKey);
  
  const models = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro'];
  
  console.log('Testing Gemini Key:', apiKey.slice(0, 7) + '...');

  for (const modelName of models) {
    try {
      console.log(`Trying model: ${modelName}...`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent('Say Hello');
      const response = await result.response;
      console.log(`SUCCESS with ${modelName}:`, response.text());
      return;
    } catch (err) {
      console.log(`FAILED with ${modelName}:`, err.message);
    }
  }
}

testKey();
