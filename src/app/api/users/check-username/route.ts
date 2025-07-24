import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');
    const excludeUserId = searchParams.get('excludeUserId');

    if (!username) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      );
    }

    const where = {
      username,
      ...(excludeUserId && {
        NOT: {
          id: parseInt(excludeUserId),
        },
      }),
    };

    const existingUser = await prisma.user.findFirst({ where });

    return NextResponse.json({
      available: !existingUser,
    });
  } catch (error) {
    console.error('Failed to check username:', error);
    return NextResponse.json(
      { error: 'Failed to check username' },
      { status: 500 }
    );
  }
} 