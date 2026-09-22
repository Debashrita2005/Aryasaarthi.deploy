import { NextRequest, NextResponse } from 'next/server';
import { bhashiniTTS, getBhashiniConfig } from '@/lib/bhashini';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, language = 'hi' } = body || {};

    if (!text || typeof text !== 'string' || !text.trim()) {
      return NextResponse.json(
        { error: 'Text payload is required for speech synthesis' },
        { status: 400 }
      );
    }

    const langConfig = getBhashiniConfig(language);
    const audioContent = await bhashiniTTS(text, language);

    if (audioContent) {
      return NextResponse.json({
        success: true,
        audio: audioContent,
        source: 'bhashini',
        language: langConfig.bhashiniCode,
        locale: langConfig.locale,
      });
    }

    return NextResponse.json({
      success: false,
      audio: null,
      source: 'local_fallback',
      message: 'Bhashini TTS not configured or unavailable. Client should use Web Speech API.',
      locale: langConfig.locale,
    });
  } catch (err: any) {
    console.error('Bhashini TTS Route Error:', err);
    return NextResponse.json(
      { error: err.message || 'Error processing speech synthesis' },
      { status: 500 }
    );
  }
}
