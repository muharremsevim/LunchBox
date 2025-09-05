import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/authOptions';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (req.method === 'GET') {
    const params = await prisma.parameter.findMany();
    return res.status(200).json(params);
  }
  if (req.method === 'POST') {
    if (!session || !session.user?.isAdmin) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const { key, value } = req.body;
    if (!key || !value) return res.status(400).json({ error: 'Missing fields' });
    const param = await prisma.parameter.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
    return res.status(201).json(param);
  }
  return res.status(405).json({ error: 'Method not allowed' });
} 