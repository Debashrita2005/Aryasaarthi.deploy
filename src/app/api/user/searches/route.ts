import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

// GET /api/user/searches?userId=xxx&page=1&limit=20
export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId');
  const page = parseInt(req.nextUrl.searchParams.get('page') || '1', 10);
  const limit = Math.min(parseInt(req.nextUrl.searchParams.get('limit') || '20', 10), 50);

  if (!userId) {
    return NextResponse.json({ success: false, message: 'userId is required' }, { status: 400 });
  }
  try {
    const [searches, total] = await Promise.all([
      prisma.searchRecord.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.searchRecord.count({ where: { userId } }),
    ]);
    return NextResponse.json({ success: true, searches, total, page, limit });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// POST /api/user/searches — save a new search record
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      userId,
      purpose,
      projectCost,
      annualIncome,
      scCertificate,
      courseType,
      gender,
      age,
      employmentStatus,
      state,
      areaType,
      recommendedSchemeId,
      recommendedSchemeName,
      fitScore,
      matchedRule,
      alternativesJson,
    } = body;

    if (!userId || !purpose) {
      return NextResponse.json(
        { success: false, message: 'userId and purpose are required' },
        { status: 400 }
      );
    }

    const record = await prisma.searchRecord.create({
      data: {
        userId,
        purpose,
        projectCost: projectCost || 0,
        annualIncome: annualIncome || 0,
        scCertificate: scCertificate || 'NO',
        courseType,
        gender,
        age: age ? Number(age) : undefined,
        employmentStatus,
        state,
        areaType,
        recommendedSchemeId,
        recommendedSchemeName,
        fitScore,
        matchedRule,
        alternativesJson: typeof alternativesJson === 'string'
          ? alternativesJson
          : JSON.stringify(alternativesJson ?? []),
      },
    });

    return NextResponse.json({ success: true, record }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// DELETE /api/user/searches?id=xxx
export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id');
  const userId = req.nextUrl.searchParams.get('userId');
  if (!id || !userId) {
    return NextResponse.json({ success: false, message: 'id and userId required' }, { status: 400 });
  }
  try {
    // Ensure the record belongs to this user before deleting
    const record = await prisma.searchRecord.findFirst({ where: { id, userId } });
    if (!record) {
      return NextResponse.json({ success: false, message: 'Record not found' }, { status: 404 });
    }
    await prisma.searchRecord.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
