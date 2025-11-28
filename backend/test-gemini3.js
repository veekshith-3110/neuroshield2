/**
 * Test Gemini 3.0 Pro Preview
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY || 'AIzaSyDyMFjskonQ9xdzG8ipui1BcdlfQSdVg4o';

async function test() {
  try {
    console.log('🧪 Testing Gemini 3.0 Pro Preview...');
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-3-pro-preview' });
    
    const result = await model.generateContent('Say hello and introduce yourself as Gemini 3.0');
    const response = await result.response;
    const text = response.text();
    
    console.log('✅ SUCCESS! Gemini 3.0 Response:');
    console.log(text);
    console.log('\n✅ Gemini 3.0 Pro Preview is working!');
    return true;
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.message.includes('404')) {
      console.error('⚠️  Model not found. Trying alternative...');
      try {
        const genAI2 = new GoogleGenerativeAI(apiKey);
        const model2 = genAI2.getGenerativeModel({ model: 'gemini-2.5-pro' });
        const result2 = await model2.generateContent('Say hello');
        console.log('✅ Fallback to gemini-2.5-pro works:', result2.response.text());
      } catch (e2) {
        console.error('❌ Fallback also failed:', e2.message);
      }
    }
    return false;
  }
}

test();

