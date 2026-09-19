import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * GET /api/user/notifications?userId=...
 * Returns all genuine notifications and rate change alerts for a user
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    const notifications = await prisma.schemeNotification.findMany({
      where: userId
        ? {
            OR: [{ userId }, { userId: null }],
          }
        : {},
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    return NextResponse.json({
      success: true,
      count: notifications.length,
      unreadCount,
      notifications,
    });
  } catch (error: any) {
    console.error('[GET /api/user/notifications] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/user/notifications
 * Mark notifications as read
 */
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, userId, markAllRead } = body;

    if (markAllRead && userId) {
      await prisma.schemeNotification.updateMany({
        where: {
          OR: [{ userId }, { userId: null }],
          isRead: false,
        },
        data: { isRead: true },
      });
      return NextResponse.json({ success: true, message: 'All notifications marked as read' });
    }

    if (id) {
      const result = await prisma.schemeNotification.updateMany({
        where: { id },
        data: { isRead: true },
      });
      if (result.count === 0) {
        return NextResponse.json({ success: false, error: 'Notification not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, message: 'Notification marked as read' });
    }

    return NextResponse.json({ success: false, error: 'id or markAllRead is required' }, { status: 400 });
  } catch (error: any) {
    console.error('[PATCH /api/user/notifications] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update notification' },
      { status: 500 }
    );
  }
}
