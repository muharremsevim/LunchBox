import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/authOptions';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user?.isAdmin) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    const { date, userId } = req.query;
    const where: any = {};
    if (date) where.date = new Date(date as string);
    if (userId) where.userId = Number(userId);
    const orders = await prisma.order.findMany({
      where,
      include: { user: true, lunchType: true },
      orderBy: { date: 'desc' },
    });
    return res.status(200).json(orders);
  }

  if (req.method === 'POST') {
    const { id, userId, lunchTypeId, date } = req.body;
    if (!userId || !lunchTypeId || !date) {
      return res.status(400).json({ error: 'Missing fields' });
    }
    let order;
    if (id) {
      order = await prisma.order.update({
        where: { id: Number(id) },
        data: { userId, lunchTypeId, date: new Date(date) },
        include: { user: true, lunchType: true },
      });
    } else {
      order = await prisma.order.create({
        data: { userId, lunchTypeId, date: new Date(date) },
        include: { user: true, lunchType: true },
      });
    }
    return res.status(201).json(order);
  }

  if (req.method === 'DELETE') {
    const { id } = req.body;
    if (!id) return res.status(400).json({ error: 'Missing order id' });
    await prisma.order.delete({ where: { id: Number(id) } });
    return res.status(204).end();
  }

  return res.status(405).json({ error: 'Method not allowed' });
} 