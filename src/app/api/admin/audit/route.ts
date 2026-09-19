import { NextResponse } from 'next/server';
import { INITIAL_AUDIT_LOGS } from '@/lib/sourceData';

export async function GET() {
  return NextResponse.json({
    totalAuditEvents: INITIAL_AUDIT_LOGS.length,
    events: INITIAL_AUDIT_LOGS
  });
}
