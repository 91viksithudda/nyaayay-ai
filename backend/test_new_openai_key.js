const OpenAI = require('openai');

async function testKey() {
  const apiKey = process.env.OPENAI_API_KEY || 'YOUR_OPENAI_API_KEY';
  const openai = new OpenAI({ apiKey });
  
  try {
    const res = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: 'Say OK' }],
      max_tokens: 5
    });
    console.log('SUCCESS:', res.choices[0].message.content);
  } catch (err) {
    console.log('FAILED:', err.message);
  }
}

testKey();
