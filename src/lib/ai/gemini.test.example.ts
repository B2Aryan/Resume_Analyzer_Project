/**
 * Example usage of the Gemini client
 * 
 * This file demonstrates how to use the Gemini client and test function.
 * Note: This is an example file and not meant to be executed automatically.
 */

import { getGeminiClient, testGemini, GeminiResponse } from './gemini';

/**
 * Example 1: Test the Gemini connection
 */
async function exampleTestConnection() {
  console.log('Testing Gemini connection...');
  
  const result: GeminiResponse = await testGemini();
  
  if (result.success) {
    console.log('✓ Gemini is connected!');
    console.log('Response:', result.text);
  } else {
    console.error('✗ Connection failed:', result.error);
  }
}

/**
 * Example 2: Use the client directly
 */
async function exampleDirectUsage() {
  try {
    const ai = getGeminiClient();
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: 'What is TypeScript?',
    });
    
    console.log('Response:', response.text);
  } catch (error) {
    console.error('Error:', error);
  }
}

/**
 * Example 3: Handle errors gracefully
 */
async function exampleWithErrorHandling() {
  try {
    const result = await testGemini();
    
    if (!result.success) {
      // Handle error case
      throw new Error(result.error || 'Unknown error');
    }
    
    // Handle success case
    console.log('Success:', result.text);
  } catch (error) {
    console.error('Caught error:', error);
  }
}

// Uncomment to run examples:
// exampleTestConnection();
// exampleDirectUsage();
// exampleWithErrorHandling();
