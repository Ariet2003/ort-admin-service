import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const phoneNumber = searchParams.get('phoneNumber');
    const excludeUserId = searchParams.get('excludeUserId');

    if (!phoneNumber) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      );
    }

    // Проверяем существование номера телефона
    const existingUser = await prisma.user.findFirst({
      where: {
        phoneNumber,
        // Исключаем текущего пользователя при редактировании
        ...(excludeUserId && {
          NOT: {
            id: parseInt(excludeUserId)
          }
        })
      }
    });

    return NextResponse.json({
      available: !existingUser
    });
  } catch (error) {
    console.error('Failed to check phone number:', error);
    return NextResponse.json(
      { error: 'Failed to check phone number' },
      { status: 500 }
    );
  }
}
