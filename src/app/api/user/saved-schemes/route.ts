import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

// GET /api/user/saved-schemes?userId=xxx
export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId');
  if (!userId) {
    return NextResponse.json({ success: false, message: 'userId is required' }, { status: 400 });
  }
  try {
    const savedSchemes = await prisma.savedScheme.findMany({
      where: { userId },
      orderBy: { savedAt: 'desc' },
    });
    return NextResponse.json({ success: true, savedSchemes });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// POST /api/user/saved-schemes — bookmark a scheme
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, schemeId, schemeCode, schemeName, fitScore, notes } = body;
    if (!userId || !schemeId || !schemeCode || !schemeName) {
      return NextResponse.json(
        { success: false, message: 'userId, schemeId, schemeCode, schemeName required' },
        { status: 400 }
      );
    }
    // Upsert so duplicate saves are idempotent
    const saved = await prisma.savedScheme.upsert({
      where: { userId_schemeId: { userId, schemeId } },
      update: { fitScore, notes },
      create: { userId, schemeId, schemeCode, schemeName, fitScore, notes },
    });
    return NextResponse.json({ success: true, saved }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// DELETE /api/user/saved-schemes?id=xxx&userId=xxx
export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id');
  const userId = req.nextUrl.searchParams.get('userId');
  if (!id || !userId) {
    return NextResponse.json({ success: false, message: 'id and userId required' }, { status: 400 });
  }
  try {
    const saved = await prisma.savedScheme.findFirst({ where: { id, userId } });
    if (!saved) {
      return NextResponse.json({ success: false, message: 'Saved scheme not found' }, { status: 404 });
    }
    await prisma.savedScheme.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
