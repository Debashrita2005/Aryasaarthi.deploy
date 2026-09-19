import { NextRequest, NextResponse } from 'next/server';
import { resetChatSession } from '@/lib/chatbotEngine';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body || !body.session_id) {
      return NextResponse.json({ error: 'Field "session_id" is required.' }, { status: 400 });
    }

    const resetSlots = resetChatSession(body.session_id);
    return NextResponse.json({ status: 'success', message: 'Session reset successfully.', slots: resetSlots });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to reset' }, { status: 500 });
  }
}
