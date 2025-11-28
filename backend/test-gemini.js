/**
 * Test script to verify Gemini API key works
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY || 'AIzaSyDyMFjskonQ9xdzG8ipui1BcdlfQSdVg4o';

console.log('Testing Gemini API...');
console.log('API Key:', apiKey.substring(0, 10) + '...');

try {
  const genAI = new GoogleGenerativeAI(apiKey);
  // Try different model names
  let model;
  try {
    model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    console.log('Using model: gemini-pro');
  } catch (e) {
    try {
      model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
      console.log('Using model: gemini-1.5-pro');
    } catch (e2) {
      model = genAI.getGenerativeModel({ model: 'models/gemini-pro' });
      console.log('Using model: models/gemini-pro');
    }
  }
  
  console.log('✅ Client created, calling API...');
  
  const result = await model.generateContent('Say hello in one sentence');
  const response = await result.response;
  const text = response.text();
  
  console.log('✅ SUCCESS! Gemini response:');
  console.log(text);
  console.log('\n✅ API key is working correctly!');
} catch (error) {
  console.error('❌ ERROR:', error.message);
  console.error('Full error:', error);
  if (error.message.includes('API_KEY')) {
    console.error('\n⚠️  API key issue. Check:');
    console.error('   1. Is the key correct?');
    console.error('   2. Is the key enabled in Google AI Studio?');
    console.error('   3. Are there any usage limits?');
  }
}

