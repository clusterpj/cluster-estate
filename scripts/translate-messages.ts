import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';
import { translateText } from '../lib/translation';

// Load environment variables at the start of the script
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

async function translateObject(obj: any, targetLang: string): Promise<any> {
  if (typeof obj === 'string') {
    return await translateText(obj, targetLang);
  }

  if (Array.isArray(obj)) {
    const translations = await Promise.all(
      obj.map(item => translateObject(item, targetLang))
    );
    return translations;
  }

  if (typeof obj === 'object' && obj !== null) {
    const result: any = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = await translateObject(value, targetLang);
    }
    return result;
  }

  return obj;
}

async function translateMessages() {
  try {
    // Read the English messages file
    const enMessages = JSON.parse(
      await fs.readFile(
        path.join(process.cwd(), 'messages', 'en.json'),
        'utf-8'
      )
    );

    // Target languages to translate to
    const targetLanguages = ['es', 'fr'];

    // Translate to each target language
    for (const lang of targetLanguages) {
      console.log(`Translating to ${lang}...`);
      
      const translatedMessages = await translateObject(enMessages, lang);
      
      // Write the translated messages to a file
      await fs.writeFile(
        path.join(process.cwd(), 'messages', `${lang}.json`),
        JSON.stringify(translatedMessages, null, 2),
        'utf-8'
      );
      
      console.log(`✓ Translation to ${lang} completed`);
    }

    console.log('All translations completed successfully!');
  } catch (error) {
    console.error('Translation error:', error);
    process.exit(1);
  }
}

// Run the translation
translateMessages();
