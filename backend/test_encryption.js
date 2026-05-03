const { encryptApiKey, decryptApiKey } = require('./utils/encryption');

const testKey = 'YOUR_OPENAI_API_KEY';

console.log('Original Length:', testKey.length);
const encrypted = encryptApiKey(testKey);
console.log('Encrypted (starts with):', encrypted.slice(0, 10));

const decrypted = decryptApiKey(encrypted);
console.log('Decrypted Length:', decrypted.length);
console.log('Matches:', testKey === decrypted);
console.log('Decrypted starts with:', decrypted.slice(0, 7));
