import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(
  request: Request,
  context: RouteContext
) {
  try {
    const params = await context.params;
    const id = parseInt(params.id);

    const questions = await prisma.trialTestQuestion.findMany({
      where: { trialTestId: id },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({ questions });
  } catch (error) {
    console.error('Error fetching questions:', error);
    return NextResponse.json(
      { error: 'Ошибка при загрузке вопросов' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  context: RouteContext
) {
  try {
    const params = await context.params;
    const id = parseInt(params.id);
    const data = await request.json();

    // Проверяем существование теста
    const test = await prisma.trialTest.findUnique({
      where: { id },
    });

    if (!test) {
      return NextResponse.json(
        { error: 'Тест не найден' },
        { status: 404 }
      );
    }

    // Создаем вопрос
    const question = await prisma.trialTestQuestion.create({
      data: {
        trialTestId: id,
        questionText: data.questionText,
        imageUrl: data.imageUrl,
        optionA: data.optionA,
        optionB: data.optionB,
        optionC: data.optionC,
        optionD: data.optionD,
        subjectType: data.subjectType,
        correctOption: data.correctOption,
        explanation: data.explanation,
        points: data.points,
        creatorId: 1, // TODO: Заменить на реального пользователя из сессии
      },
    });

    return NextResponse.json(question);
  } catch (error) {
    console.error('Error creating question:', error);
    return NextResponse.json(
      { error: 'Ошибка при создании вопроса' },
      { status: 500 }
    );
  }
}
