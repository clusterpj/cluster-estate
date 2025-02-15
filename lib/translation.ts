import Anthropic from '@anthropic-ai/sdk';
import { createServiceClient } from '@/lib/supabase-server';
import dotenv from 'dotenv';
import path from 'path';

function getAnthropicClient() {
  // Explicitly load environment variables
  dotenv.config({ path: path.join(process.cwd(), '.env.local') });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  console.log('Checking Anthropic API key:', {
    hasKey: !!apiKey,
    keyStart: apiKey ? apiKey.substring(0, 4) + '...' : 'undefined',
    envKeys: Object.keys(process.env).filter(key => !key.toLowerCase().includes('key')).join(', ')
  });

  if (!apiKey) {
    console.error('ANTHROPIC_API_KEY environment variable is not set');
    throw new Error('ANTHROPIC_API_KEY environment variable is not set');
  }
  return new Anthropic({ apiKey });
}

export async function translateText(text: string, targetLanguage: string) {
  console.log(`Translating "${text}" to ${targetLanguage}`);
  const supabase = createServiceClient();
  
  try {
    // Check cache
    const { data: cached, error: fetchError } = await supabase
      .from('translations')
      .select('translation')
      .eq('text', text)
      .eq('target_language', targetLanguage)
      .single();
    
    if (fetchError) {
      console.error('Error fetching translation:', fetchError);
    }
    
    if (cached) {
      console.log('Found cached translation:', cached.translation);
      return cached.translation;
    }

    console.log('No cached translation found, using Claude...');

    try {
      // If not in cache, use Claude to translate
      const anthropic = getAnthropicClient();
      const prompt = `Please translate the following text to ${targetLanguage}. Provide only the translation, without any additional context or explanations:\n\n${text}`;
      
      console.log('Making request to Claude...');
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
      console.log('Received response from Claude:', JSON.stringify(message, null, 2));

      // Get the translation from the message content
      if (!message.content || message.content.length === 0) {
        console.error('No content in Claude response:', message);
        return text;
      }

      const content = message.content[0];
      if (content.type !== 'text') {
        console.error('Unexpected content type in Claude response:', content);
        return text;
      }

      const translation = content.text;
      console.log('Received translation from Claude:', translation);

      // Cache the translation
      const { error: insertError } = await supabase
        .from('translations')
        .upsert({
          text,
          target_language: targetLanguage,
          translation,
          created_at: new Date().toISOString()
        });

      if (insertError) {
        console.error('Error caching translation:', insertError);
      } else {
        console.log('Translation cached successfully');
      }

      return translation;
    } catch (claudeError) {
      console.error('Error with Claude API:', claudeError);
      if (claudeError instanceof Error) {
        console.error('Claude error details:', claudeError.message);
        console.error('Claude error stack:', claudeError.stack);
      }
      throw claudeError;
    }
  } catch (error) {
    console.error('Translation error:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
    }
    return text; // Return original text if translation fails
  }
}
