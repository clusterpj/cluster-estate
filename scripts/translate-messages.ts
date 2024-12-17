import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';
import { translateText } from '../lib/translation';

// Load environment variables at the start of the script
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

interface TranslationCache {
  [key: string]: {
    original: string;
    translated: string;
  };
}

interface TranslationStats {
  reused: number;
  translated: number;
  missing: string[];
}

async function loadExistingTranslations(lang: string): Promise<any> {
  try {
    const filePath = path.join(process.cwd(), 'messages', `${lang}.json`);
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    return null;
  }
}

function generateCacheKey(value: string, context: string[]): string {
  return `${context.join('.')}:${value}`;
}

async function translateObjectWithCache(
  obj: any, 
  targetLang: string, 
  existingTranslations: any,
  context: string[] = [],
  cache: TranslationCache = {},
  stats: TranslationStats = { reused: 0, translated: 0, missing: [] }
): Promise<any> {
  if (typeof obj === 'string') {
    const cacheKey = generateCacheKey(obj, context);
    const contextPath = context.join('.');
    
    // Check if we have this exact string in the existing translations
    let existingValue = existingTranslations;
    for (const key of context) {
      existingValue = existingValue?.[key];
    }

    // If the existing translation matches the context and the original hasn't changed
    if (existingValue && typeof existingValue === 'string') {
      cache[cacheKey] = {
        original: obj,
        translated: existingValue
      };
      stats.reused++;
      return existingValue;
    }

    // If we have this in our cache, reuse it
    if (cache[cacheKey]) {
      stats.reused++;
      return cache[cacheKey].translated;
    }

    // Otherwise, translate it
    console.log(`Translating [${contextPath}]: "${obj}" to ${targetLang}`);
    stats.translated++;
    stats.missing.push(contextPath);
    
    const translated = await translateText(obj, targetLang);
    cache[cacheKey] = {
      original: obj,
      translated
    };
    return translated;
  }

  if (Array.isArray(obj)) {
    const translations = await Promise.all(
      obj.map((item, index) => 
        translateObjectWithCache(
          item, 
          targetLang, 
          existingTranslations?.[index],
          [...context, index.toString()],
          cache,
          stats
        )
      )
    );
    return translations;
  }

  if (typeof obj === 'object' && obj !== null) {
    const result: any = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = await translateObjectWithCache(
        value,
        targetLang,
        existingTranslations?.[key],
        [...context, key],
        cache,
        stats
      );
    }
    return result;
  }

  return obj;
}

async function ensureStructuralParity(
  sourceObj: any,
  targetObj: any,
  targetLang: string,
  context: string[] = [],
  cache: TranslationCache = {},
  stats: TranslationStats = { reused: 0, translated: 0, missing: [] }
): Promise<any> {
  if (typeof sourceObj === 'string') {
    if (typeof targetObj === 'string') {
      return targetObj;
    }
    // If target is missing or of wrong type, translate the source
    const cacheKey = generateCacheKey(sourceObj, context);
    console.log(`Missing translation [${context.join('.')}]: "${sourceObj}"`);
    stats.translated++;
    stats.missing.push(context.join('.'));
    
    const translated = await translateText(sourceObj, targetLang);
    cache[cacheKey] = {
      original: sourceObj,
      translated
    };
    return translated;
  }

  if (Array.isArray(sourceObj)) {
    if (!Array.isArray(targetObj)) {
      targetObj = [];
    }
    return Promise.all(
      sourceObj.map((item, index) =>
        ensureStructuralParity(
          item,
          targetObj[index],
          targetLang,
          [...context, index.toString()],
          cache,
          stats
        )
      )
    );
  }

  if (typeof sourceObj === 'object' && sourceObj !== null) {
    const result: any = {};
    for (const [key, value] of Object.entries(sourceObj)) {
      result[key] = await ensureStructuralParity(
        value,
        targetObj?.[key],
        targetLang,
        [...context, key],
        cache,
        stats
      );
    }
    return result;
  }

  return sourceObj;
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
    const targetLanguages = ['es', 'fr', 'de'];

    // Translate to each target language
    for (const lang of targetLanguages) {
      console.log(`\nProcessing translations for ${lang}...`);
      
      // Load existing translations if they exist
      const existingTranslations = await loadExistingTranslations(lang);
      
      const stats: TranslationStats = {
        reused: 0,
        translated: 0,
        missing: []
      };

      if (existingTranslations) {
        console.log(`Found existing translations for ${lang}`);
      } else {
        console.log(`No existing translations found for ${lang}, creating new file`);
      }

      // First pass: translate with existing translations
      const translatedMessages = await ensureStructuralParity(
        enMessages,
        existingTranslations || {},
        lang,
        [],
        {},
        stats
      );
      
      // Write the translated messages to a file
      await fs.writeFile(
        path.join(process.cwd(), 'messages', `${lang}.json`),
        JSON.stringify(translatedMessages, null, 2),
        'utf-8'
      );
      
      console.log(`\n✓ Translation to ${lang} completed:`);
      console.log(`  - Reused translations: ${stats.reused}`);
      console.log(`  - New translations: ${stats.translated}`);
      if (stats.missing.length > 0) {
        console.log('\nMissing translations added for:');
        stats.missing.forEach(path => console.log(`  - ${path}`));
      }
    }

    console.log('\nAll translations completed successfully!');
  } catch (error) {
    console.error('Translation error:', error);
    process.exit(1);
  }
}

// Run the translation
translateMessages();
