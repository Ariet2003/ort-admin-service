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

    const test = await prisma.trialTest.findUnique({
      where: { id },
      include: {
        questions: true,
        creatorAdmin: {
          select: {
            id: true,
            fullname: true,
            username: true,
          },
        },
      },
    });

    if (!test) {
      return NextResponse.json(
        { error: 'Тест не найден' },
        { status: 404 }
      );
    }

    return NextResponse.json(test);
  } catch (error) {
    console.error('Error fetching test:', error);
    return NextResponse.json(
      { error: 'Ошибка при загрузке теста' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  context: RouteContext
) {
  try {
    const params = await context.params;
    const id = parseInt(params.id);
    const data = await request.json();

    const test = await prisma.trialTest.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        type: data.type,
        status: data.status,
        durationMinutes: data.durationMinutes,
        totalQuestions: data.totalQuestions,
        language: data.language,
      },
    });

    return NextResponse.json(test);
  } catch (error) {
    console.error('Error updating test:', error);
    return NextResponse.json(
      { error: 'Ошибка при обновлении теста' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  context: RouteContext
) {
  try {
    const params = await context.params;
    const id = parseInt(params.id);

    // Сначала удаляем все вопросы теста
    await prisma.trialTestQuestion.deleteMany({
      where: { trialTestId: id },
    });

    // Затем удаляем сам тест
    await prisma.trialTest.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting test:', error);
    return NextResponse.json(
      { error: 'Ошибка при удалении теста' },
      { status: 500 }
    );
  }
}