import { NextResponse } from 'next/server';
import { translateText } from '@/lib/translation';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const text = searchParams.get('text') || 'Hello, World!';
  const targetLanguage = searchParams.get('lang') || 'es';

  try {
    const translation = await translateText(text, targetLanguage);
    return NextResponse.json({ 
      success: true, 
      original: text,
      translation,
      language: targetLanguage
    });
  } catch (error) {
    console.error('Translation error:', error);
    return NextResponse.json(
      { success: false, error: 'Translation failed' },
      { status: 500 }
    );
  }
}
