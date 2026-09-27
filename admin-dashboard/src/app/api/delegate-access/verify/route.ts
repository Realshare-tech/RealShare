import { NextResponse } from 'next/server';
import { auth } from '@/lib/firebase-admin';
import prisma from '@/lib/prisma';

/**
 * POST /api/delegate-access/verify
 * Body: { access_code: string }
 * 
 * Called from the ADMIN DASHBOARD by the admin/employee.
 * They enter the 6-digit code the user shared with them.
 * Validates the code, activates the session, and returns the user's profile.
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

    // Only admin/superadmin/employee can use delegate codes
    const requester = await prisma.profile.findUnique({
      where: { id: requesterId },
      select: { role: true, full_name: true }
    });

    if (!requester || !['admin', 'superadmin', 'employee'].includes(requester.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { access_code } = body;

    if (!access_code || access_code.length !== 6) {
      return NextResponse.json({ error: 'Please enter a valid 6-digit code' }, { status: 400 });
    }

    // Find a pending session with this code that hasn't expired
    const session = await prisma.delegateAccessSession.findFirst({
      where: {
        access_code: access_code.toUpperCase(),
        status: 'pending',
        code_expires_at: { gt: new Date() }
      }
    });

    if (!session) {
      return NextResponse.json({ error: 'Invalid or expired code. Ask the user to generate a new one.' }, { status: 400 });
    }

    // Get IP address
    const forwardedFor = req.headers.get('x-forwarded-for');
    const ipAddress = forwardedFor ? forwardedFor.split(',')[0].trim() : req.headers.get('x-real-ip') || 'Unknown';

    // Activate the session and attach the requester info
    await prisma.delegateAccessSession.update({
      where: { id: session.id },
      data: {
        requester_id: requesterId,
        requester_role: requester.role,
        requester_name: requester.full_name,
        status: 'active',
        activated_at: new Date(),
        ip_address: ipAddress,
      }
    });

    // Fetch the full target user profile
    const targetProfile = await prisma.profile.findUnique({
      where: { id: session.target_user_id },
      include: {
        kyc_documents: true,
        subscriptions: {
          include: { plan: true },
          orderBy: { created_at: 'desc' },
          take: 1
        },
        posted_properties: {
          orderBy: { created_at: 'desc' },
          take: 20
        },
        investments: {
          orderBy: { created_at: 'desc' },
          take: 20
        }
      }
    });

    return NextResponse.json({
      success: true,
      session: {
        id: session.id,
        status: 'active',
        target_user_name: session.target_user_name,
        target_user_role: session.target_user_role,
        activated_at: new Date().toISOString()
      },
      profile: targetProfile
    });
  } catch (error: any) {
    console.error('Delegate access verify failed:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
