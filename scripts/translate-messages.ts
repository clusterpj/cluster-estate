import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';
import { translateText } from '../lib/translation';
import { locales, defaultLocale } from '../config/i18n';

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
  errors: string[];
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

function normalizeTranslation(value: any): any {
  // If it's an array with objects containing type and text, convert to string
  if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'object' && 'text' in value[0]) {
    return value[0].text;
  }

  
  // If it's [object Object], convert to empty string to be translated
  if (value === '[object Object]') {
    return '';
  }

  return value;
}

async function translateObjectWithCache(
  obj: any, 
  targetLang: string, 
  existingTranslations: any,
  context: string[] = [],
  cache: TranslationCache = {},
  stats: TranslationStats = { reused: 0, translated: 0, missing: [], errors: [] }
): Promise<any> {
  if (typeof obj === 'string') {
    const cacheKey = generateCacheKey(obj, context);
    const contextPath = context.join('.');
    

    // Check if we have this exact string in the existing translations
    let existingValue = existingTranslations;
    for (const key of context) {
      existingValue = existingValue?.[key];
    }

    // Normalize existing value if needed
    existingValue = normalizeTranslation(existingValue);

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
    

    try {
      const translated = await translateText(obj, targetLang);
      cache[cacheKey] = {
        original: obj,
        translated
      };
      return translated;
    } catch (error) {
      console.error(`Failed to translate [${contextPath}]:`, error);
      stats.errors.push(contextPath);
      return obj; // Return original text if translation fails
    }
  }

  if (Array.isArray(obj)) {
    // Don't translate arrays, just pass them through
    return obj;
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
  stats: TranslationStats = { reused: 0, translated: 0, missing: [], errors: [] }
): Promise<any> {
  if (typeof sourceObj === 'string') {
    const targetValue = normalizeTranslation(targetObj);
    
    if (typeof targetValue === 'string' && targetValue) {
      return targetValue;
    }
    

    if (typeof targetValue === 'string' && targetValue) {
      return targetValue;
    }

    // If target is missing or of wrong type, translate the source
    const cacheKey = generateCacheKey(sourceObj, context);
    console.log(`Missing translation [${context.join('.')}]: "${sourceObj}"`);
    stats.translated++;
    stats.missing.push(context.join('.'));
    

    try {
      const translated = await translateText(sourceObj, targetLang);
      cache[cacheKey] = {
        original: sourceObj,
        translated
      };
      return translated;
    } catch (error) {
      console.error(`Failed to translate [${context.join('.')}]:`, error);
      stats.errors.push(context.join('.'));
      return sourceObj; // Return original text if translation fails
    }
  }

  if (Array.isArray(sourceObj)) {
    // Don't translate arrays, just pass them through
    return sourceObj;
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

    // Target languages to translate to (all except default locale)
    const targetLanguages = locales.filter(l => l !== defaultLocale);

    // Translate to each target language
    for (const lang of targetLanguages) {
      console.log(`\nProcessing translations for ${lang}...`);

      // Load existing translations if they exist
      const existingTranslations = await loadExistingTranslations(lang);

      
      // Load existing translations if they exist
      const existingTranslations = await loadExistingTranslations(lang);
      
      const stats: TranslationStats = {
        reused: 0,
        translated: 0,
        missing: [],
        errors: []
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
      console.log(`  - Errors: ${stats.errors.length}`);
      if (stats.missing.length > 0) {
        console.log('\nMissing translations added for:');
        stats.missing.forEach(path => console.log(`  - ${path}`));
      }
      if (stats.errors.length > 0) {
        console.log('\nTranslation errors occurred for:');
        stats.errors.forEach(path => console.log(`  - ${path}`));
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
