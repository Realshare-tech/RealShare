import { NextResponse } from 'next/server';
import { auth } from '@/lib/firebase-admin';
import prisma from '@/lib/prisma';

/**
 * POST /api/delegate-access/generate
 * 
 * Called from the MOBILE APP by the user themselves.
 * Generates a 6-digit alphanumeric code valid for 60 seconds.
 * The user then shares this code with the admin/employee.
 */
export async function POST(req: Request) {
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
      select: { role: true, full_name: true }
    });

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Only buyer/investor/agent/builder can generate delegate codes
    if (!['buyer', 'investor', 'agent', 'builder'].includes(profile.role)) {
      return NextResponse.json({ error: 'Only user accounts can grant delegate access' }, { status: 403 });
    }

    // Expire any existing pending sessions for this user
    await prisma.delegateAccessSession.updateMany({
      where: {
        target_user_id: userId,
        status: 'pending',
      },
      data: { status: 'expired' }
    });

    // Generate 6-digit alphanumeric code
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let accessCode = '';
    for (let i = 0; i < 6; i++) {
      accessCode += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    // Create session with 60-second expiry — requester will be filled when code is verified
    const session = await prisma.delegateAccessSession.create({
      data: {
        requester_id: userId, // Temporarily set to self; updated on verify
        requester_role: 'pending',
        requester_name: null,
        target_user_id: userId,
        target_user_role: profile.role,
        target_user_name: profile.full_name,
        access_code: accessCode,
        status: 'pending',
        code_expires_at: new Date(Date.now() + 60 * 1000), // 60 seconds
      }
    });

    return NextResponse.json({
      success: true,
      access_code: accessCode,
      expires_at: session.code_expires_at,
    });
  } catch (error: any) {
    console.error('Delegate code generation failed:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
