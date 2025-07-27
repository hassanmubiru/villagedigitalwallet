/**
 * Advanced Credit Scoring Library for Village Digital Wallet
 * Implements ML-driven credit assessment and automated loan approvals
 */

export interface CreditDataPoint {
  userId: string;
  transactionHistory: Transaction[];
  savingsHistory: SavingsRecord[];
  groupParticipation: GroupActivity[];
  socialVouching: VouchingRecord[];
  demographicData: DemographicInfo;
  externalData?: ExternalCreditData;
}

export interface Transaction {
  id: string;
  amount: number;
  type: 'deposit' | 'withdrawal' | 'transfer' | 'loan_repayment';
  timestamp: Date;
  frequency: number;
  regularity: number; // 0-1 score for transaction regularity
}

export interface SavingsRecord {
  groupId: string;
  contributionAmount: number;
  contributionFrequency: 'weekly' | 'monthly' | 'quarterly';
  consistencyScore: number; // 0-1 score for contribution consistency
  totalSaved: number;
  duration: number; // in months
}

export interface ConflictRecord {
  date: Date;
  type: 'payment_delay' | 'group_disruption' | 'trust_violation';
  severity: 'low' | 'medium' | 'high';
  resolved: boolean;
  impact: number; // 0-100 scale
}

export interface SocialData {
  trustScore: number; // Average trust rating from other members
  participationRate: number; // Meeting attendance rate
  conflictHistory: ConflictRecord[];
}

export interface VouchingRecord {
  voucherId: string;
  voucherTrustScore: number;
  relationshipStrength: number; // 0-1 score
  vouchingAmount: number;
  timestamp: Date;
}

export interface TransactionRecord {
  id: string;
  amount: number;
  type: 'income' | 'expense' | 'transfer';
  date: Date;
  category: string;
  recurring: boolean;
}

export interface GroupActivity {
  groupId: string;
  role: 'member' | 'leader' | 'treasurer';
  joinDate: Date;
  contributionHistory: number[];
  meetingAttendance: number;
  trustRating: number;
  participationRate: number;
  conflictHistory: ConflictRecord[];
}

export interface BankingRecord {
  provider: string;
  accountType: string;
  openDate: Date;
  creditScore?: number;
  defaultHistory: boolean;
}

export interface TaxRecord {
  year: number;
  paid: boolean;
  amount: number;
  onTime: boolean;
}

export interface DemographicInfo {
  age: number;
  education: 'none' | 'primary' | 'secondary' | 'tertiary';
  employment: 'unemployed' | 'informal' | 'formal' | 'self_employed';
  income: number;
  dependents: number;
  location: string;
  phoneVerified: boolean;
  idVerified: boolean;
}

export interface ConflictRecord {
  date: Date;
  type: 'payment_delay' | 'group_disruption' | 'trust_violation';
  severity: 'low' | 'medium' | 'high';
  resolved: boolean;
  impact: number; // 0-100 scale
}

export interface UserProfile {
  id: string;
  age: number;
  education: 'none' | 'primary' | 'secondary' | 'tertiary';
  employment: 'unemployed' | 'informal' | 'formal' | 'self_employed';
  income: number;
  dependents: number;
  location: string;
  transactionHistory: TransactionRecord[];
  groupParticipation: GroupActivity[];
  savingsBalance: number;
}

export interface ExternalCreditData {
  mobileMoneyCreditScore?: number;
  bankingHistory?: BankingRecord[];
  governmentIdStatus?: 'verified' | 'unverified';
  taxPaymentHistory?: TaxRecord[];
}

export interface CreditScore {
  score: number; // 300-850 range (FICO-like)
  factors: ScoreFactors;
  riskCategory: 'low' | 'medium' | 'high';
  maxLoanAmount: number;
  recommendedInterestRate: number;
  confidence: number; // 0-1 confidence in the score
}

export interface ScoreFactors {
  transactionHistoryWeight: number;
  savingsConsistencyWeight: number;
  groupTrustWeight: number;
  socialVouchingWeight: number;
  demographicWeight: number;
  externalDataWeight: number;
}

