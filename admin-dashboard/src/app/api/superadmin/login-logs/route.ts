import { NextResponse } from 'next/server';
import { auth } from '@/lib/firebase-admin';
import prisma from '@/lib/prisma';

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

    if (profile?.role !== 'superadmin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const logs = await prisma.adminLoginLog.findMany({
      orderBy: { created_at: 'desc' },
      include: {
        profile: {
          select: {
            full_name: true,
            email: true,
            phone_number: true,
            avatar_url: true,
          }
        }
      },
      take: 100 // Get latest 100 for now
    });

    return NextResponse.json({ success: true, logs });
  } catch (error: any) {
    console.error('Failed to fetch login logs:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
