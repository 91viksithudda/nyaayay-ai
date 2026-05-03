const { GoogleGenerativeAI } = require('@google/generative-ai');
const OpenAI = require('openai');
const { decryptApiKey } = require('./encryption');

/**
 * AI Provider Factory
 */
const getAIClient = (user) => {
  const provider = user?.apiKeyProvider || 'openai';
  let apiKey = null;
  let source = 'platform';

  // 1. Get Platform Key (Fallback)
  if (provider === 'openai') apiKey = process.env.PLATFORM_OPENAI_KEY;
  if (provider === 'gemini') apiKey = process.env.PLATFORM_GEMINI_KEY;
  if (provider === 'xai') apiKey = process.env.PLATFORM_XAI_KEY;

  // 2. Override with User Key if BYOK is active
  if (user && user.useOwnApiKey && user.apiKey) {
    const decrypted = decryptApiKey(user.apiKey);
    if (decrypted) {
      apiKey = decrypted;
      source = 'byok';
    }
  }

  // Debug
  const maskedLog = apiKey ? `...${apiKey.slice(-4)}` : 'missing';
  console.log(`[AI] Using ${provider} (${source}) key: ${maskedLog}`);

  if (!apiKey || apiKey.includes('your_platform')) {
    throw new Error(`API Key for ${provider} is missing or invalid. Please add your own key in API Key Management.`);
  }

  return { provider, apiKey };
};

/**
 * Consolidated Chat Completion
 */
const chatCompletion = async (user, messages, options = {}) => {
  const { provider, apiKey } = getAIClient(user);
  const language = options.language || 'en';
  const systemPrompt = getLegalSystemPrompt(language);

  if (provider === 'gemini') {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: options.model || 'gemini-2.0-flash' });

    // Convert messages to Gemini format
    const chat = model.startChat({
      history: messages.slice(0, -1).map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      })),
      generationConfig: {
        maxOutputTokens: options.maxTokens || 2048,
        temperature: options.temperature || 0.7,
      },
    });

    const lastMessage = messages[messages.length - 1].content;
    const fullPrompt = `${systemPrompt}\n\nUser Question: ${lastMessage}`;
    const result = await chat.sendMessage(fullPrompt);
    const response = await result.response;
    const text = response.text();

    return {
      choices: [{ message: { content: text } }],
      usage: { total_tokens: 0 }, // Gemini SDK usage tracking is different
    };
  }

  // OpenAI / xAI
  const clientOptions = { apiKey };
  if (provider === 'xai') {
    clientOptions.baseURL = 'https://api.x.ai/v1';
  }

  const openai = new OpenAI(clientOptions);
  return await openai.chat.completions.create({
    model: options.model || (provider === 'xai' ? 'grok-beta' : 'gpt-4o-mini'),
    messages: [{ role: 'system', content: systemPrompt }, ...messages],
    max_tokens: options.maxTokens || 2048,
    temperature: options.temperature || 0.7,
  });
};

/**
 * Consolidated Draft Generation
 */
const generateDraft = async (user, draftType, formData, language = 'en') => {
  const { provider, apiKey } = getAIClient(user);

  const draftPrompts = {
    fir: `Draft a formal First Information Report (FIR) under CrPC Section 154 with the following details:\n${JSON.stringify(formData, null, 2)}\nMake it formal, legally accurate with proper headings, parties, date, place, incident details, sections of law applicable, and signature block.`,
    complaint: `Draft a formal legal complaint petition with the following details:\n${JSON.stringify(formData, null, 2)}\nInclude court name, parties, cause of action, prayer, verification, and advocate certification.`,
    agreement: `Draft a comprehensive legal agreement/contract with the following details:\n${JSON.stringify(formData, null, 2)}\nInclude all standard clauses: parties, recitals, terms, representations, dispute resolution, governing law, and signatures.`,
    notice: `Draft a formal legal notice under Indian law with the following details:\n${JSON.stringify(formData, null, 2)}\nInclude sender/recipient details, subject, statutory notice period, legal grounds, demand/prayer, and advocate details.`,
    affidavit: `Draft a sworn affidavit with the following details:\n${JSON.stringify(formData, null, 2)}\nInclude declarant details, oath, statements, and deponent's signature block.`,
    bail_application: `Draft a bail application under CrPC Section 437/438/439 with:\n${JSON.stringify(formData, null, 2)}\nInclude court, case number, applicant details, grounds for bail, undertakings, and prayer.`,
    power_of_attorney: `Draft a Power of Attorney document with:\n${JSON.stringify(formData, null, 2)}\nInclude grantor, grantee, scope of authority, limitations, and execution requirements.`,
  };

  const langInstruction = language === 'hi' ? '\n\nDraft the document in Hindi language.' : '';
  const systemPrompt = `You are an expert Indian legal document drafter with 20+ years experience. Create professional, legally valid documents. Use proper legal formatting with bold headings, numbered clauses, and formal language.${langInstruction}`;
  const userPrompt = draftPrompts[draftType] || draftPrompts.complaint;

  if (provider === 'gemini') {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' }); 

    const result = await model.generateContent(`${systemPrompt}\n\nTask: ${userPrompt}`);
    const response = await result.response;
    const text = response.text();

    return {
      choices: [{ message: { content: text } }],
      usage: { total_tokens: 0 },
    };
  }

  // OpenAI / xAI
  const clientOptions = { apiKey };
  if (provider === 'xai') {
    clientOptions.baseURL = 'https://api.x.ai/v1';
  }

  const openai = new OpenAI(clientOptions);
  return await openai.chat.completions.create({
    model: provider === 'xai' ? 'grok-beta' : 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    max_tokens: 3000,
    temperature: 0.3,
  });
};

const getLegalSystemPrompt = (language = 'en') => {
  if (language === 'hi') {
    return `आप NyayaAI हैं — भारतीय कानून में विशेषज्ञ एक पेशेवर कानूनी सहायक। आप IPC, CrPC, CPC, और विभिन्न भारतीय अधिनियमों में विशेषज्ञ हैं। आप वकीलों को कानूनी सलाह, केस रणनीति और दस्तावेज़ तैयार करने में मदद करते हैं। हमेशा स्पष्ट, संरचित और पेशेवर भाषा में उत्तर दें।`;
  }
  return `You are NyayaAI — a professional legal AI assistant specializing in Indian law. Expert in IPC, CrPC, CPC, and Indian statutes. You help advocates with legal queries, case strategy, and research. Provide structured, precise, and professional responses.`;
};

module.exports = { getAIClient, chatCompletion, generateDraft, getLegalSystemPrompt };
