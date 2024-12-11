import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Test writing to KV
    await kv.set('test-key', 'Hello from KV!');
    
    // Test reading from KV
    const value = await kv.get('test-key');
    
    return NextResponse.json({ success: true, value });
  } catch (error) {
    console.error('KV Error:', error);
    return NextResponse.json({ success: false, error: 'KV connection failed' }, { status: 500 });
  }
}
