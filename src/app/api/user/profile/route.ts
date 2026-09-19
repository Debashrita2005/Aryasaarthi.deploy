import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

// GET /api/user/profile?userId=xxx
export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId');
  if (!userId) {
    return NextResponse.json({ success: false, message: 'userId is required' }, { status: 400 });
  }
  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, user });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// PUT /api/user/profile — upsert from auth context after login or onboarding
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, name, phone, email, authMethod, role, gender, state, district, profileCompleted } = body;
    if (!id || !name || !authMethod) {
      return NextResponse.json(
        { success: false, message: 'id, name, and authMethod are required' },
        { status: 400 }
      );
    }
    const user = await prisma.user.upsert({
      where: { id },
      update: {
        name,
        phone,
        email,
        gender: gender || undefined,
        state: state || undefined,
        district: district || undefined,
        profileCompleted: profileCompleted !== undefined ? profileCompleted : undefined,
        updatedAt: new Date(),
      },
      create: {
        id,
        name,
        phone,
        email,
        authMethod,
        role: role || 'beneficiary',
        gender: gender || null,
        state: state || null,
        district: district || null,
        profileCompleted: profileCompleted !== undefined ? profileCompleted : false,
      },
    });
    return NextResponse.json({ success: true, user });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
