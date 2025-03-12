// lib/translation.ts
import axios from 'axios';
import { createServiceClient } from '@/lib/supabase-server';
import dotenv from 'dotenv';
import path from 'path';

function getDeepseekConfig() {
  // Explicitly load environment variables
  dotenv.config({ path: path.join(process.cwd(), '.env.local') });

  const apiKey = process.env.DEEPSEEK_API_KEY;
  console.log('Checking Deepseek API key:', {
    hasKey: !!apiKey,
    keyStart: apiKey ? apiKey.substring(0, 4) + '...' : 'undefined',
    envKeys: Object.keys(process.env).filter(key => !key.toLowerCase().includes('key')).join(', ')
  });

  if (!apiKey) {
    console.error('DEEPSEEK_API_KEY environment variable is not set');
    throw new Error('DEEPSEEK_API_KEY environment variable is not set');
  }
  
  return {
    apiKey,
    endpoint: process.env.DEEPSEEK_API_ENDPOINT || 'https://api.deepseek.com/v1/chat/completions'
  };
}

/**
 * Translates text using the Deepseek API with Supabase caching
 */
export async function translateText(text: string, targetLanguage: string): Promise<string> {
  console.log(`Translating "${text}" to ${targetLanguage}`);
  
  // Skip translation for empty strings or placeholder-only strings
  if (!text.trim() || text === '{}') {
    return text;
  }
  
  const supabase = createServiceClient();
  
  try {
    // Check cache first
    const { data: cached, error: fetchError } = await supabase
      .from('translations')
      .select('translation')
      .eq('text', text)
      .eq('target_language', targetLanguage)
      .single();
    
    if (fetchError) {
      console.log('Cache miss or fetch error:', fetchError.message);
    }
    
    if (cached) {
      console.log('Found cached translation:', cached.translation);
      return cached.translation;
    }

    console.log('No cached translation found, using Deepseek API...');

    try {
      // Get Deepseek configuration
      const { apiKey, endpoint } = getDeepseekConfig();
      
      // Create translation prompt
      const prompt = `Translate the following text to ${targetLanguage}. Provide only the translation, without any additional context or explanations:\n\n${text}`;
      
      console.log('Making request to Deepseek API...');
      
      // Call Deepseek API
      const response = await axios.post(
        endpoint,
        {
          model: 'deepseek-chat',
          messages: [
            { 
              role: 'system', 
              content: 'You are a professional translator specializing in software localization. Translate text naturally while preserving placeholders like {count} and {value}.' 
            },
            { role: 'user', content: prompt }
          ],
          temperature: 0.2, // Lower temperature for more consistent translations
          max_tokens: 2048
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          }
        }
      );
      
      // Extract translation from response
      const translation = response.data.choices[0].message.content.trim();
      console.log('Received translation from Deepseek:', translation);

      // Verify translation isn't empty
      if (!translation) {
        console.error('Empty translation received from Deepseek');
        return text;
      }

      // Cache the translation in Supabase - WITHOUT the provider field
      const { error: insertError } = await supabase
        .from('translations')
        .upsert({
          text,
          target_language: targetLanguage,
          translation,
          created_at: new Date().toISOString()
          // Removed the provider field
        });

      if (insertError) {
        console.error('Error caching translation:', insertError);
      } else {
        console.log('Translation cached successfully');
      }

      return translation;
    } catch (apiError) {
      console.error('Error with Deepseek API:', apiError);
      
      if (axios.isAxiosError(apiError)) {
        console.error('API error details:', apiError.response?.data || apiError.message);
      } else if (apiError instanceof Error) {
        console.error('Error details:', apiError.message);
        console.error('Error stack:', apiError.stack);
      }
      
      // Fall back to original text on error
      return text;
    }
  } catch (error) {
    console.error('Translation process error:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
    }
    return text; // Return original text if translation fails
  }
}

/**
 * Batch translate multiple texts at once (more efficient)
 * Uses individual translateText calls but with minimal overhead
 */
export async function batchTranslate(
  texts: string[], 
  targetLanguage: string
): Promise<string[]> {
  console.log(`Batch translating ${texts.length} texts to ${targetLanguage}`);
  
  // Process in smaller batches to avoid overwhelming the API
  const batchSize = 5;
  const results: string[] = [];
  
  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);
    console.log(`Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(texts.length/batchSize)}`);
    
    // Translate batch in parallel
    const batchResults = await Promise.all(
      batch.map(text => translateText(text, targetLanguage))
    );
    
    results.push(...batchResults);
  }
  
  return results;
}