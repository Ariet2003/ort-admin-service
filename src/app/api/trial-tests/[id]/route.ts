import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();
    const { trainers, ...testData } = body;

    // Обновляем тест
    const updatedTest = await prisma.trialTest.update({
      where: { id },
      data: testData,
    });

    // Удаляем старые связи с тренерами
    await prisma.trialTestTrainer.deleteMany({
      where: { trialTestId: id },
    });

    // Создаем новые связи с тренерами
    if (trainers && trainers.length > 0) {
      await prisma.trialTestTrainer.createMany({
        data: trainers.map((trainerId: string) => ({
          trialTestId: id,
          trainerId: parseInt(trainerId),
        })),
      });
    }

    // Получаем обновленный тест с тренерами
    const result = await prisma.trialTest.findUnique({
      where: { id },
      include: {
        trainers: {
          include: {
            trainer: {
              select: {
                id: true,
                fullname: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Failed to update trial test:', error);
    return NextResponse.json(
      { error: 'Failed to update trial test' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    // Удаляем связи с тренерами
    await prisma.trialTestTrainer.deleteMany({
      where: { trialTestId: id },
    });

    // Удаляем сам тест
    await prisma.trialTest.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete trial test:', error);
    return NextResponse.json(
      { error: 'Failed to delete trial test' },
      { status: 500 }
    );
  }
} 