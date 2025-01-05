import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { readFileSync } from 'fs';
import path from 'path';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

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
