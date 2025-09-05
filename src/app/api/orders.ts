import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/authOptions';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function isWeekend(date: Date) {
  const day = date.getDay();
  return day === 0 || day === 6;
}

function canChange(date: Date) {
  const now = new Date();
  // Allow change if the order date is today or in the future
  return date >= new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user?.email) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    // List orders for the logged-in user, grouped by week
    // Find user first, then query orders by userId
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const orders = await prisma.order.findMany({
      where: { userId: user.id },
      include: { lunchType: true },
      orderBy: { date: 'desc' },
    });
    const grouped = orders.reduce((acc: any, order: any) => {
      const week = getWeek(order.date);
      if (!acc[week]) acc[week] = [];
      acc[week].push({
        ...order,
        canChange: canChange(new Date(order.date)),
        dayName: new Date(order.date).toLocaleDateString('en-US', { weekday: 'long' }),
      });
      return acc;
    }, {});
    return res.status(200).json(grouped);
  }

  if (req.method === 'POST') {
    const { lunchTypeId, date } = req.body;
    if (!lunchTypeId || !date) {
      return res.status(400).json({ error: 'Missing fields 2' });
    }
    const orderDate = new Date(date);
    if (isWeekend(orderDate)) {
      return res.status(400).json({ error: 'Cannot order on weekends' });
    }
    // Find user
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    // Prevent duplicate order for the same day
    const existing = await prisma.order.findFirst({ where: { userId: user.id, date: orderDate } });
    if (existing) {
      return res.status(400).json({ error: 'Order already exists for this day' });
    }
    // Create order
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        lunchTypeId,
        date: orderDate,
      },
      include: { lunchType: true },
    });
    return res.status(201).json(order);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

function getWeek(date: string | Date) {
  const d = new Date(date);
  const onejan = new Date(d.getFullYear(), 0, 1);
  return Math.ceil((((d as any) - (onejan as any)) / 86400000 + onejan.getDay() + 1) / 7);
} 