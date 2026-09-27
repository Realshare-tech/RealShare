import { NextResponse } from 'next/server';
import { auth } from '@/lib/firebase-admin';
import prisma from '@/lib/prisma';

/**
 * POST /api/delegate-access/end
 * Body: { session_id: string }
 * 
 * Ends an active delegate access session.
 */
export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await auth.verifyIdToken(token);
    const requesterId = decodedToken.uid;

    const body = await req.json();
    const { session_id } = body;

    const session = await prisma.delegateAccessSession.findUnique({
      where: { id: session_id }
    });

    if (!session || session.requester_id !== requesterId) {
      return NextResponse.json({ error: 'Session not found or access denied' }, { status: 404 });
    }

    if (session.status !== 'active') {
      return NextResponse.json({ error: 'Session is not active' }, { status: 400 });
    }

    await prisma.delegateAccessSession.update({
      where: { id: session_id },
      data: {
        status: 'completed',
        ended_at: new Date()
      }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delegate access end failed:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
