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

    // Fallback: High-accuracy local Whisper ASR running in-memory on FastAPI
    try {
      const asrFormData = new FormData();
      asrFormData.append('audio_base64', audio);
      asrFormData.append('language', language);

      const localRes = await fetch('http://127.0.0.1:8000/api/asr/transcribe', {
        method: 'POST',
        body: asrFormData,
      });

      if (localRes.ok) {
        const localData = await localRes.json();
        if (localData && localData.success && localData.text && localData.text.trim()) {
          return NextResponse.json({
            success: true,
            text: localData.text.trim(),
            source: 'local_whisper',
            language: localData.language || langConfig.bhashiniCode,
            locale: langConfig.locale,
          });
        }
      }
    } catch (localErr) {
      console.warn('Local Whisper ASR fallback notice:', localErr);
    }

    return NextResponse.json({
      success: false,
      text: null,
      source: 'local_fallback',
      message: 'Bhashini API not configured. Client using local Web Speech ASR.',
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
