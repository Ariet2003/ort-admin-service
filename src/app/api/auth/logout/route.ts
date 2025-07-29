import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const response = NextResponse.json({ success: true });
    
    // Очищаем куки аутентификации
    response.cookies.delete('auth-token');
    response.cookies.delete('user');
    
    return response;
  } catch (error) {
    console.error('Ошибка при выходе:', error);
    return NextResponse.json(
      { error: 'Ошибка при выходе из системы' },
      { status: 500 }
    );
  }
} 