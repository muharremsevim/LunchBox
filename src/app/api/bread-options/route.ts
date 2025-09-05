import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    // Get all parameters that start with 'bread_'
    const breadOptions = await prisma.parameter.findMany({
      where: {
        key: {
          startsWith: 'bread_'
        }
      },
      select: {
        value: true
      },
      orderBy: {
        key: 'asc'
      }
    });
    
    const options = breadOptions.map(param => param.value);
    
    const response = NextResponse.json(options);
    // Add cache headers for better performance
    response.headers.set('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
    
    return response;
  } catch (error) {
    console.error('Error fetching bread options:', error);
    return NextResponse.json({ error: 'Failed to fetch bread options' }, { status: 500 });
  }
} 