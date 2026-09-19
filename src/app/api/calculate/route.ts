import { NextRequest, NextResponse } from 'next/server';
import { calculateRepayment } from '@/lib/financialCalculator';
import { CalculationRequest } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'Invalid request body. Expected JSON object.' },
        { status: 400 }
      );
    }

    const principal = Number(body.principal);
    if (isNaN(principal) || principal <= 0) {
      return NextResponse.json(
        { error: 'Loan principal amount must be greater than zero.' },
        { status: 400 }
      );
    }

    const annualRate = Number(body.annualRate);
    if (isNaN(annualRate) || annualRate < 0 || annualRate > 30) {
      return NextResponse.json(
        { error: 'Annual interest rate must be between 0% and 30%.' },
        { status: 400 }
      );
    }

    const tenureMonths = Number(body.tenureMonths);
    if (isNaN(tenureMonths) || tenureMonths < 1 || tenureMonths > 240) {
      return NextResponse.json(
        { error: 'Tenure must be between 1 and 240 months.' },
        { status: 400 }
      );
    }

    const calcRequest: CalculationRequest = {
      principal,
      annualRate,
      tenureMonths,
      moratoriumMonths: body.moratoriumMonths ? Number(body.moratoriumMonths) : 0,
      moratoriumMode: body.moratoriumMode || 'NO_INTEREST_DURING_MORATORIUM',
      frequency: body.frequency || 'MONTHLY',
      projectCost: body.projectCost ? Number(body.projectCost) : undefined
    };

    const result = calculateRepayment(calcRequest);

    return NextResponse.json(result, { status: 200 });
  } catch (err: unknown) {
    console.error('Error in /api/calculate:', err);
    return NextResponse.json(
      { error: 'Calculation failed. Please check inputs and try again.' },
      { status: 500 }
    );
  }
}
