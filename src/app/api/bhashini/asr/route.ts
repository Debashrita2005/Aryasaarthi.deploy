import { NextRequest, NextResponse } from 'next/server';
import { bhashiniASR, getBhashiniConfig } from '@/lib/bhashini';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { audio, language = 'hi' } = body || {};

    if (!audio) {
      return NextResponse.json(
        { error: 'Audio payload (base64 string) is required' },
        { status: 400 }
      );
    }

    const langConfig = getBhashiniConfig(language);
    const transcript = await bhashiniASR(audio, language);

    if (transcript) {
      return NextResponse.json({
        success: true,
        text: transcript,
        source: 'bhashini',
        language: langConfig.bhashiniCode,
        locale: langConfig.locale,
      });
    }

    return NextResponse.json({
      success: false,
      text: null,
      source: 'local_fallback',
      message: 'Bhashini API not configured or unavailable. Client using local Web Speech ASR.',
      locale: langConfig.locale,
    });
  } catch (err: any) {
    console.error('Bhashini ASR Route Error:', err);
    return NextResponse.json(
      { error: err.message || 'Error processing speech recognition' },
      { status: 500 }
    );
  }
}
