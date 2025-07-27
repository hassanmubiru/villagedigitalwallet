/**
 * Credit Scoring API Route
 * Handles credit score calculation and loan approval automation
 */

import { NextRequest, NextResponse } from 'next/server';
import { creditScoring, CreditDataPoint } from '../../lib/creditScoring';

export async function POST(request: NextRequest) {
  try {
    const { userId, action, data } = await request.json();

    switch (action) {
      case 'calculate_score':
        return await calculateCreditScore(data);
      
      case 'auto_approve_loan':
        return await autoApproveLoan(data);
      
      case 'get_score_factors':
        return await getScoreFactors(userId);
      
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Credit scoring API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

async function calculateCreditScore(data: CreditDataPoint) {
  try {
    const creditScore = await creditScoring.calculateCreditScore(data);
    return NextResponse.json({ creditScore });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to calculate credit score' }, 
      { status: 500 }
    );
  }
}

async function autoApproveLoan(data: { creditScore: any; loanAmount: number; loanDuration: number }) {
  try {
    const { creditScore, loanAmount, loanDuration } = data;
    const approval = await creditScoring.autoApproveLoan(creditScore, loanAmount, loanDuration);
    return NextResponse.json({ approval });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to process loan approval' }, 
      { status: 500 }
    );
  }
}

async function getScoreFactors(userId: string) {
  try {
    // In production, fetch user's credit data from database
    const mockData: CreditDataPoint = {
      userId,
      transactionHistory: [],
      savingsHistory: [],
      groupParticipation: [],
      socialVouching: [],
      demographicData: {
        age: 30,
        education: 'secondary',
        employment: 'self_employed',
        income: 500000,
        dependents: 3,
        location: 'rural',
        phoneVerified: true,
        idVerified: false
      }
    };

    const creditScore = await creditScoring.calculateCreditScore(mockData);
    return NextResponse.json({ 
      factors: creditScore.factors,
      score: creditScore.score,
      riskCategory: creditScore.riskCategory 
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to get score factors' }, 
      { status: 500 }
    );
  }
}
