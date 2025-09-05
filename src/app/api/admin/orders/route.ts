import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/authOptions';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const date = searchParams.get('date');
  const userId = searchParams.get('userId');
  const where: any = {};
  if (date) where.date = new Date(date);
  if (userId) where.userId = Number(userId);
  const orders = await prisma.order.findMany({
    where,
    include: { user: true, lunchType: true },
    orderBy: { date: 'desc' },
  });
  return NextResponse.json(orders);
}
// ... existing POST/PUT/DELETE if present ... 