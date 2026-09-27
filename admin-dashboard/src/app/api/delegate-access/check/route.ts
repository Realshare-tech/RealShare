import { NextResponse } from 'next/server';
import { auth } from '@/lib/firebase-admin';
import prisma from '@/lib/prisma';

/**
 * GET /api/delegate-access/check?userId=xxx
 * 
 * Called from the mobile app to check if there's a pending delegate access request
 * for the current user and return the code.
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

    // Find pending sessions for this user
    const pendingSession = await prisma.delegateAccessSession.findFirst({
      where: {
        target_user_id: userId,
        status: 'pending',
        code_expires_at: { gt: new Date() }
      },
      orderBy: { created_at: 'desc' }
    });

    if (!pendingSession) {
      return NextResponse.json({ success: true, hasPending: false });
    }

    return NextResponse.json({
      success: true,
      hasPending: true,
      session: {
        id: pendingSession.id,
        requester_name: pendingSession.requester_name,
        requester_role: pendingSession.requester_role,
        access_code: pendingSession.access_code,
        reason: pendingSession.reason,
        expires_at: pendingSession.code_expires_at,
      }
    });
  } catch (error: any) {
    console.error('Delegate check failed:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
