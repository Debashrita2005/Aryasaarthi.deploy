import { NextRequest, NextResponse } from 'next/server';
import { processChatTurn } from '@/lib/chatbotEngine';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const sessionId = body?.session_id;
    const userText = (body?.text ?? body?.message ?? '').toString().trim();
    const attachments = Array.isArray(body?.attachments) ? body.attachments : undefined;

    if (!sessionId || (!userText && (!attachments || attachments.length === 0))) {
      return NextResponse.json(
        { error: 'Invalid payload. "session_id" and ("text" or "attachments") are required.' },
        { status: 400 }
      );
    }

    const effectiveText = userText || (attachments && attachments.length > 0 ? `Attached document: ${attachments.map((a: any) => a.name).join(', ')}` : '');

    // 100% Local On-Device Dynamic AI Dialogue Engine
    const response = await processChatTurn(sessionId, effectiveText, attachments);
    return NextResponse.json(response);

  } catch (err: any) {
    console.error('Chatbot API error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to process message' },
      { status: 500 }
    );
  }
}
