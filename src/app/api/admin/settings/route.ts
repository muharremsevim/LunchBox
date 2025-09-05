import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  const sender = await prisma.parameter.findUnique({ where: { key: 'email_sender' } });
  const recipient = await prisma.parameter.findUnique({ where: { key: 'email_recipient' } });
  return NextResponse.json({ sender: sender?.value || '', recipient: recipient?.value || '' });
}

export async function POST(req: NextRequest) {
  const { sender, recipient } = await req.json();
  await prisma.parameter.upsert({
    where: { key: 'email_sender' },
    update: { value: sender },
    create: { key: 'email_sender', value: sender },
  });
  await prisma.parameter.upsert({
    where: { key: 'email_recipient' },
    update: { value: recipient },
    create: { key: 'email_recipient', value: recipient },
  });
  return NextResponse.json({ success: true });
} 