import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const lunchTypes = await prisma.lunchType.findMany();
  
  const response = NextResponse.json(lunchTypes);
  // Add cache headers for better performance
  response.headers.set('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
  
  return response;
} 