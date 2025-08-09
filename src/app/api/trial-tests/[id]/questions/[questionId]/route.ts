import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

interface RouteContext {
  params: Promise<{ id: string; questionId: string }>;
}

export async function DELETE(
  request: Request,
  context: RouteContext
) {
  try {
    const params = await context.params;
    const testId = parseInt(params.id);
    const questionId = parseInt(params.questionId);

    // Проверяем существование вопроса
    const question = await prisma.trialTestQuestion.findFirst({
      where: {
        id: questionId,
        trialTestId: testId,
      },
    });

    if (!question) {
      return NextResponse.json(
        { error: 'Вопрос не найден' },
        { status: 404 }
      );
    }

    // Удаляем вопрос
    await prisma.trialTestQuestion.delete({
      where: { id: questionId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting question:', error);
    return NextResponse.json(
      { error: 'Ошибка при удалении вопроса' },
      { status: 500 }
    );
  }
}
