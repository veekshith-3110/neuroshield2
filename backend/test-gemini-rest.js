/**
 * Test Gemini API using REST (as shown in user's example)
 */

import dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY || 'AIzaSyDyMFjskonQ9xdzG8ipui1BcdlfQSdVg4o';

async function testGemini() {
  console.log('Testing Gemini API via REST...');
  console.log('API Key:', apiKey.substring(0, 10) + '...');

  try {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: 'Say hello in one sentence'
        }]
      }]
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ API Error:', response.status, response.statusText);
    console.error('Response:', errorText);
    
    // Try to list available models
    console.log('\n📋 Trying to list available models...');
    const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    const listResponse = await fetch(listUrl);
    if (listResponse.ok) {
      const models = await listResponse.json();
      console.log('Available models:');
      models.models?.forEach(m => {
        console.log(`  - ${m.name} (${m.displayName || 'No display name'})`);
      });
    }
      return;
    }

    const data = await response.json();
    const text = data.candidates[0].content.parts[0].text;
    
    console.log('✅ SUCCESS! Gemini response:');
    console.log(text);
    console.log('\n✅ API key is working correctly!');
  } catch (error) {
    console.error('❌ ERROR:', error.message);
    console.error('Full error:', error);
  }
}

testGemini();

