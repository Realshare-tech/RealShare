import { NextResponse } from 'next/server';
import { auth } from '@/lib/firebase-admin';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await auth.verifyIdToken(token);
    const userId = decodedToken.uid;

    const body = await req.json();
    const { latitude, longitude, photo_url } = body;

    // Get the user's role from the token or profile
    const profile = await prisma.profile.findUnique({
      where: { id: userId },
      select: { role: true }
    });

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Get IP address from headers
    const forwardedFor = req.headers.get('x-forwarded-for');
    const ipAddress = forwardedFor ? forwardedFor.split(',')[0].trim() : req.headers.get('x-real-ip') || 'Unknown';

    const log = await prisma.adminLoginLog.create({
      data: {
        user_id: userId,
        role: profile.role,
        latitude: latitude ? Number(latitude) : null,
        longitude: longitude ? Number(longitude) : null,
        photo_url: photo_url || null,
        ip_address: ipAddress
      }
    });

    return NextResponse.json({ success: true, logId: log.id });
  } catch (error: any) {
    console.error('Failed to save login log:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
