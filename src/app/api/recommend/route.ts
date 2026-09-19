import { NextRequest, NextResponse } from 'next/server';
import { evaluateRecommendation } from '@/lib/schemeEngine';
import { RecommendationRequest } from '@/lib/types';
import { getActiveSchemes } from '@/lib/activeSchemes';
import { evaluateWithPythonEngine } from '@/lib/pythonEngineClient';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Server-side strict input validation
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'Invalid request body. Expected JSON object.' },
        { status: 400 }
      );
    }

    const validPurposes = ['BUSINESS', 'EDUCATION', 'GREEN_BUSINESS', 'AGRICULTURE', 'TRANSPORT'];
    if (!validPurposes.includes(body.purpose)) {
      return NextResponse.json(
        { error: 'Field "purpose" must be one of: BUSINESS, EDUCATION, GREEN_BUSINESS, AGRICULTURE, TRANSPORT.' },
        { status: 400 }
      );
    }

    if (body.gender && !['FEMALE', 'MALE', 'OTHER'].includes(body.gender)) {
      return NextResponse.json(
        { error: 'Field "gender" must be one of: FEMALE, MALE, OTHER.' },
        { status: 400 }
      );
    }

    const projectCost = Number(body.projectCost);
    if (isNaN(projectCost) || projectCost <= 0) {
      return NextResponse.json(
        { error: 'Field "projectCost" must be a positive number.' },
        { status: 400 }
      );
    }

    const annualFamilyIncome = Number(body.annualFamilyIncome);
    if (isNaN(annualFamilyIncome) || annualFamilyIncome < 0) {
      return NextResponse.json(
        { error: 'Field "annualFamilyIncome" must be a non-negative number.' },
        { status: 400 }
      );
    }

    if (!['YES', 'NO', 'IN_PROGRESS'].includes(body.scCertificate)) {
      return NextResponse.json(
        { error: 'Field "scCertificate" must be "YES", "NO", or "IN_PROGRESS".' },
        { status: 400 }
      );
    }

    const recRequest: RecommendationRequest = {
      purpose: body.purpose,
      projectCost,
      annualFamilyIncome,
      scCertificate: body.scCertificate,
      courseType: body.courseType,
      activityCategory: body.activityCategory,
      gender: body.gender,
      age: body.age !== undefined && body.age !== null ? Number(body.age) : undefined,
      employmentStatus: body.employmentStatus,
      state: body.state,
      areaType: body.areaType,
      location: body.location || (body.state ? { state: body.state } : undefined),
      hasDisability: Boolean(body.hasDisability),
      disabilityStatus: body.disabilityStatus,
      disabilityPercentage: body.disabilityPercentage !== undefined && body.disabilityPercentage !== null ? Number(body.disabilityPercentage) : undefined
    };


    const { response, engineSource } = await evaluateWithPythonEngine(recRequest);

    return NextResponse.json({
      ...response,
      meta: {
        engineSource,
        timestamp: new Date().toISOString()
      }
    }, { status: 200 });
  } catch (err: unknown) {
    console.error('Error in /api/recommend:', err);
    return NextResponse.json(
      { error: 'We could not calculate recommendations right now. Please verify inputs and try again.' },
      { status: 500 }
    );
  }
}
