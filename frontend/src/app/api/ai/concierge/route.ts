import { NextRequest, NextResponse } from 'next/server';
import { handleConciergeRequest } from '@/backend/ai/concierge';

export async function POST(req: NextRequest) {
  try {
    const { message, history, mode } = await req.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const response = await handleConciergeRequest(message, history, mode);
    return NextResponse.json({ response });
  } catch (error: unknown) {
    console.error('LLM API error:', error);
    return NextResponse.json(
      { error: 'AI service temporarily unavailable. Please try again.' },
      { status: 500 }
    );
  }
}
