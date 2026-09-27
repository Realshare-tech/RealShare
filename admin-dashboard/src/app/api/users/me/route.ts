import { NextResponse } from 'next/server';
import { auth } from '@/lib/firebase-admin';

import prisma from '@/lib/prisma';
export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await auth.verifyIdToken(token);
    const userId = decodedToken.uid;

    const profile = await prisma.profile.findUnique({
      where: { id: userId }
    });

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const activeSubscription = await prisma.userSubscription.findFirst({
      where: {
        user_id: userId,
        status: 'active'
      },
      include: { plan: true },
      orderBy: { created_at: 'desc' }
    });

    const hasUsedFreePlan = await prisma.userSubscription.count({
      where: {
        user_id: userId,
        plan: { tier: 'REGULAR', price: 0 }
      }
    }) > 0;

    let subscriptionObj = null;
    if (activeSubscription) {
      subscriptionObj = {
        id: activeSubscription.id,
        tier: activeSubscription.plan.tier,
        plan_name: `${activeSubscription.plan.tier} (${activeSubscription.plan.role_type})`,
        postings_limit: activeSubscription.plan.postings_limit,
        postings_used: activeSubscription.postings_used,
        expires_at: activeSubscription.expires_at,
        status: activeSubscription.status
      };
    }

    return NextResponse.json({
      ...profile,
      subscription: subscriptionObj,
      has_used_free_plan: hasUsedFreePlan
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await auth.verifyIdToken(token);
    const userId = decodedToken.uid;

    // Soft delete in database
    await prisma.profile.update({
      where: { id: userId },
      data: { deleted_at: new Date() }
    });

    // Disable in Firebase Auth
    await auth.updateUser(userId, { disabled: true });

    return NextResponse.json({ success: true, message: 'Account scheduled for deletion and disabled' });
  } catch (error: any) {
    console.error('Error soft-deleting user:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
