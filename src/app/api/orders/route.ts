import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/authOptions';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function isWeekend(date: Date) {
  const day = date.getDay();
  return day === 0 || day === 6;
}

function canChange(date: Date) {
  const now = new Date();
  return date >= new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function getWeek(date: string | Date) {
  const d = new Date(date);
  const onejan = new Date(d.getFullYear(), 0, 1);
  return Math.ceil((((d as any) - (onejan as any)) / 86400000 + onejan.getDay() + 1) / 7);
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Find user first, then query orders by userId
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
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
  return NextResponse.json(grouped);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { lunchTypeId, date, customization, coldType, breadType, drinkType } = await req.json();
  if (!lunchTypeId || !date) {
    return NextResponse.json({ error: 'Missing fields: lunchTypeId and date are required' }, { status: 400 });
  }
  // Fetch lunch type name
  const lunchType = await prisma.lunchType.findUnique({ where: { id: lunchTypeId } });
  if (lunchType?.name === 'Cold' && !coldType) {
    return NextResponse.json({ error: 'Missing fields: sandwich type is required for Cold orders' }, { status: 400 });
  }
  const orderDate = new Date(date);
  const now = new Date();
  // Prevent ordering for previous dates
  if (orderDate < new Date(now.getFullYear(), now.getMonth(), now.getDate())) {
    return NextResponse.json({ error: 'Cannot order for previous dates' }, { status: 400 });
  }
  // Prevent ordering for today after 10 a.m.
  if (
    orderDate.getFullYear() === now.getFullYear() &&
    orderDate.getMonth() === now.getMonth() &&
    orderDate.getDate() === now.getDate() &&
    now.getHours() >= 10
  ) {
    return NextResponse.json({ error: 'Cannot order for today after 10 a.m.' }, { status: 400 });
  }
  if (isWeekend(orderDate)) {
    return NextResponse.json({ error: 'Cannot order on weekends' }, { status: 400 });
  }
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const existing = await prisma.order.findFirst({ where: { userId: user.id, date: orderDate } });
  if (existing) {
    return NextResponse.json({ error: 'Order already exists for this day' }, { status: 400 });
  }
  const order = await prisma.order.create({
    data: {
      userId: user.id,
      lunchTypeId,
      date: orderDate,
      customization: customization || '',
      coldType: coldType || null,
      breadType: breadType || null,
      drinkType: drinkType || null,
    },
    include: { lunchType: true },
  });
  return NextResponse.json(order, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { id, lunchTypeId, date, customization, coldType, breadType, drinkType } = await req.json();
  if (!id || !lunchTypeId || !date) {
    return NextResponse.json({ error: 'Missing fields: id, lunchTypeId, and date are required' }, { status: 400 });
  }
  const lunchType = await prisma.lunchType.findUnique({ where: { id: lunchTypeId } });
  if (lunchType?.name === 'Cold' && !coldType) {
    return NextResponse.json({ error: 'Missing fields: sandwich type is required for Cold orders' }, { status: 400 });
  }
  const orderDate = new Date(date);
  const now = new Date();
  if (orderDate < new Date(now.getFullYear(), now.getMonth(), now.getDate())) {
    return NextResponse.json({ error: 'Cannot edit order for previous dates' }, { status: 400 });
  }
  if (
    orderDate.getFullYear() === now.getFullYear() &&
    orderDate.getMonth() === now.getMonth() &&
    orderDate.getDate() === now.getDate() &&
    now.getHours() >= 10
  ) {
    return NextResponse.json({ error: 'Cannot edit order for today after 10 a.m.' }, { status: 400 });
  }
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const order = await prisma.order.findUnique({ where: { id } });
  if (!order || order.userId !== user.id) {
    return NextResponse.json({ error: 'Order not found or not yours' }, { status: 404 });
  }
  const updated = await prisma.order.update({
    where: { id },
    data: { 
      lunchTypeId, 
      customization: customization || '',
      coldType: coldType || null,
      breadType: breadType || null,
      drinkType: drinkType || null,
    },
    include: { lunchType: true },
  });
  return NextResponse.json(updated, { status: 200 });
} 