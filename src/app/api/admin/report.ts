import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/authOptions';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function toCSV(rows: any[]) {
  if (!rows.length) return '';
  const header = Object.keys(rows[0]).join(',');
  const data = rows.map(row => Object.values(row).join(',')).join('\n');
  return header + '\n' + data;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user?.isAdmin) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  const { from, to } = req.query;
  if (!from || !to) return res.status(400).json({ error: 'Missing date range' });
  const orders = await prisma.order.findMany({
    where: {
      date: {
        gte: new Date(from as string),
        lte: new Date(to as string),
      },
    },
    include: { user: true, lunchType: true },
    orderBy: { date: 'asc' },
  });
  const rows = orders.map(o => ({
    date: o.date.toISOString().slice(0, 10),
    user: o.user?.username,
    email: o.user?.email,
    lunch: o.lunchType?.name,
    price: o.lunchType?.price,
  }));
  const csv = toCSV(rows);
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="report.csv"');
  res.status(200).send(csv);
} 