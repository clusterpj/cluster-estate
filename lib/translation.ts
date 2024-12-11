import Anthropic from '@anthropic-ai/sdk';
import { getDb } from './db';

function getAnthropicClient() {
  // Next.js automatically loads .env.local
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error('Environment variables:', {
      NODE_ENV: process.env.NODE_ENV,
      hasApiKey: !!process.env.ANTHROPIC_API_KEY
    });
    throw new Error('ANTHROPIC_API_KEY environment variable is not set');
  }
  return new Anthropic({ apiKey });
}

export async function translateText(text: string, targetLanguage: string) {
  const db = await getDb();
  
  try {
    // Check cache
    const cached = await db.get(
      'SELECT translation FROM translations WHERE text = ? AND target_language = ?',
      [text, targetLanguage]
    );
    
    if (cached) {
      return cached.translation;
    }

    // If not in cache, use Claude to translate
    const anthropic = getAnthropicClient();
    const prompt = `Please translate the following text to ${targetLanguage}. Provide only the translation, without any additional context or explanations:\n\n${text}`;
    
    const message = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const translation = message.content[0].text;

    // Cache the translation
    await db.run(
      'INSERT OR REPLACE INTO translations (text, target_language, translation) VALUES (?, ?, ?)',
      [text, targetLanguage, translation]
    );

    return translation;
  } catch (error) {
    console.error('Translation error:', error);
    return text; // Return original text if translation fails
  }
}
