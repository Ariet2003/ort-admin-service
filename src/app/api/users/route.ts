import { NextResponse } from 'next/server';
import { PrismaClient, Prisma } from '@prisma/client';
import type { UserRole } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const role = searchParams.get('role') as UserRole | null;
    const sortBy = searchParams.get('sortBy');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Формируем условия поиска
    const where: any = {
      AND: [
        // Поиск по fullname или username
        search ? {
          OR: [
            { fullname: { contains: search, mode: 'insensitive' as Prisma.QueryMode } },
            { username: { contains: search, mode: 'insensitive' as Prisma.QueryMode } },
          ],
        } : {},
        // Фильтр по роли
        role ? { role } : {},
      ],
    };

    // Формируем параметры сортировки
    let orderBy: any = { createdAt: 'desc' };

    switch (sortBy) {
      case 'points_asc':
        orderBy = { points: 'asc' };
        break;
      case 'points_desc':
        orderBy = { points: 'desc' };
        break;
      case 'fullname_asc':
        orderBy = { fullname: 'asc' };
        break;
      case 'fullname_desc':
        orderBy = { fullname: 'desc' };
        break;
    }

    // Получаем общее количество записей
    const total = await prisma.user.count({ where });

    // Получаем пользователей
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        fullname: true,
        username: true,
        phoneNumber: true,
        telegramId: true,
        points: true,
        role: true,
        avatarUrl: true,
        createdAt: true,
        updatedAt: true,
        subjects: {
          select: {
            subjectType: true, // TrainerSubjectType
          },
        },
      },
      orderBy,
      skip,
      take: limit,
    });

    return NextResponse.json({
      users,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit,
      },
    });
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { password, ...userData } = body;

    // Проверяем уникальность username
    const existingUser = await prisma.user.findUnique({
      where: { username: userData.username },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Username already exists' },
        { status: 400 }
      );
    }

    // Хешируем пароль
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 10);

    // Создаем пользователя
    const user = await prisma.user.create({
      data: {
        ...userData,
        password: hashedPassword,
      },
      select: {
        id: true,
        fullname: true,
        username: true,
        phoneNumber: true,
        telegramId: true,
        points: true,
        role: true,
        avatarUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('Failed to create user:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
} 