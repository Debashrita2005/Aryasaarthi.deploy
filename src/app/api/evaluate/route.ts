import { NextRequest, NextResponse } from 'next/server';
import { evaluateWithPythonEngine, getPythonEngineStatus } from '@/lib/pythonEngineClient';
import { RecommendationRequest } from '@/lib/types';

export async function GET() {
  const status = await getPythonEngineStatus();
  return NextResponse.json({
    status: 'online',
    pythonEngine: status
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as RecommendationRequest;
    const { response, engineSource } = await evaluateWithPythonEngine(body);

    return NextResponse.json({
      ...response,
      meta: {
        engineSource,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to process recommendation' },
      { status: 500 }
    );
  }
}
