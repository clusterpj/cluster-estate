import { NextResponse } from 'next/server';
import { translateText } from '@/lib/translation';

export async function POST(request: Request) {
  try {
    const { text, targetLanguage } = await request.json();
    const translation = await translateText(text, targetLanguage);
    
    return NextResponse.json({ translation });
  } catch (err) {
    console.error('Translation error:', err);
    return NextResponse.json(
      { error: 'Translation failed' },
      { status: 500 }
    );
  }
}
