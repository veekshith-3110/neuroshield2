import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY || 'AIzaSyDyMFjskonQ9xdzG8ipui1BcdlfQSdVg4o';

async function test() {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    console.log('✅ Testing with gemini-2.5-flash...');
    const result = await model.generateContent('Say hello in one sentence');
    const response = await result.response;
    const text = response.text();
    
    console.log('✅ SUCCESS! Response:', text);
    return true;
  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  }
}

test();

