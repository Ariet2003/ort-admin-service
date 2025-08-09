import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PUT(
  request: Request,
  context: RouteContext
) {
  try {
    const params = await context.params;
    const [body, id] = await Promise.all([
      request.json(),
      Promise.resolve(parseInt(params.id))
    ]);

    // Обновляем тест
    const updatedTest = await prisma.trialTest.update({
      where: { id },
      data: body,
    });

    return NextResponse.json(updatedTest);
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
  context: RouteContext
) {
  try {
    const params = await context.params;
    const id = parseInt(params.id);

    // Удаляем тест
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