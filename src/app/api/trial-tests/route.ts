import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      title,
      description,
      type,
      durationMinutes,
      totalQuestions,
      trainers,
      creatorAdminId, // опционально
    } = body;

    if (!title || !description || !type || !durationMinutes || !totalQuestions || !Array.isArray(trainers) || trainers.length < 2) {
      return NextResponse.json({ error: 'Все поля обязательны, тренеров минимум 2' }, { status: 400 });
    }

    const trialTest = await prisma.trialTest.create({
      data: {
        title,
        description,
        type,
        status: 'created',
        durationMinutes: Number(durationMinutes),
        totalQuestions: Number(totalQuestions),
        creatorAdminId: creatorAdminId || null,
      },
    });

    await prisma.trialTestTrainer.createMany({
      data: trainers.map((trainerId: number | string) => ({
        trialTestId: trialTest.id,
        trainerId: Number(trainerId),
      })),
    });

    return NextResponse.json({ success: true, trialTestId: trialTest.id });
  } catch (error) {
    console.error('Failed to create trial test:', error);
    return NextResponse.json({ error: 'Failed to create trial test' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const tests = await prisma.trialTest.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        trainers: {
          include: {
            trainer: {
              select: { id: true, fullname: true }
            }
          }
        }
      }
    });
    return NextResponse.json({ tests });
  } catch (error) {
    console.error('Failed to fetch trial tests:', error);
    return NextResponse.json({ error: 'Failed to fetch trial tests' }, { status: 500 });
  }
} 