export class AdvancedCreditScoring {
  private readonly weights: ScoreFactors = {
    transactionHistoryWeight: 0.25,
    savingsConsistencyWeight: 0.20,
    groupTrustWeight: 0.20,
    socialVouchingWeight: 0.15,
    demographicWeight: 0.10,
    externalDataWeight: 0.10
  };

  private readonly riskThresholds = {
    low: 650,
    medium: 500,
    high: 300
  };

  /**
   * Calculate comprehensive credit score
   */
  async calculateCreditScore(data: CreditDataPoint): Promise<CreditScore> {
    const transactionScore = this.calculateTransactionHistoryScore(data.transactionHistory);
    const savingsScore = this.calculateSavingsConsistencyScore(data.savingsHistory);
    const groupScore = this.calculateGroupTrustScore(data.groupParticipation);
    const vouchingScore = this.calculateSocialVouchingScore(data.socialVouching);
    const demographicScore = this.calculateDemographicScore(data.demographicData);
    const externalScore = this.calculateExternalDataScore(data.externalData);

    const weightedScore = 
      (transactionScore * this.weights.transactionHistoryWeight) +
      (savingsScore * this.weights.savingsConsistencyWeight) +
      (groupScore * this.weights.groupTrustWeight) +
      (vouchingScore * this.weights.socialVouchingWeight) +
      (demographicScore * this.weights.demographicWeight) +
      (externalScore * this.weights.externalDataWeight);

    // Convert to 300-850 range
    const finalScore = Math.round(300 + (weightedScore * 550));

    const riskCategory = this.determineRiskCategory(finalScore);
    const maxLoanAmount = this.calculateMaxLoanAmount(finalScore, data);
    const interestRate = this.calculateRecommendedInterestRate(finalScore, riskCategory);
    const confidence = this.calculateConfidence(data);

    return {
      score: finalScore,
      factors: this.weights,
      riskCategory,
      maxLoanAmount,
      recommendedInterestRate: interestRate,
      confidence
    };
  }

  /**
   * Analyze transaction patterns for regularity and reliability
   */
  private calculateTransactionHistoryScore(transactions: Transaction[]): number {
    if (transactions.length === 0) return 0.3;

    const now = new Date();
    const recentTransactions = transactions.filter(t => 
      (now.getTime() - t.timestamp.getTime()) / (1000 * 60 * 60 * 24) <= 90
    );

    // Calculate transaction frequency score
    const avgFrequency = recentTransactions.reduce((sum, t) => sum + t.frequency, 0) / recentTransactions.length;
    const frequencyScore = Math.min(avgFrequency / 10, 1); // Normalize to 0-1

    // Calculate regularity score
    const avgRegularity = recentTransactions.reduce((sum, t) => sum + t.regularity, 0) / recentTransactions.length;

    // Calculate transaction volume growth
    const volumeGrowth = this.calculateVolumeGrowth(transactions);

    // Weighted combination
    return (frequencyScore * 0.4) + (avgRegularity * 0.4) + (volumeGrowth * 0.2);
  }

  /**
   * Evaluate savings behavior and consistency
   */
  private calculateSavingsConsistencyScore(savingsHistory: SavingsRecord[]): number {
    if (savingsHistory.length === 0) return 0.2;

    const avgConsistency = savingsHistory.reduce((sum, s) => sum + s.consistencyScore, 0) / savingsHistory.length;
    const totalSavingsScore = Math.min(savingsHistory.reduce((sum, s) => sum + s.totalSaved, 0) / 10000, 1);
    const durationScore = Math.min(savingsHistory.reduce((sum, s) => sum + s.duration, 0) / 24, 1);

    return (avgConsistency * 0.5) + (totalSavingsScore * 0.3) + (durationScore * 0.2);
  }

