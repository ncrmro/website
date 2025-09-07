/**
 * OpenAI SDK utility module
 * 
 * This module provides a configured OpenAI client instance for use throughout the application.
 * Make sure to set the OPENAI_API_KEY environment variable before using.
 */

import { OpenAI } from 'openai';

// Initialize OpenAI client with API key from environment variables
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Example function demonstrating how to use the OpenAI SDK
 * 
 * @param prompt - The text prompt to send to OpenAI
 * @returns Promise<string> - The generated response from OpenAI
 */
export async function generateText(prompt: string): Promise<string> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY environment variable is not set');
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 150,
    });

    return completion.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('Error generating text with OpenAI:', error);
    throw error;
  }
}