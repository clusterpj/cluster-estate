// scripts/translate-messages.ts
import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';
import { translateText, batchTranslate } from '../lib/translation';
import { locales, defaultLocale } from '../config/i18n';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

// Translation statistics tracker
interface TranslationStats {
  reused: number;
  translated: number;
  missing: string[];
  errors: string[];
}

// In-memory cache for translations within a single run
interface TranslationCache {
  [key: string]: {
    original: string;
    translated: string;
  };
}

/**
 * Load existing translation file if it exists
 */
async function loadExistingTranslations(lang: string): Promise<any> {
  try {
    const filePath = path.join(process.cwd(), 'messages', `${lang}.json`);
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.log(`No existing translations found for ${lang}`);
    return null;
  }
}

/**
 * Generate a unique cache key for a translation
 */
function generateCacheKey(value: string, context: string[]): string {
  return `${context.join('.')}:${value}`;
}

/**
 * Normalize translation value to handle special cases
 */
function normalizeTranslation(value: any): any {
  // Handle arrays with objects containing type and text
  if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'object' && 'text' in value[0]) {
    return value[0].text;
  }
  
  // Handle [object Object] string representation
  if (value === '[object Object]') {
    return '';
  }

  // Preserve placeholder strings
  if (typeof value === 'string' && (
    value.includes('{count}') || 
    value.includes('{value}') ||
    value.includes('{') && value.includes('}')
  )) {
    return value;
  }

  return value;
}

/**
 * Find all missing keys that need translation
 */
function findMissingTranslations(
  sourceObj: any,
  targetObj: any,
  context: string[] = []
): { path: string[], value: string }[] {
  const missing: { path: string[], value: string }[] = [];

  // Handle leaf nodes (strings)
  if (typeof sourceObj === 'string') {
    const targetValue = normalizeTranslation(targetObj);
    
    // If target is missing or empty, add to missing list
    if (!targetValue || typeof targetValue !== 'string') {
      missing.push({ path: context, value: sourceObj });
    }
    
    return missing;
  }
  
  // Handle arrays (don't translate arrays)
  if (Array.isArray(sourceObj)) {
    return missing;
  }

  // Handle objects (recursively check all properties)
  if (typeof sourceObj === 'object' && sourceObj !== null) {
    for (const [key, value] of Object.entries(sourceObj)) {
      const nestedMissing = findMissingTranslations(
        value,
        targetObj?.[key],
        [...context, key]
      );
      
      missing.push(...nestedMissing);
    }
  }

  return missing;
}

/**
 * Apply translations to the target object structure
 */
function applyTranslations(
  sourceObj: any,
  targetObj: any,
  translations: Map<string, string>,
  context: string[] = []
): any {
  // Handle leaf nodes (strings)
  if (typeof sourceObj === 'string') {
    const pathKey = context.join('.');
    
    // If we have a translation, use it
    if (translations.has(pathKey)) {
      return translations.get(pathKey);
    }
    
    // Otherwise, keep existing translation if valid
    const targetValue = normalizeTranslation(targetObj);
    if (typeof targetValue === 'string' && targetValue) {
      return targetValue;
    }
    
    // Fallback to source
    return sourceObj;
  }
  
  // Handle arrays (don't translate arrays)
  if (Array.isArray(sourceObj)) {
    return sourceObj;
  }

  // Handle objects (recursively apply translations)
  if (typeof sourceObj === 'object' && sourceObj !== null) {
    const result: any = {};
    
    for (const [key, value] of Object.entries(sourceObj)) {
      result[key] = applyTranslations(
        value,
        targetObj?.[key],
        translations,
        [...context, key]
      );
    }
    
    return result;
  }

  return sourceObj;
}

/**
 * Main translation function
 */
