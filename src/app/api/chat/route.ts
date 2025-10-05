import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Базовая обработка запроса
    return NextResponse.json({
      success: true,
      message: 'Chat API endpoint',
      data: body,
    });
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid request' }, { status: 400 });
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Chat API is running',
  });
}
