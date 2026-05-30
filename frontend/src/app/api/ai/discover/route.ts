import { NextResponse } from 'next/server';
import { handleDiscoverRequest } from '@/backend/ai/discover';

// Never pre-render at build time — requires Firebase + env vars at runtime only
export const dynamic = 'force-dynamic';


export async function POST() {
  try {
    const insights = await handleDiscoverRequest();
    return NextResponse.json({ insights });
  } catch (error) {
    console.error('Discovery API Error:', error);
    return NextResponse.json(
      { insights: [] },
      { status: 500 }
    );
  }
}