async function translateMessages() {
  try {
    console.log('Starting translation process with Deepseek API...');
    const startTime = Date.now();
    
    // Read the English messages file (source of truth)
    const enMessages = JSON.parse(
      await fs.readFile(
        path.join(process.cwd(), 'messages', 'en.json'),
        'utf-8'
      )
    );

    // Target languages to translate to (all except default locale)
    const targetLanguages = locales.filter(l => l !== defaultLocale);
    console.log(`Found ${targetLanguages.length} target languages: ${targetLanguages.join(', ')}`);

    // Process each target language
    for (const lang of targetLanguages) {
      console.log(`\n==== Processing translations for ${lang} ====`);
      const langStartTime = Date.now();
      
      // Load existing translations if they exist
      const existingTranslations = await loadExistingTranslations(lang);
      
      // Initialize stats
      const stats: TranslationStats = {
        reused: 0,
        translated: 0,
        missing: [],
        errors: []
      };

      // Find all missing translations
      const missingTranslations = findMissingTranslations(
        enMessages,
        existingTranslations || {}
      );
      
      console.log(`Found ${missingTranslations.length} missing translations for ${lang}`);
      
      // Skip if nothing needs translation
      if (missingTranslations.length === 0) {
        console.log(`All translations for ${lang} are up to date!`);
        
        // Write the file anyway to ensure structural integrity
        await fs.writeFile(
          path.join(process.cwd(), 'messages', `${lang}.json`),
          JSON.stringify(existingTranslations || enMessages, null, 2),
          'utf-8'
        );
        
        continue;
      }
      
      // Map to hold all the translated strings
      const translationsMap = new Map<string, string>();
      
      // Group missing translations for batch processing
      const toTranslate: string[] = [];
      const pathsToTranslate: string[] = [];
      
      for (const { path, value } of missingTranslations) {
        // Skip empty strings and placeholder-only strings
        if (!value.trim() || value === '{}') {
          continue;
        }
        
        toTranslate.push(value);
        pathsToTranslate.push(path.join('.'));
        stats.missing.push(path.join('.'));
      }
      
      // Batch translate the missing strings
      console.log(`Translating ${toTranslate.length} strings to ${lang}...`);
      
      try {
        // Use batch translation for efficiency
        const translatedTexts = await batchTranslate(toTranslate, lang);
        stats.translated = translatedTexts.length;
        
        // Map translated strings to their paths
        for (let i = 0; i < translatedTexts.length; i++) {
          translationsMap.set(pathsToTranslate[i], translatedTexts[i]);
        }
      } catch (error) {
        console.error('Translation batch failed:', error);
        
        // Fall back to individual translations
        console.log('Falling back to individual translations...');
        
        for (let i = 0; i < toTranslate.length; i++) {
          try {
            const translated = await translateText(toTranslate[i], lang);
            translationsMap.set(pathsToTranslate[i], translated);
            stats.translated++;
          } catch (error) {
            console.error(`Failed to translate "${toTranslate[i]}":`, error);
            stats.errors.push(pathsToTranslate[i]);
          }
        }
      }
      
      // Apply translations to the structure
      const translatedMessages = applyTranslations(
        enMessages,
        existingTranslations || {},
        translationsMap
      );
      
      // If we have existing translations, count them as reused
      if (existingTranslations) {
        const totalKeys = countLeafNodes(enMessages);
        stats.reused = totalKeys - stats.translated - stats.errors.length;
      }
      
      // Write the translated messages to a file
      await fs.writeFile(
        path.join(process.cwd(), 'messages', `${lang}.json`),
        JSON.stringify(translatedMessages, null, 2),
        'utf-8'
      );
      
      const langDuration = (Date.now() - langStartTime) / 1000;
      console.log(`\n✓ Translation to ${lang} completed in ${langDuration.toFixed(2)}s:`);
      console.log(`  - Reused translations: ${stats.reused}`);
      console.log(`  - New translations: ${stats.translated}`);
      console.log(`  - Errors: ${stats.errors.length}`);
      
      if (stats.errors.length > 0) {
        console.log('\nTranslation errors occurred for:');
        stats.errors.slice(0, 10).forEach(path => console.log(`  - ${path}`));
        if (stats.errors.length > 10) {
          console.log(`  ... and ${stats.errors.length - 10} more`);
        }
      }
    }

    const totalDuration = (Date.now() - startTime) / 1000;
    console.log(`\nAll translations completed in ${totalDuration.toFixed(2)} seconds!`);
  } catch (error) {
    console.error('Translation process error:', error);
    process.exit(1);
  }
}

/**
 * Count the number of leaf nodes (strings) in an object
 */
function countLeafNodes(obj: any): number {
  if (typeof obj === 'string') {
    return 1;
  }
  
  if (Array.isArray(obj)) {
    return 0; // Don't count array items
  }
  
  if (typeof obj === 'object' && obj !== null) {
    let count = 0;
    for (const value of Object.values(obj)) {
      count += countLeafNodes(value);
    }
    return count;
  }
  
  return 0;
}

// Run the translation process
translateMessages();