  /**
   * Assess trust and participation in community groups
   */
  private calculateGroupTrustScore(groupActivities: GroupActivity[]): number {
    if (groupActivities.length === 0) return 0.3;

    const avgTrustScore = groupActivities.reduce((sum, g) => sum + g.trustRating, 0) / groupActivities.length;
    const avgParticipation = groupActivities.reduce((sum, g) => sum + g.participationRate, 0) / groupActivities.length;
    
    // Leadership bonus
    const leadershipBonus = groupActivities.some(g => g.role === 'leader' || g.role === 'treasurer') ? 0.1 : 0;
    
    // Conflict penalty
    const conflictPenalty = groupActivities.reduce((sum, g) => sum + g.conflictHistory.length, 0) * 0.05;

    return Math.max(0, Math.min(1, (avgTrustScore * 0.6) + (avgParticipation * 0.4) + leadershipBonus - conflictPenalty));
  }

  /**
   * Evaluate social vouching and community endorsements
   */
  private calculateSocialVouchingScore(vouchingRecords: VouchingRecord[]): number {
    if (vouchingRecords.length === 0) return 0.4;

    // Recent vouching (within 6 months) weighted more heavily
    const now = new Date();
    const recentVouching = vouchingRecords.filter(v => 
      (now.getTime() - v.timestamp.getTime()) / (1000 * 60 * 60 * 24 * 30) <= 6
    );

    const voucherQualityScore = recentVouching.reduce((sum, v) => 
      sum + (v.voucherTrustScore * v.relationshipStrength), 0
    ) / Math.max(recentVouching.length, 1);

    const vouchingVolumeScore = Math.min(recentVouching.length / 5, 1);

    return (voucherQualityScore * 0.7) + (vouchingVolumeScore * 0.3);
  }

  /**
   * Score based on demographic factors and verification status
   */
  private calculateDemographicScore(demographic: DemographicInfo): number {
    let score = 0.5; // Base score

    // Age factor (25-55 preferred range)
    if (demographic.age >= 25 && demographic.age <= 55) {
      score += 0.1;
    } else if (demographic.age < 18 || demographic.age > 70) {
      score -= 0.1;
    }

    // Education factor
    const educationScores = { none: 0, primary: 0.05, secondary: 0.1, tertiary: 0.15 };
    score += educationScores[demographic.education] || 0;

    // Income stability (normalized)
    if (demographic.income > 0) {
      score += Math.min(demographic.income / 5000, 0.2);
    }

    // Verification bonus
    if (demographic.phoneVerified) score += 0.05;
    if (demographic.idVerified) score += 0.1;

    return Math.max(0, Math.min(1, score));
  }

  /**
   * Incorporate external credit data if available
   */
  private calculateExternalDataScore(externalData?: ExternalCreditData): number {
    if (!externalData) return 0.5; // Neutral score if no external data

    let score = 0.5;

    if (externalData.mobileMoneyCreditScore) {
      // Normalize mobile money score to 0-1 range
      score += (externalData.mobileMoneyCreditScore / 100) * 0.4;
    }

    if (externalData.governmentIdStatus === 'verified') {
      score += 0.2;
    }

    if (externalData.bankingHistory && externalData.bankingHistory.length > 0) {
      score += 0.2;
    }

    if (externalData.taxPaymentHistory && externalData.taxPaymentHistory.length > 0) {
      score += 0.2;
    }

    return Math.max(0, Math.min(1, score));
  }

  /**
   * Calculate transaction volume growth trend
   */
  private calculateVolumeGrowth(transactions: Transaction[]): number {
    if (transactions.length < 10) return 0.5;

    const sortedTransactions = transactions.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    const halfPoint = Math.floor(sortedTransactions.length / 2);
    
    const firstHalfVolume = sortedTransactions.slice(0, halfPoint).reduce((sum, t) => sum + t.amount, 0);
    const secondHalfVolume = sortedTransactions.slice(halfPoint).reduce((sum, t) => sum + t.amount, 0);

    if (firstHalfVolume === 0) return secondHalfVolume > 0 ? 1 : 0;
    
    const growthRate = (secondHalfVolume - firstHalfVolume) / firstHalfVolume;
    return Math.max(0, Math.min(1, (growthRate + 1) / 2)); // Normalize to 0-1
  }

