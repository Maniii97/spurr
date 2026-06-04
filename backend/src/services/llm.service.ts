import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { env } from '../config/env';
import { STORE_FAQ } from '../db/seed';
import type { LLMHistoryEntry } from '../types';

const genAI = new GoogleGenerativeAI(env.geminiApiKey);

const SYSTEM_PROMPT = `You are a friendly and helpful customer support agent for ManiiiHeist Commerce, an online retail store.

Your responsibilities:
- Answer customer questions about shipping, returns, refunds, payment methods, order tracking, and support hours.
- Be concise, warm, and professional in every response.
- Stay strictly on topic — only answer questions related to ManiiiHeist Commerce's products and policies.
- If a customer asks something outside your knowledge base, politely acknowledge you don't have that information and suggest they email support@maniiiheistcommerce.com for further assistance.
- Never make up information. If unsure, say so and direct the customer to email support.

Here is the complete ManiiiHeist Commerce knowledge base you must use to answer questions:

${STORE_FAQ}

Remember: Be helpful, concise, and always end with an offer to help further if needed.`;

// Sliding window: only use the last 10 messages to avoid token bloat.
// This is a deliberate trade-off documented in README.
const MAX_HISTORY_MESSAGES = 10;

export async function generateReply(
  history: LLMHistoryEntry[],
  userMessage: string,
): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: SYSTEM_PROMPT,
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
      ],
    });

    // Apply sliding window to history
    const windowedHistory = history.slice(-MAX_HISTORY_MESSAGES);

    // Map to Gemini's Content format
    const geminiHistory = windowedHistory.map((entry) => ({
      role: entry.role, // 'user' | 'model'
      parts: [{ text: entry.content }],
    }));

    const chat = model.startChat({ history: geminiHistory });
    const result = await chat.sendMessage(userMessage);
    const response = result.response;
    const text = response.text();

    if (!text || text.trim() === '') {
      return "I'm sorry, I couldn't generate a response. Please try again or contact support@maniiiheistcommerce.com.";
    }

    return text.trim();
  } catch (error: unknown) {
    console.error('[LLM Service] Error calling Gemini API:', error);

    const err = error as { status?: number; message?: string; code?: string };

    // API key invalid / authentication failure
    if (
      err.status === 400 ||
      err.status === 401 ||
      err.status === 403 ||
      (err.message && err.message.toLowerCase().includes('api key'))
    ) {
      return "There's a configuration issue on our end. Please try again later or contact support@maniiiheistcommerce.com.";
    }

    // Rate limit / quota exceeded
    if (
      err.status === 429 ||
      (err.message && err.message.toLowerCase().includes('quota'))
    ) {
      return "We're experiencing high traffic right now. Please try again in a moment.";
    }

    // Network / timeout
    if (
      err.code === 'ECONNREFUSED' ||
      err.code === 'ETIMEDOUT' ||
      (err.message && err.message.toLowerCase().includes('fetch'))
    ) {
      return "Couldn't reach the AI service. Please check your connection and try again.";
    }

    // Fallback
    return 'Something went wrong on our end. Please try again or email support@maniiiheistcommerce.com.';
  }
}
