import { readFileSync } from 'fs';
import path from 'path';

export function getTranslationFallback(key: string, namespace: string) {
  try {
    const filePath = path.join(process.cwd(), 'messages', 'en.json');
    const englishMessages = JSON.parse(readFileSync(filePath, 'utf-8'));
    const namespaceMessages = englishMessages[namespace];
    return namespaceMessages?.[key] || key;
  } catch (error) {
    console.error('Error loading fallback translations:', error);
    return key;
  }
}
