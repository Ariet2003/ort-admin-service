import { NextResponse } from 'next/server';
import { PrismaClient, Prisma } from '@prisma/client';
import type { UserRole, Language } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const role = searchParams.get('role');
    const language = searchParams.get('language');
    // Проверяем, что роль может быть только ADMIN или STUDENT
    const validRole = role === 'ADMIN' || role === 'STUDENT' ? role as UserRole : null;
    // Проверяем, что язык может быть только KYRGYZ или RUSSIAN
    const validLanguage = language === 'KYRGYZ' || language === 'RUSSIAN' ? language as Language : null;
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
        validRole ? { role: validRole } : {},
        // Фильтр по языку
        validLanguage ? { language: validLanguage } : {},
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
        language: true,
        avatarUrl: true,
        createdAt: true,
        updatedAt: true,
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

    // Хешируем пароль
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 10);

    // Создаем пользователя
    const user = await prisma.user.create({
      data: {
        ...userData,
        password: hashedPassword,
        // Убеждаемся, что пустые строки сохраняются как null
        phoneNumber: userData.phoneNumber || null,
        telegramId: userData.telegramId || null,
        avatarUrl: userData.avatarUrl || null,
      },
      select: {
        id: true,
        fullname: true,
        username: true,
        phoneNumber: true,
        telegramId: true,
        points: true,
        role: true,
        language: true,
        avatarUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(user);
  } catch (error: any) {
    console.error('Failed to create user:', error);
    
    // Проверяем ошибку уникальности
    if (error?.code === 'P2002') {
      const fields = error?.meta?.target;
      if (!fields || !Array.isArray(fields)) {
        return NextResponse.json(
          { error: 'Ошибка при создании пользователя: данные уже существуют' },
          { status: 400 }
        );
      }

      // Преобразуем названия полей в понятные пользователю
      const fieldNames = fields.map(field => {
        switch (field) {
          case 'username':
            return 'логин';
          case 'telegram_id':
            return 'Telegram ID';
          case 'phone_number':
            return 'номер телефона';
          default:
            return field;
        }
      });

      // Формируем сообщение об ошибке
      const fieldsStr = fieldNames.join(' и ');
      const message = `Пользователь с таким ${fieldsStr} уже существует`;
      
      return NextResponse.json(
        { error: message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Не удалось создать пользователя' },
      { status: 500 }
    );
  }
} 