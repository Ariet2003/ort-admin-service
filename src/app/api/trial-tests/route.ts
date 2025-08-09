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
      creatorAdminId, // опционально
    } = body;

    if (!title || !description || !type || !durationMinutes || !totalQuestions) {
      return NextResponse.json({ error: 'Все поля обязательны' }, { status: 400 });
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
        creatorAdmin: {
          select: {
            id: true,
            fullname: true
          }
        },
        questions: true
      }
    });
    return NextResponse.json({ tests });
  } catch (error) {
    console.error('Failed to fetch trial tests:', error);
    return NextResponse.json({ error: 'Failed to fetch trial tests' }, { status: 500 });
  }
} 