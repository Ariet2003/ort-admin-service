import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(params.id) },
      select: {
        id: true,
        fullname: true,
        username: true,
        phoneNumber: true,
        telegramId: true,
        points: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Failed to fetch user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { password, ...userData } = body;

    // Если меняется username, проверяем его уникальность
    if (userData.username) {
      const existingUser = await prisma.user.findUnique({
        where: {
          username: userData.username,
          NOT: {
            id: parseInt(params.id),
          },
        },
      });

      if (existingUser) {
        return NextResponse.json(
          { error: 'Username already exists' },
          { status: 400 }
        );
      }
    }

    // Если передан пароль, хешируем его
    const updateData = {
      ...userData,
      ...(password && { password: await bcrypt.hash(password, 10) }),
    };

    const user = await prisma.user.update({
      where: { id: parseInt(params.id) },
      data: updateData,
      select: {
        id: true,
        fullname: true,
        username: true,
        phoneNumber: true,
        telegramId: true,
        points: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('Failed to update user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.user.delete({
      where: { id: parseInt(params.id) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete user:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
} 