  /**
   * Determine risk category based on score
   */
  private determineRiskCategory(score: number): 'low' | 'medium' | 'high' {
    if (score >= this.riskThresholds.low) return 'low';
    if (score >= this.riskThresholds.medium) return 'medium';
    return 'high';
  }

  /**
   * Calculate maximum loan amount based on score and data
   */
  private calculateMaxLoanAmount(score: number, data: CreditDataPoint): number {
    const baseAmount = 1000; // Base loan amount in CELO
    const scoreMultiplier = Math.max(0.1, score / 850);
    
    // Consider income and savings
    const incomeMultiplier = Math.min(data.demographicData.income / 1000, 5);
    const savingsMultiplier = Math.min(
      data.savingsHistory.reduce((sum, s) => sum + s.totalSaved, 0) / 500, 3
    );

    return Math.round(baseAmount * scoreMultiplier * Math.max(1, incomeMultiplier) * Math.max(1, savingsMultiplier));
  }

  /**
   * Calculate recommended interest rate
   */
  private calculateRecommendedInterestRate(score: number, riskCategory: 'low' | 'medium' | 'high'): number {
    const baseRate = 0.12; // 12% annual base rate

    switch (riskCategory) {
      case 'low':
        return Math.max(0.08, baseRate - (score - 650) * 0.0001); // 8-12%
      case 'medium':
        return baseRate + (650 - score) * 0.0002; // 12-15%
      case 'high':
        return Math.min(0.25, baseRate + (500 - score) * 0.0005); // 15-25%
      default:
        return baseRate;
    }
  }

  /**
   * Calculate confidence level in the score
   */
  private calculateConfidence(data: CreditDataPoint): number {
    let confidence = 0;
    
    // Data completeness factors
    if (data.transactionHistory.length >= 10) confidence += 0.2;
    if (data.savingsHistory.length > 0) confidence += 0.2;
    if (data.groupParticipation.length > 0) confidence += 0.2;
    if (data.socialVouching.length > 0) confidence += 0.15;
    if (data.demographicData.phoneVerified) confidence += 0.1;
    if (data.demographicData.idVerified) confidence += 0.1;
    if (data.externalData) confidence += 0.05;

    return Math.min(1, confidence);
  }

  /**
   * Automated loan approval decision
   */
  async autoApproveLoan(
    creditScore: CreditScore,
    loanAmount: number,
    loanDuration: number
  ): Promise<{ approved: boolean; reason: string; conditions?: string[] }> {
    const conditions: string[] = [];

    // Basic eligibility checks
    if (creditScore.score < 400) {
      return { approved: false, reason: "Credit score too low for automated approval" };
    }

    if (loanAmount > creditScore.maxLoanAmount) {
      return { approved: false, reason: "Loan amount exceeds maximum approved limit" };
    }

    if (creditScore.confidence < 0.6) {
      return { approved: false, reason: "Insufficient data for automated approval" };
    }

    // Risk-based approval logic
    if (creditScore.riskCategory === 'low') {
      if (loanAmount <= creditScore.maxLoanAmount * 0.8) {
        return { approved: true, reason: "Low risk borrower with reasonable loan amount" };
      } else {
        conditions.push("Requires additional collateral for amounts above 80% of max limit");
        return { approved: true, reason: "Approved with conditions", conditions };
      }
    }

    if (creditScore.riskCategory === 'medium') {
      if (loanAmount <= creditScore.maxLoanAmount * 0.6) {
        conditions.push("Monthly check-ins required");
        conditions.push("Group vouching recommended");
        return { approved: true, reason: "Medium risk approved with monitoring", conditions };
      } else {
        return { approved: false, reason: "Loan amount too high for medium risk category" };
      }
    }

    // High risk - manual approval required
    return { approved: false, reason: "High risk loans require manual review" };
  }
}

// Export singleton instance
export const creditScoring = new AdvancedCreditScoring();
