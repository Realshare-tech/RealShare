import { NextResponse } from 'next/server';
import { auth } from '@/lib/firebase-admin';
import prisma from '@/lib/prisma';

/**
 * POST /api/delegate-access/log-action
 * Body: { session_id, action, entity_type, entity_id?, before?, after?, details? }
 * 
 * Logs every action performed during delegate access for forensic accountability.
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
    const { session_id, action, entity_type, entity_id, before, after, details } = body;

    if (!session_id || !action || !entity_type) {
      return NextResponse.json({ error: 'session_id, action, and entity_type are required' }, { status: 400 });
    }

    // Verify the session belongs to the requester and is active
    const session = await prisma.delegateAccessSession.findUnique({
      where: { id: session_id }
    });

    if (!session || session.requester_id !== requesterId) {
      return NextResponse.json({ error: 'Session not found or access denied' }, { status: 404 });
    }

    if (session.status !== 'active') {
      return NextResponse.json({ error: 'Session is not active' }, { status: 400 });
    }

    const log = await prisma.delegateAccessLog.create({
      data: {
        session_id,
        action,
        entity_type,
        entity_id: entity_id || null,
        before: before || null,
        after: after || null,
        details: details || null,
      }
    });

    return NextResponse.json({ success: true, logId: log.id });
  } catch (error: any) {
    console.error('Delegate access log-action failed:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
