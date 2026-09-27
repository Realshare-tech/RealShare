import { NextResponse } from 'next/server';
import { auth } from '@/lib/firebase-admin';
import prisma from '@/lib/prisma';

/**
 * GET /api/delegate-access/sessions
 * 
 * Superadmin-only: returns all delegate access sessions with their logs.
 * Admin/Employee: returns only their own sessions.
 */
export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await auth.verifyIdToken(token);
    const userId = decodedToken.uid;

    const profile = await prisma.profile.findUnique({
      where: { id: userId },
      select: { role: true }
    });

    if (!profile || !['admin', 'superadmin', 'employee'].includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const whereClause = profile.role === 'superadmin'
      ? {} // Superadmin sees all
      : { requester_id: userId }; // Others see only their own

    const sessions = await prisma.delegateAccessSession.findMany({
      where: whereClause,
      orderBy: { created_at: 'desc' },
      take: 100,
      include: {
        logs: {
          orderBy: { created_at: 'asc' }
        },
        requester: {
          select: { full_name: true, email: true, phone_number: true, avatar_url: true }
        },
        target_user: {
          select: { full_name: true, email: true, phone_number: true, avatar_url: true }
        }
      }
    });

    return NextResponse.json({ success: true, sessions });
  } catch (error: any) {
    console.error('Delegate sessions fetch failed:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
