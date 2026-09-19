import { NextRequest, NextResponse } from 'next/server';
import { processChatTurn } from '@/lib/chatbotEngine';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const sessionId = body?.session_id;
    const userText = (body?.text ?? body?.message ?? '').toString().trim();

    if (!sessionId || !userText) {
      return NextResponse.json(
        { error: 'Invalid payload. "session_id" and "text" or "message" are required.' },
        { status: 400 }
      );
    }

    // 100% Local On-Device Dynamic AI Dialogue Engine
    const response = await processChatTurn(sessionId, userText);
    return NextResponse.json(response);

  } catch (err: any) {
    console.error('Chatbot API error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to process message' },
      { status: 500 }
    );
  }
}
